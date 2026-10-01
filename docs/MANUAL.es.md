# Alset Studio — Manual de creación de apps (0 → 100)

**Alset-LISPAI-Runtime** es un entorno no-code / low-code para diseñar, probar y desplegar aplicaciones con el ecosistema Alset: UI por árbol de nodos, estado reactivo, MiniNode (Mind · Zyrion · LispAI lite · mesh), REST, pulsos, PWA y opcionales Mind/Zyrion del nodo PrismaTec completo.

---

## 1. Arranque

```bash
git clone https://github.com/yecharlot/Alset-LISPAI-Runtime.git
cd Alset-LISPAI-Runtime
go run ./cmd/alset-studio -addr :5177 -dir web
```

Abre **http://127.0.0.1:5177/** y usa **Ctrl+Shift+R** tras actualizar el repo.

| Pieza | Rol |
|-------|-----|
| Toolbox | Arrastra componentes al canvas |
| Canvas / árbol | Estructura de la app |
| Props | Edita propiedades (selectores + Examinar archivos) |
| Preview | Móvil · tablet · desktop (hot-reload) |
| LispAI | Parches seguros `(set-prop id key "valor")` |
| Ejemplos / plantillas | Bases listas |
| Correr | Preview interactivo |
| Desplegar | PWA en `/apps/<nombre>/` |

---

## 2. Modelo mental

1. **Árbol de nodos** — cada nodo tiene `type`, `id`, `props`, `children`.
2. **Estado (Alset State)** — `props.state` enlaza UI ↔ `ctx.state`; cambios → remount del preview.
3. **key** — hace la vista **direccionable** (pulsos, detalle, agentes).
4. **MiniNode** — Mind/Zyrion/Lisp/mesh **sin** depender del repo PrismaTec.
5. **Deploy** — copia `app-runtime.js` + `mininode.js` a una PWA estática servida por el Studio.

---

## 3. Flujo de trabajo recomendado (0 → app publicada)

### Paso 1 — Elegir base
- **Plantillas** (toolbox): en blanco, landing, login, dashboard, mobile-shell, drawer pro, splash, router, glass, CRUD.
- **Ejemplos**: gemelas (Sales Hub, La Tati, ÁbacoPhy, PrismaTec) o **REST · Pulse · Carousel**, **MiniNode lab**, etc.

### Paso 2 — Estructura de pantallas
- **bottom-tabs** o **tabs-shell** / **router** para secciones.
- **drawer** + **hamburger** para menú lateral.
- **stack** si necesitas apilar pantallas por índice.

### Paso 3 — Datos
- **rest-consumer**: `method`, `url`, `bind`, `bindPath` (ej. `items`), `auto`, `loadingKey`.
- Engancha **lazy-column** / **lazy-row** al mismo `bind`.
- **loader** con el mismo `loadingKey`.
- Demo local: `GET/POST /v1/data`.

### Paso 4 — Inteligencia local
- **mind-panel** → `POST /api/mind/tick` (o `local: true` = JS).
- **zyrion-panel** → `POST /api/zyrion`.
- **zyrion-filter** sobre listas con `score`.

### Paso 5 — Red entre apps
- **pulse-consumer** + `key` en **view-agent**.
- **mesh-peers** para anunciarse en el rendezvous del Studio.

### Paso 6 — Estética
- **gradient**, **glass**, **shape**, **carousel**, temas (`theme-chip`).
- Props **color/bg/from/to**: desplegables; **src**: botón **Examinar**.

### Paso 7 — Probar y publicar
- Preview en tres dispositivos.
- **Desplegar** → abre `/apps/<nombre>/`.
- La PWA incluye MiniNode para latidos offline-lite.

---

## 4. Catálogo de componentes (por grupo)

### Layout y navegación
`column`, `row`, `card`, `stack`, `spacer`, `nav`, `tabs` / `tabs-shell`, `bottom-tabs`, `router`, `drawer` / `side-menu`, `hamburger`, `nav-link`

### Contenido
`text`, `hero`, `badge`, `metric`, `icon`, `image`, `list`, `table`, `select`, `checkbox` / `switch`, `input`, `textarea`, `button`, `fab`

### Motion y visual
`anim-fade`, `anim-slide`, `anim-scale`, `animate`, `gradient`, `gradient-image`, `glass`, `carousel`, `shape` (circle, blob, cut, pill, hex, diamond), `splash`, `theme-chip`, `toast`

### Datos y red
`rest-consumer` / `api` / `api-rest`, `loader`, `progress`, `file-browser`, `image-browser`, `lazy-column`, `lazy-row`, `pulse-consumer`, `mcp-agent`

### Agentes y MiniNode
`view-agent` (`key`), `mind-panel`, `zyrion-panel`, `zyrion-filter`, `mesh-peers`, `architecture` (metadato Clean), `state` / `persist` / `ipfs` / `agent`

### Auth (lite)
`form-login`, `form-register`, `login-token`, `auth-gate`

---

## 5. Props importantes

| Prop | Uso |
|------|-----|
| `state` | Clave en el bag de estado de la app |
| `key` | Identidad de vista / pulse |
| `action` | `nav-home`, `tab-Pedidos`, `route-detail`… |
| `method` / `url` / `bind` / `bindPath` | REST |
| `loadingKey` | Sincroniza loader con fetch |
| `local` | Mind/Zyrion en JS sin servidor |
| `tabs` / `icons` | bottom-tabs |
| `from` / `to` / `src` | degradados e imágenes |

El inspector usa **listas desplegables** cuando el valor es enumerable y **Examinar** para archivos locales (dataURL).

---

## 6. API del Studio (desarrollo)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/v1/health` | Salud |
| GET/POST/DELETE | `/v1/data` | CRUD demo |
| POST | `/v1/auth/login` | Token lite |
| POST | `/api/mind/tick` | Mind MiniNode |
| GET | `/api/mind/memory` | Hechos / episodios |
| POST | `/api/zyrion` | Evaluación ternaria |
| POST | `/api/lispai` | Lisp subset |
| GET | `/api/node/info` | Peer id y capacidades |
| GET/POST | `/api/pulse` | Bus SSE / publicar |
| POST | `/api/mesh/announce` | Gossip lite |
| GET | `/api/mesh/peers` | Peers vistos |
| GET | `/mcp/tools` | MCP lite |
| POST | `/v1/deploy` | Publicar PWA |

---

## 7. LispAI (parche visual seguro)

```text
(set-prop n1 text "Hola")
(set-prop n2 color "primary")
```

No inventes formas libres que rompan el árbol: usa el subconjunto documentado en `docs/LISPAI_FORMS.md`.

---

## 8. MiniNode vs PrismaTec

| | MiniNode (este repo) | PrismaTec completo |
|--|----------------------|--------------------|
| Mind | Latido lite + memoria local | Órganos, corpus, sondas, genoma |
| Zyrion | Env → 0/1/2 absorbente | `evaluar-zyrion` fractal en Lisp |
| Lisp | Subset | Motor completo |
| P2P | Mesh HTTP + BroadcastChannel | libp2p / gossip real |

En producción avanzada puedes apuntar un **rest-consumer** al nodo PrismaTec (`/api/mind/tick`, `/api/lispai`) sin cambiar la UI.

---

## 9. Patrones de app

1. **Tienda**: bottom-tabs + lazy-column + rest-consumer + drawer.
2. **Dashboard**: metrics + glass + REST auto.
3. **Chat / pedidos**: list + input + pulse-consumer.
4. **Onboarding**: splash + stack o tabs + form.
5. **Contable / CRM**: table + rest POST + auth-gate.
6. **Lab cognitivo**: mind-panel + zyrion-panel + mesh-peers.

---

## 10. Checklist antes de desplegar

- [ ] Preview OK en móvil, tablet y desktop  
- [ ] Estados y `key` coherentes  
- [ ] REST con loading y lista enlazada  
- [ ] Drawer con `action` que navega y cierra  
- [ ] Sin URLs de imagen a mano si puedes usar Examinar  
- [ ] Deploy y apertura de la PWA con hard refresh  

Documentación extra: `docs/AGENTS_REST_PULSE.md`, `docs/MININODE.md`, `docs/VISION.es.md`.


## 11. Multimedia y mapas

### Video
Props: `src` o `url` (MP4, WebM; HLS `.m3u8` en Safari nativo), `controls`, `autoplay`, `loop`, `poster`, `height`, `state` (si el estado tiene una URL, tiene prioridad).

### Audio
Props: `src` / `url` (MP3, OGG, etc.), `controls`, `autoplay`, `loop`, `title`, `state`.

### Mapa
OpenStreetMap embebido (sin API key). Props: `lat`, `lng`, `zoom`, `height`, `label`.

### Apps desplegadas a pantalla completa
El HTML de deploy **no incluye header**: `#mount` ocupa todo el viewport (`100dvh`). El emulador del Studio sigue mostrando marco y etiqueta de dispositivo.

### Ejemplos
- **Reproductor multimedia** · **Media por pulsos** · **Explorar mapa** · **Shell multimedia**

Pulse de ejemplo para cambiar media:

```bash
curl -s -X POST http://127.0.0.1:5177/api/pulse \
  -H "Content-Type: application/json" \
  -d '{"key":"media","state":{"src":"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"},"text":"nuevo video"}'
```


## 12. WebRTC, Streaming Hub y escritorio

### Cámara WebRTC
Componente **webrtc-camera**: activa/detiene la cámara del dispositivo. En producción usa HTTPS (o localhost).

### Alset Streaming Hub
Componente **stream-hub**: botones Ver / Publicar / Director hacia el hub multi-cámara ([AlsetStreamingHub](https://github.com/yecharlot/AlsetStreamingHub)).

### UI moderna
`chip`, `avatar`, `divider`, `skeleton`, `empty-state`, `surface` (elevated).

### Electron
```bash
go build -o alset-studio ./cmd/alset-studio
cd desktop && npm i
ALSET_STUDIO_BIN=../alset-studio ALSET_STUDIO_WEB=../web npm start
```


## 13. Escritorio en Go

Ver **docs/DESKTOP_GO.md**. Resumen:

```bash
go build -o alset-studio-desktop ./cmd/alset-studio-desktop
./alset-studio-desktop -dir web
```

Ventana nativa: `go build -tags webview ...` (CGO + WebKit/GTK).


## Tutorial del Toolbox

Guía componente a componente (cuándo usarlo + ejemplos):

→ **[docs/TOOLBOX_TUTORIAL.es.md](docs/TOOLBOX_TUTORIAL.es.md)**


## Estados, navegación y CRUD

→ **[docs/ESTADO_NAV_CRUD.es.md](docs/ESTADO_NAV_CRUD.es.md)**


## alsetState + LispAI fusionados

→ **[docs/ALSETSTATE_LISPAI.es.md](docs/ALSETSTATE_LISPAI.es.md)**
