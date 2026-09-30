# Alset Studio Desktop (Electron)

App de escritorio **real**: ventana propia, pantalla completa, icono al empaquetar.

## Importante

Los comandos `npm` van **dentro de `desktop/`**, no en la raíz del repo (ahí no hay `package.json`).

## Desarrollo (pantalla completa)

```bash
# 1) Motor Go
cd /ruta/a/Alset-LISPAI-Runtime
go build -o alset-studio ./cmd/alset-studio

# 2) Electron
cd desktop
npm install
export ALSET_STUDIO_BIN="$(pwd)/../alset-studio"
export ALSET_STUDIO_WEB="$(pwd)/../web"
npm start
```

- Arranca en **pantalla completa**.
- **F11** o menú Vista → salir / entrar de fullscreen.
- Sin fullscreen al inicio: `ALSET_STUDIO_MAXIMIZE=1 npm start` (solo maximizado).

Si el motor ya está corriendo:

```bash
# terminal 1
./alset-studio -addr 127.0.0.1:5177 -dir web
# terminal 2
cd desktop && npm start
```

## Empaquetar (AppImage / deb)

```bash
cd desktop
npm install
npm run dist
# Artefactos en desktop/dist/
```

Para que el instalable lleve el motor Go, compila antes `alset-studio` y define rutas en el empaquetado (o arranca el motor aparte y usa `ALSET_STUDIO_URL`).
