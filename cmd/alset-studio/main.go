package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

type dataStore struct {
	mu    sync.Mutex
	items []map[string]any
	seq   int
}

func main() {
	addr := flag.String("addr", ":5177", "listen")
	dir := flag.String("dir", "web", "web root")
	data := flag.String("data", "", "data dir")
	flag.Parse()

	root, _ := filepath.Abs(*dir)
	dataDir := *data
	if dataDir == "" {
		home, _ := os.UserHomeDir()
		if home == "" {
			home = "/tmp"
		}
		dataDir = filepath.Join(home, ".alset-studio")
	}
	apps := filepath.Join(dataDir, "apps")
	_ = os.MkdirAll(apps, 0o755)

	store := &dataStore{items: []map[string]any{}}

	mux := http.NewServeMux()
	mux.HandleFunc("/v1/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, map[string]any{
			"ok": true, "service": "alset-lispai-studio",
			"time": time.Now().UTC().Format(time.RFC3339),
			"apps": apps, "backend": "alset-lite",
		})
	})

	// Fullstack lite backend
	mux.HandleFunc("/v1/data", func(w http.ResponseWriter, r *http.Request) {
		store.mu.Lock()
		defer store.mu.Unlock()
		switch r.Method {
		case http.MethodGet:
			writeJSON(w, map[string]any{"items": store.items, "count": len(store.items)})
		case http.MethodPost:
			var body map[string]any
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				writeJSONStatus(w, 400, map[string]any{"error": err.Error()})
				return
			}
			store.seq++
			body["id"] = store.seq
			body["at"] = time.Now().UTC().Format(time.RFC3339)
			store.items = append(store.items, body)
			writeJSON(w, map[string]any{"items": store.items, "count": len(store.items)})
		case http.MethodDelete:
			store.items = nil
			store.seq = 0
			writeJSON(w, map[string]any{"items": []any{}, "count": 0})
		default:
			http.Error(w, "method", 405)
		}
	})

	// Users / roles (Alset-style tokens lite)
	type userRec struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	users := map[string]userRec{
		"admin":  {Username: "admin", Password: "admin123", Role: "admin"},
		"demo":   {Username: "demo", Password: "demo123", Role: "user"},
		"master": {Username: "master", Password: "master123", Role: "master"},
	}
	tokens := map[string]userRec{}

	mux.HandleFunc("/v1/auth/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", 405)
			return
		}
		var body struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeJSONStatus(w, 400, map[string]any{"error": err.Error()})
			return
		}
		u, ok := users[strings.ToLower(strings.TrimSpace(body.Username))]
		if !ok || u.Password != body.Password {
			writeJSONStatus(w, 401, map[string]any{"error": "credenciales inválidas"})
			return
		}
		tok := fmt.Sprintf("tok_%x", sha256.Sum256([]byte(u.Username+u.Role+time.Now().String())))
		tok = tok[:20]
		tokens[tok] = u
		writeJSON(w, map[string]any{
			"ok": true, "token": tok, "username": u.Username, "role": u.Role,
			"views": roleViews(u.Role),
		})
	})
	mux.HandleFunc("/v1/auth/me", func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		tok := strings.TrimPrefix(auth, "Bearer ")
		u, ok := tokens[tok]
		if !ok {
			writeJSONStatus(w, 401, map[string]any{"error": "no autorizado"})
			return
		}
		writeJSON(w, map[string]any{"username": u.Username, "role": u.Role, "views": roleViews(u.Role)})
	})
	mux.HandleFunc("/v1/auth/users", func(w http.ResponseWriter, r *http.Request) {
		list := []map[string]any{}
		for _, u := range users {
			list = append(list, map[string]any{"username": u.Username, "role": u.Role})
		}
		writeJSON(w, map[string]any{"users": list})
	})

	mux.HandleFunc("/v1/deploy", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", 405)
			return
		}
		var app map[string]any
		if err := json.NewDecoder(r.Body).Decode(&app); err != nil {
			writeJSONStatus(w, 400, map[string]any{"error": err.Error()})
			return
		}
		name, _ := app["name"].(string)
		name = sanitize(name)
		raw, _ := json.MarshalIndent(app, "", "  ")
		sum := sha256.Sum256(raw)
		rootcid := "cid:alset:" + hex.EncodeToString(sum[:12])
		app["rootcid"] = rootcid
		raw, _ = json.MarshalIndent(app, "", "  ")

		path := filepath.Join(apps, name+".alset.json")
		_ = os.WriteFile(path, raw, 0o644)
		appDir := filepath.Join(apps, name)
		_ = os.MkdirAll(appDir, 0o755)
		_ = os.WriteFile(filepath.Join(appDir, "app.alset.json"), raw, 0o644)

		manifest := fmt.Sprintf(`{
  "name": %q,
  "short_name": %q,
  "start_url": "./",
  "display": "standalone",
  "background_color": "#0b0e14",
  "theme_color": "#0b0e14",
  "lang": "es"
}`, name, name)
		_ = os.WriteFile(filepath.Join(appDir, "manifest.webmanifest"), []byte(manifest), 0o644)

		sw := `const C='alset-app-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./app.alset.json','./manifest.webmanifest'])));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request)))});`
		_ = os.WriteFile(filepath.Join(appDir, "sw.js"), []byte(sw), 0o644)

		index := fmt.Sprintf(`<!DOCTYPE html>
<html lang="es"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="theme-color" content="#0b0e14"/>
<link rel="manifest" href="manifest.webmanifest"/>
<title>%s · Alset</title>
<style>
:root{--bg:#0b0e14;--card:#12171f;--gold:#e8c547;--text:#eef1f6;--muted:#8b93a7}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100dvh}
header{padding:14px 18px;border-bottom:1px solid #1e2530;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
header h1{margin:0;font-size:16px;color:var(--gold)}
.meta{color:var(--muted);font-size:12px}
main{padding:16px;max-width:960px;margin:0 auto}
.row{display:flex;flex-direction:row;flex-wrap:nowrap;gap:10px;align-items:center;margin:8px 0}
.col{display:flex;flex-direction:column;gap:10px}
.card{background:var(--card);border-radius:12px;padding:14px}
.btn{appearance:none;border:0;background:var(--gold);color:#111;font-weight:700;padding:10px 16px;border-radius:10px;cursor:pointer;white-space:nowrap;flex-shrink:0}
pre{background:#0a0d12;padding:12px;border-radius:10px;overflow:auto;font-size:11px;max-height:40vh}
</style></head><body>
<header>
  <h1>%s</h1>
  <span class="meta">RootCID <code id="cid">…</code></span>
  <span class="meta">PWA · Alset Studio</span>
</header>
<main>
  <div class="card col" id="app-root"><p class="meta">Cargando…</p></div>
  <details class="card" style="margin-top:14px"><summary class="meta">JSON de la app</summary><pre id="out"></pre></details>
</main>
<script>
const root=document.getElementById('app-root');
const out=document.getElementById('out');
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
function renderNode(n,parent,depth){
  if(!n|| (depth||0)>30)return;
  depth=(depth||0)+1;
  const p=n.props||{};
  const kids=(host)=>(n.children||[]).forEach(c=>renderNode(c,host,depth));
  if(n.type==='row'){
    const r=el('div','row');parent.appendChild(r);kids(r);return;
  }
  if(n.type==='column'||n.type==='card'||String(n.type).startsWith('anim-')){
    const c=el('div',n.type==='card'?'card col':'col');parent.appendChild(c);kids(c);return;
  }
  if(n.type==='button'){
    const b=el('button','btn',p.text||'OK');b.onclick=()=>alert(p.action||p.text||'click');parent.appendChild(b);return;
  }
  if(n.type==='text'){
    const t=el('div','',p.text||'');
    if(p.size)t.style.fontSize=(Number(p.size)||16)+'px';
    if(p.weight==='bold'||p.weight==='700')t.style.fontWeight='700';
    if(p.color==='primary')t.style.color='var(--gold)';
    if(p.color==='muted')t.style.color='var(--muted)';
    parent.appendChild(t);return;
  }
  if(n.type==='hero'){
    const box=el('div','card col');
    const t=el('div','',p.title||'Hero');t.style.fontSize='22px';t.style.fontWeight='800';t.style.color='var(--gold)';
    box.appendChild(t);
    if(p.subtitle){const s=el('div','meta',p.subtitle);box.appendChild(s);}
    parent.appendChild(box);return;
  }
  if(n.type==='metric'){
    const box=el('div','card col');
    box.appendChild(el('div','meta',p.title||'KPI'));
    const v=el('div','',String(p.value??'—'));v.style.fontSize='22px';v.style.fontWeight='700';v.style.color='var(--gold)';
    box.appendChild(v);
    if(p.hint)box.appendChild(el('div','meta',p.hint));
    parent.appendChild(box);return;
  }
  if(n.type==='badge'){
    const t=el('span','',p.text||'BADGE');t.style.cssText='display:inline-block;padding:2px 8px;border-radius:999px;background:rgba(52,211,153,0.15);color:#34d399;font-size:11px;font-weight:700';
    parent.appendChild(t);return;
  }
  if(n.type==='nav'){
    const r=el('div','row');
    String(p.tabs||'A,B').split(',').map(s=>s.trim()).filter(Boolean).forEach(tab=>{
      const b=el('button','btn',tab);b.onclick=()=>{};r.appendChild(b);
    });
    parent.appendChild(r);return;
  }
  if(n.type==='input'||n.type==='textarea'||n.type==='form-search'){
    const i=document.createElement(n.type==='textarea'?'textarea':'input');
    i.placeholder=p.placeholder||'';
    if(n.type!=='textarea')i.type=p.type||'text';
    i.style.cssText='width:100%%;padding:10px;border-radius:8px;border:1px solid #2a3344;background:#0a0d12;color:#fff';
    parent.appendChild(i);return;
  }
  if(n.type==='image'){
    if(p.src){const img=document.createElement('img');img.src=p.src;img.alt=p.alt||'';img.style.maxWidth='100%%';img.style.maxHeight=(p.height||120)+'px';parent.appendChild(img);}
    else parent.appendChild(el('div','meta','(imagen)'));
    return;
  }
  if(n.type==='spacer'){const d=el('div');d.style.height=(p.size||12)+'px';parent.appendChild(d);return;}
  if(n.type==='api'||n.type==='api-post'){
    const box=el('div','card col');
    box.appendChild(el('div','meta',(n.type==='api'?'GET ':'POST ')+(p.url||'')+' → '+(p.state||'')));
    if(n.type==='api'&&p.auto&&p.url){
      fetch(p.url).then(r=>r.json()).then(j=>{
        const pre=el('pre','',JSON.stringify(j,null,2));box.appendChild(pre);
      }).catch(e=>box.appendChild(el('div','meta',String(e))));
    }
    parent.appendChild(box);return;
  }
  if(n.type==='list'||n.type==='table'){
    parent.appendChild(el('div','meta',n.type+' · state '+(p.state||'—')+(p.columns?' · '+p.columns:'')));return;
  }
  if(n.type==='form-login'||n.type==='form-register'||n.type==='form-contact'||n.type==='login-token'){
    const box=el('div','card col');
    box.appendChild(el('div','',p.title||n.type)).style.fontWeight='700';
    const fields=n.type==='form-contact'?[['email','email'],['msg','mensaje']]:[['user','usuario'],['pass','clave']];
    fields.forEach(([name,ph])=>{
      const i=document.createElement('input');i.placeholder=ph;if(name==='pass')i.type='password';
      i.style.cssText='width:100%%;padding:10px;border-radius:8px;border:1px solid #2a3344;background:#0a0d12;color:#fff';
      box.appendChild(i);
    });
    box.appendChild(el('button','btn',p.button||'Enviar'));
    parent.appendChild(box);return;
  }
  if(n.type==='auth-gate'||n.type==='gate'){
    const box=el('div','card col');box.appendChild(el('div','meta','gate · '+(p.role||'user')));kids(box);parent.appendChild(box);return;
  }
  if(n.type==='select'||n.type==='checkbox'||n.type==='switch'){
    parent.appendChild(el('div','meta',(p.label||n.type)+' · '+(p.options||p.state||'')));return;
  }
  if(n.type==='state'||n.type==='persist'||n.type==='ipfs'||n.type==='agent'||n.type==='role-badge'){
    parent.appendChild(el('div','meta',n.type+' '+(p.name||p.key||p.cid||p.text||'')));return;
  }
  const d=el('div','meta',n.type);parent.appendChild(d);kids(d);
}
fetch('app.alset.json').then(r=>r.json()).then(j=>{
  document.getElementById('cid').textContent=j.rootcid||'—';
  out.textContent=JSON.stringify(j,null,2);
  root.innerHTML='';
  const tree=j.tree||[];
  if(!tree.length)root.appendChild(el('p','meta','Árbol vacío'));
  else tree.forEach(n=>renderNode(n,root,0));
}).catch(e=>{root.textContent=String(e)});
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
</script>
</body></html>`, name, name)
		_ = os.WriteFile(filepath.Join(appDir, "index.html"), []byte(index), 0o644)

		writeJSON(w, map[string]any{
			"ok": true, "path": path, "rootcid": rootcid,
			"url": "/apps/" + name + "/", "pwa": true,
		})
	})

	mux.Handle("/apps/", http.StripPrefix("/apps/", http.FileServer(http.Dir(apps))))
	mux.Handle("/", http.FileServer(http.Dir(root)))

	fmt.Printf("Alset Studio\n  web %s\n  apps %s\n  http://127.0.0.1%s/\n", root, apps, *addr)
	log.Fatal(http.ListenAndServe(*addr, mux))
}

func roleViews(role string) []string {
	switch role {
	case "master", "admin":
		return []string{"dashboard", "data", "users", "settings", "deploy"}
	case "operator":
		return []string{"dashboard", "data"}
	case "user":
		return []string{"dashboard"}
	default:
		return []string{}
	}
}

func sanitize(s string) string {
	s = strings.ToLower(s)
	var b strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			b.WriteRune(r)
		}
	}
	if b.Len() == 0 {
		return "app"
	}
	return b.String()
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	enc := json.NewEncoder(w)
	enc.SetIndent("", "  ")
	_ = enc.Encode(v)
}

func writeJSONStatus(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}
