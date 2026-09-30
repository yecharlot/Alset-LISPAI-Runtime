# WebRTC · Alset Streaming Hub · Electron

## WebRTC en Studio

| Componente | Función |
|------------|---------|
| `webrtc-camera` | `getUserMedia` local; detener libera tracks (no deja la cámara colgada) |
| `stream-hub` | Enlaces a **AlsetStreamingHub** (ver / publicar / director) + health check |

Hub por defecto: `https://alset-streaming-hub.lhmolam-877.workers.dev`  
Repo: [yecharlot/AlsetStreamingHub](https://github.com/yecharlot/AlsetStreamingHub)

Props `stream-hub`: `hubUrl`, `matchId`, `ticket`, `label`, `embed` (iframe watch).

## Optimización media (no congelar la app)

- **Video**: `preload=metadata`; `src` solo al entrar en viewport (IntersectionObserver).
- **Mapa**: iframe OSM diferido hasta ser visible.
- **Cámara**: el usuario activa; segundo clic detiene tracks.
- Evita muchos iframes/mapas/videos activos a la vez en la misma vista.

## Electron

Carpeta `desktop/`: shell que abre Studio local o `ALSET_STUDIO_URL`. Ver `desktop/README.md`.
