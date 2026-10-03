# MiniNode Alset (embebido en Studio y apps)

Independiente de PrismaTec monolito. Incluye:

| Capacidad | HTTP (Studio) | JS en app (`mininode.js`) |
|-----------|---------------|---------------------------|
| Mind latido | `POST /api/mind/tick` `{"text"}` | `AlsetMiniNode.mindTick(text)` |
| Memoria | `GET /api/mind/memory` | `AlsetMiniNode.facts` |
| Zyrion | `POST /api/zyrion` `{"env","labels"}` | `AlsetMiniNode.evalZyrion(env, labels)` |
| LispAI subset | `POST /api/lispai` `{"cmd"}` | `AlsetMiniNode.lispEval(cmd)` |
| Info | `GET /api/node/info` | `AlsetMiniNode.info()` |
| Mesh/gossip lite | `POST /api/mesh/announce`, `GET /api/mesh/peers` | `announce` + BroadcastChannel |

## Qué no es (aún)

No es Kademlia/libp2p completo en el navegador. El mesh usa:

1. **BroadcastChannel** entre pestañas del mismo origen.
2. **Rendezvous HTTP** en el proceso Studio (`/api/mesh/*`) para que apps en el mismo host se listen.

Una red DHT real puede apuntar después al nodo PrismaTec o a un worker Cloudflare; el contrato de API ya está.

## Toolbox

- **Mind (mini-nodo)** — panel + latido (`local: true` usa JS sin red).
- **Zyrion panel** — JSON de entorno → ternario.
- **Mesh peers** — anunciar y listar.

## Props con selectores

En el inspector, campos como `method`, `color`, `animated`, `kind`, `theme` son **desplegables**.  
`src` / imágenes: botón **Examinar** (dataURL local, sin pegar URL a mano).
