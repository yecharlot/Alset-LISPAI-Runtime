package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func main() {
	addr := flag.String("addr", ":5177", "listen")
	dir := flag.String("dir", "web", "static web root")
	data := flag.String("data", "", "deploy data dir")
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

	mux := http.NewServeMux()
	mux.HandleFunc("/v1/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, map[string]any{
			"ok": true, "service": "alset-lispai-studio",
			"time": time.Now().UTC().Format(time.RFC3339),
			"apps": apps,
		})
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
		if name == "" {
			name = "app"
		}
		name = sanitize(name)
		path := filepath.Join(apps, name+".alset.json")
		raw, _ := json.MarshalIndent(app, "", "  ")
		if err := os.WriteFile(path, raw, 0o644); err != nil {
			writeJSONStatus(w, 500, map[string]any{"error": err.Error()})
			return
		}
		// also write a minimal static index for the app
		appDir := filepath.Join(apps, name)
		_ = os.MkdirAll(appDir, 0o755)
		_ = os.WriteFile(filepath.Join(appDir, "app.alset.json"), raw, 0o644)
		index := fmt.Sprintf(`<!DOCTYPE html><meta charset="utf-8"><title>%s</title>
<pre id="p"></pre><script>
fetch('app.alset.json').then(r=>r.json()).then(j=>{
  document.getElementById('p').textContent=JSON.stringify(j,null,2);
});
</script>`, name)
		_ = os.WriteFile(filepath.Join(appDir, "index.html"), []byte(index), 0o644)

		writeJSON(w, map[string]any{
			"ok": true, "path": path,
			"url": "/apps/" + name + "/",
		})
	})
	mux.Handle("/apps/", http.StripPrefix("/apps/", http.FileServer(http.Dir(apps))))
	mux.Handle("/", http.FileServer(http.Dir(root)))

	fmt.Printf("Alset LISPAI Studio (no-code)\n  web  %s\n  apps %s\n  open http://127.0.0.1%s/\n", root, apps, *addr)
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
