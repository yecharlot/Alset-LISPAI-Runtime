# Alset Studio (LISPAI Runtime)

No-code studio with **error sandbox**, drag-drop toolbox, multi-device preview (hot-reload), LispAI editor, REST + auth tokens, PWA deploy (opens final app tab), RootCID.

```bash
go run ./cmd/alset-studio -addr :5177 -dir web
```

Open http://127.0.0.1:5177/

## Docs

- **[Manual (ES)](docs/MANUAL.es.md)** — de 0 a 100
- **[Manual (EN)](docs/MANUAL.en.md)**
- [LispAI forms](docs/LISPAI_FORMS.md)
- [Vision ES](docs/VISION.es.md) · [EN](docs/VISION.en.md)

## Alset-JS bridge

Preview uses native `alsetState`, `Column`/`Row`/`Text`/`Button`/`Input`/`Card`. Format `alset-app/v1`.

## LispAI

- Patches: `(set-prop n1 text "Hola")`
- Full trees: `(ui (column (row (button "A") (button "B"))))`
- Roles: `(login-token …)` · `(auth-gate (role "admin") …)`

## Safety

- `window.error` / unhandledrejection trapped  
- Render budget reports slow trees  
- Row stays horizontal after clicks (unless `wrap`)

## Deploy

**Desplegar PWA** → `/apps/<name>/` + new browser tab with the final app.
