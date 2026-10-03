# Agentes de vista · REST · Pulse · MCP · Zyrion (Studio)

## Primitivas nuevas (toolbox)

| Tipo | Uso |
|------|-----|
| `carousel` | Diapositivas (hijos); `state` = índice; `animated` |
| `loader` / `load-indicator` | Spinner ligado a `state` booleano (p.ej. `_loading_apiData`) |
| `progress` | Barra 0–100 desde `state` o `value` |
| `file-browser` / `image-browser` | Input file → `state` (dataUrl / texto) |
| `rest-consumer` | GET/POST/PUT/DELETE a `url`; `queryState` / `bodyState`; `bind` + `bindPath` (p.ej. `items`) para enganchar a `lazy-column` |
| `pulse-consumer` | SSE/poll a `url` (default `/api/pulse`); `keys` de vistas; escribe en `state` |
| `view-agent` | Marca una subárbol como agente direccionable (`key`, lifecycle, rootCid) |
| `nav-link` | Lista → detalle: `route` + `detailState` + `routeState` |
| `zyrion-filter` | Filtra listas por score ternario 0/1/2 |
| `mcp-agent` | Cliente lite de `/mcp/tools` |
| `architecture` | Etiqueta Clean Architecture / patrón (documental en el árbol) |

## Prop `key`

Cualquier nodo puede llevar `props.key`. El runtime indexa `ctx.keyIndex[key]` y expone `data-key` en el DOM. Sirve para:

- referenciar vistas desde un servidor de pulsos;
- pasar foco entre pantallas (`focusKey`);
- tratar la vista como **agente** (estado + ciclo de vida).

## LispAI + Alset State

- **Alset State**: `ctx.state` / `setState` / remount (motor reactivo del runtime).
- **LispAI**: editor del Studio y `POST /api/lispai` en el nodo PrismaTec; en Studio lite las macros `set-prop` siguen siendo el camino seguro de parche visual.
- No compiten: el estado de UI vive en Alset State; la lógica simbólica puede escribir el mismo bag vía bridge cuando se conecta el nodo completo.

## Mind / Zyrion (alcance)

- **Zyrion en Studio**: filtro ternario local sobre listas (`zyrion-filter`). La evaluación completa `evaluar-zyrion` sigue en el nodo PrismaTec (`/api/lispai`).
- **Mind**: opcional vía `rest-consumer` apuntando a `https://…/api/mind/tick` o ejemplo gemelo PrismaTec Mind. No se embebe el monolito en el PWA para no perder portabilidad offline.

## MCP lite

- `GET /mcp/tools` — catálogo de herramientas.
- `POST /mcp/call` — `{ "tool": "list_apps"|"pulse_publish"|…, "args": {} }`.

Las apps pueden incluir el nodo `mcp-agent` solo si el despliegue expone esas rutas.

## Clean Architecture (organización)

Usa nodos `architecture` con `layer`: `presentation` | `domain` | `data` y `pattern`: `repository` | `factory` | `singleton` | `di` como **metadatos del árbol** (no ejecutan código solos). El usuario agrupa columnas por capa; el runtime no impone un framework.

## Servidor Studio

- `GET|POST /api/pulse` — bus SSE + publicación.
- `GET /v1/data` — datos demo para probar `rest-consumer` + lazy.
