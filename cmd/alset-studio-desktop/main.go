// Alset Studio Desktop — ventana nativa (webview) o navegador del sistema.
//
// Build con ventana nativa (requiere CGO + libgtk/webkit en Linux):
//
//	go build -tags webview -o alset-studio-desktop ./cmd/alset-studio-desktop
//
// Build sin CGO (abre el navegador por defecto; sigue siendo “app de escritorio” local):
//
//	CGO_ENABLED=0 go build -o alset-studio-desktop ./cmd/alset-studio-desktop
package main

import (
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"net/url"
	"path/filepath"
	"runtime"
	"time"

	"github.com/yecharlot/Alset-LISPAI-Runtime/internal/studioserver"
)

func main() {
	addr := flag.String("addr", "127.0.0.1:5177", "listen (solo localhost recomendado)")
	dir := flag.String("dir", "web", "web root")
	data := flag.String("data", "", "data dir")
	browser := flag.Bool("browser", false, "forzar navegador del sistema (sin webview)")
	flag.Parse()

	webRoot := *dir
	if !filepath.IsAbs(webRoot) {
		// Junto al binario o cwd
		if exe, err := os.Executable(); err == nil {
			cand := filepath.Join(filepath.Dir(exe), "web")
			if st, err := os.Stat(cand); err == nil && st.IsDir() {
				webRoot = cand
			}
		}
	}

	go func() {
		if err := studioserver.Run(*addr, webRoot, *data); err != nil {
			log.Printf("servidor: %v", err)
			os.Exit(1)
		}
	}()

	url := "http://" + *addr + "/"
	if err := waitHTTP(url, 8*time.Second); err != nil {
		log.Fatalf("Studio no respondió en %s: %v", url, err)
	}
	fmt.Println("Alset Studio Desktop →", url)

	if *browser || !openWebView(url) {
		if err := openSystemBrowser(url); err != nil {
			log.Fatalf("no se pudo abrir UI: %v", err)
		}
		// Mantener vivo el proceso mientras el servidor corre
		select {}
	}
}

func waitHTTP(url string, d time.Duration) error {
	deadline := time.Now().Add(d)
	for time.Now().Before(deadline) {
		c, err := net.DialTimeout("tcp", httpHostPort(url), 300*time.Millisecond)
		if err == nil {
			c.Close()
			resp, err := http.Get(url)
			if err == nil {
				resp.Body.Close()
				if resp.StatusCode < 500 {
					return nil
				}
			}
		}
		time.Sleep(150 * time.Millisecond)
	}
	return fmt.Errorf("timeout")
}

func httpHostPort(raw string) string {
	u, err := url.Parse(raw)
	if err != nil || u.Host == "" {
		return "127.0.0.1:5177"
	}
	return u.Host
}

// openSystemBrowser prefiere Chromium/Chrome/Edge en modo app + maximizado
// (experiencia casi a pantalla completa, sin pestañas del navegador).
func openSystemBrowser(url string) error {
	candidates := chromeAppCommands(url)
	for _, c := range candidates {
		if err := c.Start(); err == nil {
			log.Println("UI en modo app:", c.Path)
			return nil
		}
	}
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	case "darwin":
		cmd = exec.Command("open", "-a", "Google Chrome", "--args", "--app="+url, "--start-maximized")
		if err := cmd.Start(); err == nil {
			return nil
		}
		cmd = exec.Command("open", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	return cmd.Start()
}

func chromeAppCommands(url string) []*exec.Cmd {
	args := []string{"--app=" + url, "--start-maximized", "--start-fullscreen"}
	names := []string{}
	switch runtime.GOOS {
	case "windows":
		names = []string{
			`C:\Program Files\Google\Chrome\Application\chrome.exe`,
			`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`,
		}
	case "darwin":
		return nil // se maneja en openSystemBrowser
	default:
		names = []string{
			"google-chrome", "google-chrome-stable", "chromium", "chromium-browser",
			"microsoft-edge", "brave-browser",
		}
	}
	var out []*exec.Cmd
	for _, n := range names {
		c := exec.Command(n, args...)
		out = append(out, c)
	}
	return out
}
