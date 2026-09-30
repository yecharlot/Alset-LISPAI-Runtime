# Alset Studio Desktop (Electron)

## Desarrollo

```bash
# Terminal 1 — motor
cd .. && go build -o alset-studio ./cmd/alset-studio && ./alset-studio -addr :5177 -dir web

# Terminal 2 — shell
cd desktop && npm i && npm start
```

O con motor embebido:

```bash
cd .. && go build -o alset-studio ./cmd/alset-studio
cd desktop
export ALSET_STUDIO_BIN=../alset-studio
export ALSET_STUDIO_WEB=../web
npm i && npm start
```

Solo nube / Studio remoto:

```bash
ALSET_STUDIO_URL=https://tu-studio.example npm start
```

## Empaquetar

```bash
npm run dist
```

Requiere `electron` y `electron-builder` (ya en package.json).
