# Alset Studio (LISPAI Runtime)

No-code studio with **error sandbox** (does not freeze the host PC), drag-drop toolbox, multi-device preview, forms, REST backend, PWA deploy, RootCID, LispAI safe patches.

```bash
go run ./cmd/alset-studio -addr :5177 -dir web
```

Open http://127.0.0.1:5177/

## Alset-JS bridge

Preview uses **native `alsetState`**, `Column`/`Row`/`Text`/`Button`/`Input`/`Card`/`Animate` via `alsetMount`. Format `alset-app/v1` unchanged.

## Safety

- `window.error` / unhandledrejection trapped
- Render budget (~80ms) reports slow trees
- Lisp editor only applies `(set-prop id key "value")` by default
- Inputs update state without rebuilding the whole canvas on each keystroke

## Deploy

**Desplegar PWA** → `/apps/<name>/` with manifest + service worker + `rootcid`.


## Manuals

- [Español](docs/Manual.es.md)
- [English](docs/Manual.en.md)
