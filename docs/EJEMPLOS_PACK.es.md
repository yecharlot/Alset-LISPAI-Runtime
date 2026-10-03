# Apps de ejemplo funcionales (listas para desplegar)

Datos **simulados en memoria** (`state` seed). Cada app se puede **Cargar → Correr preview → Desplegar**.

## Lista

| Id | App | Qué puedes hacer ya |
|----|-----|---------------------|
| `travel-agency` | **Agencia de viajes** | Lista de rutas, mapa OSM, tipos de pasaje (bus/colectivo/taxi), ajustar precio ±10, confirmar boleto, toast |
| `local-biz` | **Barrio Vivo** | Negocios locales, mapa, productos/ofertas, contador de avisos, “nueva oferta” |
| `modern-shell` | **Nova Shell** | Drawer lateral, bottom tabs, gráficos barras/línea, KPI editable |
| `shop-mkt` | **Pulse Store** | Catálogo marketing, carrito, checkout simulado, charts de conversión, badge |
| `abaco-dashboard` | **Ábaco Dashboard** | Caja/gastos, charts, movimientos, drawer, botones de ingreso/gasto |
| `orders-online` | **Pedidos online** | Catálogo tipo gestora, carrito, interés sin precio, tabs |
| `alsetos` | **AlsetOS Launcher** | Splash + tarjetas de apps ANS |
| `analytics` | **Analítica** | Solo charts + KPI |

## Componentes nuevos usados

| Tipo | Uso |
|------|-----|
| `chart-bar` | Series `{label,value}[]` en `state` |
| `chart-line` | Misma serie, polilínea SVG |
| `toast` / `notify-bar` | Lee `state` (ej. `toast`) y muestra aviso |
| `state` (seed) | `value` puede ser JSON (`[...]`, `{...}`) |

## Agencia de viajes — flujo

1. Carga **Agencia de viajes**.
2. Toca una ruta en la lista → queda en `rutaSel`.
3. El mapa usa `mapLat` / `mapLng` (botones Ver Baracoa / Santiago / Moa).
4. Elige **Bus / Colectivo / Taxi** → `ticketType`.
5. **Precio ±10** → `precio`.
6. **Confirmar boleto** → toast de reserva simulada.

Para personalizar: edita el array `routes` en `examples.js` (`appTravelAgency`) o cambia props en el árbol tras cargar.

## Barrio Vivo — notificaciones

- `toast` + `notifCount` simulan avisos al publicar oferta.
- Lista de `negocios` y `productos` con negocio, precio y descripción.
- Botón **Nueva oferta** / **+1 aviso**.

## Despliegue

```text
Studio → Desplegar → /apps/<id>/
Nodo Alset → registrar archivos → /w/<id>.app.ans
```

## Cómo ampliar

1. Cambia el JSON de `st('clave', [...])` al inicio de cada `build`.
2. Añade `list` con `itemTitle` / `itemSubtitle` / `itemMeta`.
3. Botones: `setState` + `setOp: incf|decf|toggle`.
4. Gráficos: `state` = array `{label, value}`.

Ver también: [COMPONENTES_Y_CONECTORES.es.md](COMPONENTES_Y_CONECTORES.es.md).
