
## REST Consumer, Pulse y key (v6)

1. Añade **API REST Consumer** con `url: /v1/data`, `method: GET`, `bind: apiData`, `bindPath: items`, `auto: true`.
2. Añade **Lazy Column** con el mismo `state: apiData`.
3. Opcional: **Load indicator** con `state: _loading_apiData` (mismo `loadingKey` del consumer).
4. **Pulse Server Consumer**: `url: /api/pulse`, `keys: home,detail`.
5. Asigna `key: "home"` a un **Vista-agente** o contenedor para direccionarlo desde pulsos.

Prueba: ejemplo **REST · Pulse · Carousel**.
