# Tutorial del Toolbox — Alset Studio

Guía práctica: **qué es**, **cuándo usarlo** y **cómo se ve en el árbol** de cada componente del panel Toolbox.

El árbol es una lista de nodos `{ type, props, children }`. En Studio arrastras desde el Toolbox; aquí se muestra el equivalente para entender la estructura.

---

## 1. Cómo se usa el Toolbox en la práctica

1. **Plantillas** (arriba del Toolbox): insertan un bloque ya armado (landing, login, drawer, splash…).
2. **Componentes**: piezas sueltas. Los *container* admiten hijos (column, card, drawer…).
3. **Props**: panel derecho → cambias texto, `state`, `url`, colores, etc.
4. **Correr preview** → monta el árbol en el marco móvil/tablet/desktop.
5. **Desplegar** → genera la PWA en `/apps/<nombre>/`.

Reglas útiles:

| Prop | Para qué sirve |
|------|----------------|
| `state` | Nombre en `alsetState` (dato reactivo) |
| `key` | Identidad estable (navegación, pulsos, agentes) |
| `action` | Evento que dispara el botón |
| `color` / `bg` | Tema o valor CSS |

---

## 2. Layout (estructura de pantalla)

### `column` — Columna vertical
**Cuándo:** apilar título, formulario y botones de arriba abajo (casi siempre el contenedor raíz).

```js
{ type: 'column', props: { gap: 12, pad: 16 }, children: [ /* hijos */ ] }
```

### `row` — Fila horizontal
**Cuándo:** botones lado a lado, KPIs en línea, icono + texto.

```js
{ type: 'row', props: { gap: 10 }, children: [
  { type: 'button', props: { text: 'Aceptar', action: 'ok' } },
  { type: 'button', props: { text: 'Cancelar', action: 'cancel' } }
]}
```

### `spacer` — Espacio vacío
**Cuándo:** empujar un bloque hacia abajo o separar secciones sin card.

```js
{ type: 'spacer', props: { h: 24 } }
```

### `card` — Tarjeta
**Cuándo:** agrupar un bloque visual (producto, KPI, formulario corto).

```js
{ type: 'card', props: { pad: 14, gap: 8 }, children: [
  { type: 'text', props: { text: 'Pedido #12', weight: 'bold' } },
  { type: 'text', props: { text: 'Pendiente', color: 'muted' } }
]}
```

### `stack` — Pila de vistas
**Cuándo:** varias “pantallas” internas (onboarding, wizard) con el mismo marco; cambia con `state`.

```js
{ type: 'stack', props: { state: 'paso', animated: true }, children: [
  { type: 'column', props: { key: '1' }, children: [/* paso 1 */] },
  { type: 'column', props: { key: '2' }, children: [/* paso 2 */] }
]}
```

### `layer` — Capas superpuestas
**Cuándo:** fondo + contenido encima (hero con imagen y texto).

---

## 3. Texto, medios e iconografía

### `text`
**Cuándo:** títulos, párrafos, etiquetas.

```js
{ type: 'text', props: { text: 'Bienvenido', size: 22, weight: 'bold', color: 'primary' } }
```

### `badge`
**Cuándo:** etiqueta corta (NUEVO, BETA, estado).

```js
{ type: 'badge', props: { text: 'NUEVO · BETA' } }
```

### `chip`
**Cuándo:** filtros o tags seleccionables en filas densas.

### `avatar`
**Cuándo:** foto o iniciales de usuario en listas y chats.

### `icon` / `fab`
**Cuándo:** icono suelto o botón flotante de acción principal (FAB abajo a la derecha).

### `image`
**Cuándo:** logo, foto de producto. Preferible `image-browser` en props para no pegar URLs a mano.

```js
{ type: 'image', props: { src: 'https://…/foto.jpg', radius: 12 } }
```

### `video` / `audio`
**Cuándo:** reproducir media real desde URL (o estado). Usar `preload: metadata`; no poner autoplay con sonido sin gesto del usuario.

```js
{ type: 'video', props: { src: 'https://…/demo.mp4', controls: true } }
{ type: 'audio', props: { src: 'https://…/nota.mp3', controls: true } }
```

### `map`
**Cuándo:** mostrar un mapa embebido (estilo OSM). Ideal en apps de entrega o ubicación de negocio.

### `divider`
**Cuándo:** línea separadora entre secciones dentro de una card.

### `skeleton` / `empty-state`
**Cuándo:** carga percibida (skeleton) o lista vacía amigable (“No hay pedidos”).

---

## 4. Formularios e interacción

### `input` / `textarea`
**Cuándo:** capturar texto. **Siempre** pon `state` para leer el valor después.

```js
{ type: 'input', props: { placeholder: 'Correo', state: 'email', type: 'email' } }
{ type: 'textarea', props: { placeholder: 'Notas', state: 'notas', rows: 3 } }
```

### `select` / `checkbox` / `switch`
**Cuándo:** opciones fijas, sí/no, o activar una función.

```js
{ type: 'select', props: { state: 'moneda', options: 'CUP,USD,EUR' } }
{ type: 'switch', props: { state: 'notificar', label: 'Avisos' } }
```

### `button`
**Cuándo:** acción del usuario. `action` nombra el evento; opcional `state` para contadores.

```js
{ type: 'button', props: { text: 'Guardar', action: 'save', anim: 'fade' } }
```

### Formularios listos
| Tipo | Cuándo |
|------|--------|
| `form-login` | Pantalla entrar usuario/clave |
| `form-register` | Alta de cuenta |
| `form-contact` | Contacto simple |
| `form-search` | Buscador con estado de query |
| `login-token` | Login orientado a token Alset |

---

## 5. Navegación y chrome de app

### `nav` — Tabs superiores
**Cuándo:** 2–5 secciones al mismo nivel (Inicio / Datos / Ajustes).

```js
{ type: 'nav', props: { tabs: 'Inicio,Datos,Ajustes', state: 'tab' } }
```

### `bottom-tabs` — Tabs inferiores (móvil)
**Cuándo:** app móvil tipo tienda o hub (Inicio, Buscar, Carrito, Perfil).

```js
{ type: 'bottom-tabs', props: {
  tabs: 'Inicio,Buscar,Carrito,Yo',
  icons: '⌂,⌕,▣,☺',
  state: 'mainTab'
}, children: [ /* una columna por tab si el runtime lo soporta */ ] }
```

### `tabs-shell`
**Cuándo:** shell con pestañas y contenido asociado (más “escritorio” que bottom-tabs).

### `hamburger` + `drawer` / `side-menu`
**Cuándo:** menú lateral en móvil. El hamburger conmuta `state` (ej. `drawerOpen`); el drawer **debe** usar el mismo `state`.

```js
{ type: 'hamburger', props: { state: 'drawerOpen' } }
{ type: 'drawer', props: { title: 'Menú', state: 'drawerOpen', side: 'left' }, children: [
  { type: 'button', props: { text: 'Inicio', action: 'go-home' } },
  { type: 'button', props: { text: 'Salir', action: 'logout' } }
]}
```

### `nav-link` / `router`
**Cuándo:** rutas internas de la app (`key` de vista). El router cambia de pantalla sin recargar.

### `hero`
**Cuándo:** cabecera de marketing o bienvenida con título + subtítulo.

```js
{ type: 'hero', props: { title: 'Ábaco', subtitle: 'Contabilidad clara para tu negocio' } }
```

### `splash`
**Cuándo:** pantalla de arranque (logo, spinner, mensaje “Cargando…”).

---

## 6. Datos y listados

### `list` / `table`
**Cuándo:** `list` para filas simples ligadas a `state`; `table` para columnas (`columns: 'id,name,total'`).

```js
{ type: 'list', props: { state: 'items', empty: 'Sin datos' } }
{ type: 'table', props: { state: 'rows', columns: 'id,name,total' } }
```

### `lazy-column` / `lazy-row`
**Cuándo:** muchos elementos o datos que llegan de API/pulsos (scroll eficiente). Enganchar con `rest-consumer` o `pulse-consumer`.

### `metric`
**Cuándo:** KPI en dashboard (Ventas hoy, Clientes).

```js
{ type: 'metric', props: { title: 'Ventas', value: '0', state: 'ventas', hint: 'hoy' } }
```

### `carousel`
**Cuándo:** banners o fotos de producto en horizontal (con o sin animación).

### `progress` / `loader`
**Cuándo:** barra de progreso o indicador de carga mientras llega la API.

```js
{ type: 'loader', props: { label: 'Sincronizando…' } }
{ type: 'progress', props: { value: 40, state: 'uploadPct' } }
```

---

## 7. Estilo visual (look & feel)

### `shape`
**Cuándo:** blob, círculo, rectángulo con esquinas recortadas como decoración o máscara.

### `gradient` / `gradient-image` / `glass` / `surface`
**Cuándo:** fondos modernos, glassmorphism, paneles elevados. Combina con themes del Toolbox.

### `theme-chip`
**Cuándo:** aplicar un tema predefinido (Gold Night, Ocean, etc.) a la vista.

### `anim-fade` / `anim-slide` / `anim-scale` / `animate` / `toast`
**Cuándo:** entrada suave de bloques, feedback breve (toast) tras guardar.

---

## 8. Auth y roles (estilo Alset)

### `auth-gate`
**Cuándo:** envolver un bloque que solo debe ver un rol (`role: 'admin'`).

```js
{ type: 'auth-gate', props: { role: 'admin', deny: 'Sin permiso' }, children: [
  { type: 'text', props: { text: 'Panel master' } }
]}
```

### `role-badge`
**Cuándo:** mostrar el rol actual del usuario en la barra.

### `login-token`
**Cuándo:** flujo de entrada con usuario/clave hacia token de sesión Alset.

---

## 9. Red, estado y persistencia

### `state`
**Cuándo:** declarar un valor inicial en `alsetState` (`count = 0`).

```js
{ type: 'state', props: { name: 'count', value: '0' } }
```

### `persist`
**Cuándo:** guardar un state en localStorage / capa offline (`key: 'app.v1'`).

### `api` (GET) / `api-post`
**Cuándo:** llamadas simples al backend del Studio o a tu API.

```js
{ type: 'api', props: { url: '/v1/health', state: 'apiData', auto: true } }
{ type: 'api-post', props: { url: '/v1/data', state: 'postBody', event: 'submit' } }
```

### `rest-consumer`
**Cuándo:** CRUD completo (GET/POST/PUT/DELETE), body o query, y **bind** del resultado a `lazy-column` / lista.

**Ejemplo mental:** GET lista de productos → `state: 'productos'` → `lazy-column` lee `productos`.

### `pulse-consumer`
**Cuándo:** enganchar vistas (`key`) a un servidor de pulsos SSE (`/api/pulse` o el de tu nodo) para tiempo real.

### `ipfs`
**Cuándo:** mostrar o anclar un documento por CID / RootCID.

### `file-browser` / `image-browser`
**Cuándo:** elegir archivo o imagen del disco sin escribir la URL a mano (props del Studio).

---

## 10. Agentes, Mind, Zyrion, mesh

### `agent` / `view-agent`
**Cuándo:** asociar lógica de agente o ciclo de vida a una vista (`key`, políticas).

### `mind-panel`
**Cuándo:** UI de latido Alset Mind (texto → tick) embebida en la app o en el Studio.

### `zyrion-panel` / `zyrion-filter`
**Cuándo:** evaluar lógica ternaria (0/1/2) o filtros de búsqueda con criterio Zyrion.

### `mcp-agent`
**Cuándo:** exponer un agente MCP opcional para que modelos externos interactúen con la app.

### `mesh-peers`
**Cuándo:** listar pares del mini-nodo / gossip (apps que se descubren en red local).

### `architecture`
**Cuándo:** marcar capas clean architecture (ui / domain / data) en el árbol de trabajo.

---

## 11. Tiempo real y streaming

### `webrtc-camera`
**Cuándo:** cámara local del dispositivo (getUserMedia) para preview o captura.

### `stream-hub`
**Cuándo:** enlazar con **AlsetStreamingHub** (WS/HTTP) para streams; no saturar la UI (lazy + cleanup de tracks).

---

## 12. Recetas rápidas (combinaciones)

### Pantalla de login
`column` → `hero` o `text` → `login-token` o `form-login` → `button`

### Dashboard
`column` → `row` de `metric` → `card` + `table` o `lazy-column` → `api`/`rest-consumer`

### App móvil con menú
`hamburger` + `drawer` (mismo `state`) → `bottom-tabs` → contenido por tab

### Lista desde API
`rest-consumer` (GET, state `items`) + `lazy-column` / `list` (state `items`) + `loader`

### Tiempo real
`pulse-consumer` (url del `/pulse`, keys de vista) + componentes con `key` + opcional `toast` al llegar evento

### Media
`carousel` de `image` o un `video` con `controls: true`; para radio/podcast, `audio`

---

## 13. Orden de trabajo recomendado

1. Elige **plantilla** (Landing, Login, Shell drawer, Bottom tabs…).
2. Ajusta textos y `state` en el panel de props.
3. Añade **datos** (`api` / `rest-consumer`) antes de pulir animaciones.
4. Envuelve zonas sensibles con **auth-gate**.
5. **Correr preview** en móvil → tablet → desktop.
6. **Desplegar** y probar en el navegador real (PWA).

---

## 14. Errores frecuentes

| Síntoma | Causa habitual | Qué hacer |
|---------|----------------|-----------|
| El drawer no abre | `hamburger` y `drawer` con distinto `state` | Mismo nombre de state |
| Lista vacía siempre | `list` sin `state` o API que no escribe ese state | Unificar nombres |
| Preview “roto” en móvil | Layout sin `column` raíz o anchos fijos | Usar column + gap + pad |
| Botón no hace nada | Sin `action` o sin lógica/backend enganchada | Definir action + handler |
| Media se congela | Muchos videos en autoplay | Un solo player, `preload: metadata` |

---

Más detalle de despliegue, mini-nodo y desktop: **MANUAL.es.md**, **docs/DESKTOP_GO.md**, **docs/AGENTS_REST_PULSE.md**.
