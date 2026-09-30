# Alset Studio Desktop (Go)

Binario de escritorio **sin Electron**: el mismo motor Studio en Go + UI web.

## Variante A — sin CGO (recomendada para empezar)

Abre el navegador del sistema apuntando a `127.0.0.1` y deja el proceso vivo (servidor embebido).

```bash
go build -o alset-studio-desktop ./cmd/alset-studio-desktop
./alset-studio-desktop -dir web
# o: ./alset-studio-desktop -dir web -browser
```

Flags:

| Flag | Default | Descripción |
|------|---------|-------------|
| `-addr` | `127.0.0.1:5177` | Solo localhost |
| `-dir` | `web` | Raíz estática (también busca `web` junto al binario) |
| `-data` | `~/.alset-studio` | Apps desplegadas |
| `-browser` | false | Forzar navegador aunque haya webview |

## Variante B — ventana nativa (WebView)

Requiere **CGO** y dependencias del sistema:

- **Linux:** `libgtk-3-dev`, `libwebkit2gtk-4.0-dev` (o 4.1)
- **macOS:** Xcode CLI tools
- **Windows:** WebView2 runtime

```bash
go get github.com/webview/webview_go
go build -tags webview -o alset-studio-desktop ./cmd/alset-studio-desktop
./alset-studio-desktop -dir web
```

Si el webview falla al enlazar, usa la variante A.

## Servidor solo (sin “desktop”)

```bash
go build -o alset-studio ./cmd/alset-studio
./alset-studio -addr :5177 -dir web
```

## Empaquetar para distribución

1. `go build -o alset-studio-desktop ./cmd/alset-studio-desktop`
2. Copia el binario **y** la carpeta `web/` (misma ruta relativa o `-dir`).
3. Opcional: script `.desktop` (Linux) que ejecute el binario.

Electron sigue disponible en `desktop/` si lo prefieres; el camino Go es más liviano y alineado al stack Alset.
