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

		// PWA shell
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
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<meta name="theme-color" content="#09090b"/>
<link rel="manifest" href="manifest.webmanifest"/>
<title>%s</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100dvh; font-family: system-ui, sans-serif;
    background: #09090b; color: #f4f4f5; }
  header { padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,.08);
    display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  header strong { color: #f5c542; letter-spacing: .06em; font-size: 13px; }
  #boot-status { font-size: 11px; color: #a1a1aa; }
  #app { padding: 12px; min-height: 60dvh; }
  #run-log { margin: 0; padding: 8px 16px; font-size: 11px; color: #71717a;
    max-height: 80px; overflow: auto; border-top: 1px solid rgba(255,255,255,.06); }
  .preview-host { padding: 8px; }
  .device-frame { border: none !important; box-shadow: none !important; }
  .device-label { display: none; }
</style>
</head>
<body>
<header>
  <strong>%s</strong>
  <span id="boot-status">cargando…</span>
</header>
<div id="app"></div>
<pre id="run-log"></pre>
<script type="module" src="/studio/deploy-runner.js"></script>
</body>
</html>`, name, name)
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
