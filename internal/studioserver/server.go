package studioserver

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/yecharlot/Alset-LISPAI-Runtime/internal/mininode"
)

type dataStore struct {
	mu    sync.Mutex
	items []map[string]any
	seq   int
}

// Run arranca el servidor HTTP de Alset Studio (bloqueante).
// addr: ":5177" o "127.0.0.1:5177"; dir: raíz web; dataDir: apps persistentes (vacío = ~/.alset-studio).
func Run(addr, dir, dataDir string) error {
	if addr == "" {
		addr = "127.0.0.1:5177"
	}
	if dir == "" {
		dir = "web"
	}
	mini := mininode.New()

	root, _ := filepath.Abs(dir)
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

		// --- Alset-JS native apps (source code, not Studio tree) ---
		if kind, _ := app["kind"].(string); kind == "alset-js" || kind == "js" {
			src, _ := app["source"].(string)
			if src == "" {
				src, _ = app["code"].(string)
			}
			if src == "" {
				writeJSONStatus(w, 400, map[string]any{"error": "alset-js deploy requires source/code"})
				return
			}
			_ = os.WriteFile(filepath.Join(appDir, "app.js"), []byte(src), 0o644)
			coreSrc := filepath.Join(root, "alset", "AlsetPulseCore.js")
			if b, err := os.ReadFile(coreSrc); err == nil {
				_ = os.WriteFile(filepath.Join(appDir, "AlsetPulseCore.js"), b, 0o644)
			}
			mnSrc := filepath.Join(root, "runtime", "mininode.js")
			if b, err := os.ReadFile(mnSrc); err == nil {
				_ = os.WriteFile(filepath.Join(appDir, "mininode.js"), b, 0o644)
			}
			jsIndex := "<!DOCTYPE html>\n<html lang=\"es\"><head>\n<meta charset=\"utf-8\"/>\n" +
				"<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\"/>\n" +
				"<meta name=\"theme-color\" content=\"#050505\"/>\n" +
				"<meta name=\"alset-app\" content=\"" + name + "\"/>\n" +
				"<meta name=\"alset-kind\" content=\"alset-js\"/>\n" +
				"<meta name=\"alset-ans\" content=\"" + name + ".app.ans\"/>\n" +
				"<link rel=\"manifest\" href=\"./manifest.webmanifest\"/>\n" +
				"<link rel=\"stylesheet\" href=\"https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css\"/>\n" +
				"<title>" + name + "</title>\n" +
				"<style>html,body{margin:0;height:100%;background:#050505;color:#fff;font-family:system-ui,sans-serif}#root{min-height:100dvh}</style>\n" +
				"</head><body>\n<div id=\"root\"></div>\n<script src=\"./mininode.js\"></script>\n" +
				"<script type=\"module\" src=\"./app-boot.js\"></script>\n</body></html>\n"
			boot := "import * as Core from './AlsetPulseCore.js';\n" +
				"const { alsetState, Column, Row, Text, Button, Card, Spacer, mod, MapNode, Theme, Icon, Input, List, Image, Router, navigateTo, currentRoute, Animate, createToast, FloatingButton, GradientLayer, LoginForm, RegisterForm, AudioNode, VideoNode } = Core;\n" +
				"const root = document.getElementById('root');\n" +
				"const src = await fetch('./app.js').then(r => r.text());\n" +
				"try {\n" +
				"  const fn = new Function('alsetState','Column','Row','Text','Button','Card','Spacer','mod','MapNode','Theme','Icon','Input','List','Image','Router','navigateTo','currentRoute','Animate','createToast','FloatingButton','GradientLayer','LoginForm','RegisterForm','AudioNode','VideoNode','root','Core', src + \"\\n;\\nif (typeof App === 'function') { const v = App(); if (v && root) root.appendChild(v); }\");\n" +
				"  fn(alsetState, Column, Row, Text, Button, Card, Spacer, mod, MapNode, Theme, Icon, Input, List, Image, Router, navigateTo, currentRoute, Animate, createToast, FloatingButton, GradientLayer, LoginForm, RegisterForm, AudioNode, VideoNode, root, Core);\n" +
				"} catch (e) {\n" +
				"  root.innerHTML = '<pre style=\"color:#f88;padding:16px\">Error: ' + (e && e.message ? e.message : e) + '</pre>';\n" +
				"  console.error(e);\n" +
				"}\n"
			_ = os.WriteFile(filepath.Join(appDir, "index.html"), []byte(jsIndex), 0o644)
			_ = os.WriteFile(filepath.Join(appDir, "app-boot.js"), []byte(boot), 0o644)
			man := fmt.Sprintf("{\"name\":%q,\"short_name\":%q,\"start_url\":\"./\",\"display\":\"standalone\",\"background_color\":\"#050505\",\"theme_color\":\"#050505\",\"lang\":\"es\"}", name, name)
			_ = os.WriteFile(filepath.Join(appDir, "manifest.webmanifest"), []byte(man), 0o644)
			writeJSON(w, map[string]any{
				"ok": true, "name": name, "kind": "alset-js", "rootcid": rootcid,
				"url": "/apps/" + name + "/", "pwa": true, "ans": name + ".app.ans",
			})
			return
		}

		manifest := fmt.Sprintf(`{
  "name": %q,
  "short_name": %q,
  "start_url": "./",
  "display": "standalone",
  "background_color": "#0b0e14",
  "theme_color": "#0b0e14",
  "lang": "es"
}`, name)
		_ = os.WriteFile(filepath.Join(appDir, "manifest.webmanifest"), []byte(manifest), 0o644)

		sw := `const C='alset-pwa-v4';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./app.alset.json','./manifest.webmanifest','./app-runtime.js?v=10','./alset-lisp-engine.js','./mininode.js'])));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request)))});`
		_ = os.WriteFile(filepath.Join(appDir, "sw.js"), []byte(sw), 0o644)

		// Copy shared runtime into the app (same painter as Studio preview)
		rtSrc := filepath.Join(root, "runtime", "app-runtime.js")
		mnSrc := filepath.Join(root, "runtime", "mininode.js")
		lispSrc := filepath.Join(root, "runtime", "alset-lisp-engine.js")
		if b, err := os.ReadFile(rtSrc); err == nil {
			_ = os.WriteFile(filepath.Join(appDir, "app-runtime.js"), b, 0o644)
		}
		if b, err := os.ReadFile(mnSrc); err == nil {
			_ = os.WriteFile(filepath.Join(appDir, "mininode.js"), b, 0o644)
		}
		if b, err := os.ReadFile(lispSrc); err == nil {
			_ = os.WriteFile(filepath.Join(appDir, "alset-lisp-engine.js"), b, 0o644)
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
html,body{margin:0;width:100%%;height:100%%;height:100dvh;background:#0b0e14;color:#eef1f6;font-family:system-ui,-apple-system,sans-serif;overflow:hidden}
#mount{position:fixed;inset:0;width:100%%;height:100%%;height:100dvh;padding:0;margin:0;display:flex;overflow:hidden}
#mount > *{width:100%%!important;height:100%%!important;max-width:100%%!important;border:0!important;border-radius:0!important}
</style>
<script src="alset-lisp-engine.js"></script>
<script src="mininode.js"></script>
<script src="app-runtime.js?v=10"></script>
</head><body>
<div id="mount" role="main"></div>
<script>
const mount=document.getElementById('mount');
fetch('app.alset.json').then(r=>r.json()).then(j=>{
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
</body></html>`, name)
		_ = os.WriteFile(filepath.Join(appDir, "index.html"), []byte(index), 0o644)


		writeJSON(w, map[string]any{
			"ok": true, "path": path, "rootcid": rootcid,
			"url": "/apps/" + name + "/", "pwa": true,
		})
	})

	
	// SSE pulse bus (Studio lite — genes/vistas por key)
	type pulseMsg struct {
		Key   string         `json:"key"`
		View  string         `json:"view,omitempty"`
		State map[string]any `json:"state,omitempty"`
		At    string         `json:"at"`
		Text  string         `json:"text,omitempty"`
	}
	var (
		pulseMu   sync.Mutex
		pulseSubs = map[chan pulseMsg]struct{}{}
		pulseLast pulseMsg
	)
	publishPulse := func(m pulseMsg) {
		pulseMu.Lock()
		pulseLast = m
		for ch := range pulseSubs {
			select {
			case ch <- m:
			default:
			}
		}
		pulseMu.Unlock()
	}
	mux.HandleFunc("/api/pulse", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			var body pulseMsg
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				writeJSONStatus(w, 400, map[string]any{"error": err.Error()})
				return
			}
			if body.At == "" {
				body.At = time.Now().UTC().Format(time.RFC3339)
			}
			publishPulse(body)
			writeJSON(w, map[string]any{"ok": true, "published": body})
			return
		}
		// GET: last snapshot or SSE if Accept text/event-stream
		if strings.Contains(r.Header.Get("Accept"), "text/event-stream") {
			flusher, ok := w.(http.Flusher)
			if !ok {
				http.Error(w, "no flush", 500)
				return
			}
			w.Header().Set("Content-Type", "text/event-stream")
			w.Header().Set("Cache-Control", "no-cache")
			w.Header().Set("Connection", "keep-alive")
			ch := make(chan pulseMsg, 8)
			pulseMu.Lock()
			pulseSubs[ch] = struct{}{}
			last := pulseLast
			pulseMu.Unlock()
			defer func() {
				pulseMu.Lock()
				delete(pulseSubs, ch)
				pulseMu.Unlock()
				close(ch)
			}()
			if last.At != "" {
				b, _ := json.Marshal(last)
				fmt.Fprintf(w, "data: %s\n\n", b)
				flusher.Flush()
			}
			ticker := time.NewTicker(15 * time.Second)
			defer ticker.Stop()
			ctx := r.Context()
			for {
				select {
				case <-ctx.Done():
					return
				case m := <-ch:
					b, _ := json.Marshal(m)
					fmt.Fprintf(w, "data: %s\n\n", b)
					flusher.Flush()
				case <-ticker.C:
					fmt.Fprintf(w, ": ping\n\n")
					flusher.Flush()
				}
			}
		}
		pulseMu.Lock()
		last := pulseLast
		pulseMu.Unlock()
		writeJSON(w, map[string]any{"ok": true, "last": last, "subs": len(pulseSubs)})
	})

	// MCP-lite: tools discovery for external AI models (optional in apps)
	mux.HandleFunc("/mcp/tools", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, map[string]any{
			"ok": true,
			"protocol": "alset-mcp-lite",
			"tools": []map[string]any{
				{"name": "list_apps", "description": "Lista apps desplegadas en Studio", "input": map[string]any{}},
				{"name": "get_tree", "description": "Obtiene el árbol de nodos de una app", "input": map[string]any{"app": "string"}},
				{"name": "pulse_publish", "description": "Publica un mensaje al bus /api/pulse", "input": map[string]any{"key": "string", "state": "object"}},
				{"name": "rest_proxy", "description": "Proxy GET/POST a /v1/data", "input": map[string]any{"method": "GET|POST", "body": "object"}},
			},
		})
	})
	mux.HandleFunc("/mcp/call", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", 405)
			return
		}
		var body struct {
			Tool string         `json:"tool"`
			Args map[string]any `json:"args"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeJSONStatus(w, 400, map[string]any{"error": err.Error()})
			return
		}
		switch body.Tool {
		case "list_apps":
			ents, _ := os.ReadDir(apps)
			names := []string{}
			for _, e := range ents {
				if e.IsDir() {
					names = append(names, e.Name())
				}
			}
			writeJSON(w, map[string]any{"ok": true, "apps": names})
		case "pulse_publish":
			m := pulseMsg{Key: fmt.Sprint(body.Args["key"]), At: time.Now().UTC().Format(time.RFC3339)}
			if st, ok := body.Args["state"].(map[string]any); ok {
				m.State = st
			}
			if m.Key == "" {
				m.Key = "studio"
			}
			publishPulse(m)
			writeJSON(w, map[string]any{"ok": true, "published": m})
		case "rest_proxy":
			writeJSON(w, map[string]any{"ok": true, "hint": "use /v1/data directly from the app rest-consumer"})
		default:
			writeJSONStatus(w, 404, map[string]any{"error": "unknown tool", "tool": body.Tool})
		}
	})


	
	// MiniNode Alset embebido (Mind · Zyrion · LispAI · mesh)
	mux.HandleFunc("/api/node/info", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, mini.Info())
	})
	mux.HandleFunc("/api/v2/info", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, mini.Info())
	})
	mux.HandleFunc("/api/mind/tick", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", 405)
			return
		}
		var body struct {
			Text string `json:"text"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeJSONStatus(w, 400, map[string]any{"error": err.Error()})
			return
		}
		res := mini.MindTick(body.Text)
		writeJSON(w, res)
	})
	mux.HandleFunc("/api/mind/memory", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write(mini.MemoryJSON())
	})
	mux.HandleFunc("/api/lispai", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", 405)
			return
		}
		var body struct {
			Cmd string `json:"cmd"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeJSONStatus(w, 400, map[string]any{"error": err.Error()})
			return
		}
		writeJSON(w, mini.LispEval(body.Cmd))
	})
	mux.HandleFunc("/api/zyrion", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", 405)
			return
		}
		var body struct {
			Env    map[string]float64 `json:"env"`
			Labels map[string]string  `json:"labels"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeJSONStatus(w, 400, map[string]any{"error": err.Error()})
			return
		}
		if body.Labels == nil {
			body.Labels = map[string]string{"0": "SEGUIR", "1": "MATIZAR", "2": "SUMIDERO"}
		}
		writeJSON(w, mininode.EvalZyrionSimple(body.Env, body.Labels))
	})
	mux.HandleFunc("/api/mesh/announce", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", 405)
			return
		}
		var body struct {
			ID      string `json:"id"`
			Name    string `json:"name"`
			Payload string `json:"payload"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		mini.Announce(body.ID, body.Name, body.Payload)
		writeJSON(w, map[string]any{"ok": true, "peers": mini.ListPeers()})
	})
	mux.HandleFunc("/api/mesh/peers", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, map[string]any{"ok": true, "peers": mini.ListPeers(), "self": mini.PeerID})
	})


	mux.Handle("/apps/", http.StripPrefix("/apps/", http.FileServer(http.Dir(apps))))
	mux.Handle("/", http.FileServer(http.Dir(root)))

		
	host := addr
	if strings.HasPrefix(host, ":") {
		host = "127.0.0.1" + host
	}
	fmt.Printf("Alset Studio\n  web %s\n  apps %s\n  http://%s/\n", root, apps, host)
	return http.ListenAndServe(addr, mux)
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
