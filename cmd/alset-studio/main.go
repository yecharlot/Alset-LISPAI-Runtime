// Command alset-studio serves the Alset-LISPAI Studio (static ES modules, no npm).
package main

import (
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	addr := flag.String("addr", ":5177", "listen address")
	dir := flag.String("dir", "", "web root (default: ./web next to module)")
	flag.Parse()

	root := *dir
	if root == "" {
		// try relative to executable / cwd
		candidates := []string{"web", filepath.Join("..", "web"), filepath.Join("..", "..", "web")}
		if exe, err := os.Executable(); err == nil {
			candidates = append([]string{filepath.Join(filepath.Dir(exe), "web")}, candidates...)
		}
		for _, c := range candidates {
			if st, err := os.Stat(c); err == nil && st.IsDir() {
				root, _ = filepath.Abs(c)
				break
			}
		}
	}
	if root == "" {
		log.Fatal("no se encontró carpeta web/; use -dir")
	}

	fmt.Printf("Alset LISPAI Studio\n")
	fmt.Printf("  root  %s\n", root)
	fmt.Printf("  open  http://127.0.0.1%s/\n", *addr)
	fmt.Printf("  sin npm · módulos ES · LispAI + Alset-JS\n")

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir(root)))
	// SPA-ish: missing files 404 as-is
	_ = fs.ValidPath
	log.Fatal(http.ListenAndServe(*addr, mux))
}
