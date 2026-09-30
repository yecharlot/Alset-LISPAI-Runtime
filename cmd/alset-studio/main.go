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

		sw := `const C='alset-pwa-v4';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./app.alset.json','./manifest.webmanifest','./app-runtime.js?v=4'])));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request)))});`
		_ = os.WriteFile(filepath.Join(appDir, "sw.js"), []byte(sw), 0o644)

		// Copy shared runtime into the app (same painter as Studio preview)
		rtSrc := filepath.Join(root, "runtime", "app-runtime.js")
		if b, err := os.ReadFile(rtSrc); err == nil {
			_ = os.WriteFile(filepath.Join(appDir, "app-runtime.js"), b, 0o644)
		}

		index := fmt.Sprintf(`<!DOCTYPE html>
<html lang="es"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,maximum-scale=1,user-scalable=no"/>
<meta name="theme-color" content="#0b0e14"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="mobile-web-app-capable" content="yes"/>
<link rel="manifest" href="manifest.webmanifest"/>
<title>%s · Alset</title>
<style>
html,body{margin:0;height:100%%;background:#0b0e14;color:#eef1f6;font-family:system-ui,-apple-system,sans-serif;overflow:hidden}
header{padding:10px 14px;border-bottom:1px solid #1e2530;display:flex;gap:10px;align-items:center;flex-wrap:wrap;flex-shrink:0}
header h1{margin:0;font-size:15px;color:#f5c542}
.meta{color:#8b93a7;font-size:11px}
#mount{height:calc(100dvh - 48px);padding:0;display:flex;justify-content:stretch;align-items:stretch;overflow:hidden}
#mount > *{width:100%%;height:100%%}
details{margin:12px;color:#8b93a7;font-size:12px}
pre{background:#0a0d12;padding:10px;border-radius:10px;overflow:auto;font-size:10px;max-height:30vh}
</style>
<script src="app-runtime.js?v=4"></script>
</head><body>
<header>
  <h1>%s</h1>
  <span class="meta">RootCID <code id="cid">…</code></span>
  <span class="meta">offline-first PWA</span>
</header>
<div id="mount"></div>
<details><summary>JSON de la app</summary><pre id="out"></pre></details>
<script>
const mount=document.getElementById('mount');
const out=document.getElementById('out');
fetch('app.alset.json').then(r=>r.json()).then(j=>{
  document.getElementById('cid').textContent=j.rootcid||'—';
  out.textContent=JSON.stringify(j,null,2);
  if(!window.AlsetAppRuntime){
    mount.textContent='Falta app-runtime.js — vuelve a desplegar desde el Studio';
    return;
  }
  const w=window.innerWidth||390;
  const h=window.innerHeight||720;
  let device;
  if(w<600) device={id:'mobile',label:'Móvil',width:w,height:h-48};
  else if(w<1024) device={id:'tablet',label:'Tablet',width:w,height:h-48};
  else device={id:'desktop',label:'Desktop',width:w,height:h-48};
  window.AlsetAppRuntime.mount(mount,{
    device:device,
    tree:j.tree||[],
    states:j.states||{},
    interactive:false,
    mode:'pwa',
    log:function(m){console.log('[alset]',m);}
  });
  window.addEventListener('resize',function(){
    const w2=window.innerWidth||390,h2=window.innerHeight||720;
    let d;
    if(w2<600) d={id:'mobile',label:'Móvil',width:w2,height:h2-48};
    else if(w2<1024) d={id:'tablet',label:'Tablet',width:w2,height:h2-48};
    else d={id:'desktop',label:'Desktop',width:w2,height:h2-48};
    window.AlsetAppRuntime.mount(mount,{device:d,tree:j.tree||[],states:j.states||{},interactive:false,mode:'pwa'});
  });
}).catch(e=>{mount.textContent=String(e);});
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').then(function(reg){
    if(reg.update) reg.update();
  }).catch(function(){});
  // Forzar vista fresca tras deploy (equiv. soft Ctrl+Shift+R del runtime)
  if(sessionStorage.getItem('alset_pwa_boot')!=='1'){
    sessionStorage.setItem('alset_pwa_boot','1');
    if(caches && caches.keys){
      caches.keys().then(function(keys){
        return Promise.all(keys.filter(function(k){return k.indexOf('alset-pwa')===0 && k!=='alset-pwa-v4';}).map(function(k){return caches.delete(k);}));
      }).then(function(){ /* keep first paint */ });
    }
  }
}
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
