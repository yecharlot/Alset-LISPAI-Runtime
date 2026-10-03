# Componentes, conectores, estados y LispAI

## 1. Conectores (no se pintan en la vista)

Estos tipos **corren lógica** pero **no ocupan espacio visual** en el preview ni en la PWA:

| Tipo | Rol |
|------|-----|
| `api` | GET → escribe en `state` |
| `api-post` | POST al disparar evento |
| `rest-consumer` | GET/POST/PUT/DELETE + bind |
| `pulse-consumer` | SSE / pulsos → state |
| `state` | Declara valor inicial en alsetState |
| `persist` | Persiste un state |
| `ipfs` / `agent` | Metadatos / agentes |

En el canvas del Studio pueden verse como nodos de estructura; en **Correr preview** quedan ocultos (`display:none`).

Flujo típico:

```
[rest-consumer] --escribe--> state "items" --lee--> [list / table / metric]
```

### Lista personalizada

Props del `list`:

| Prop | Ejemplo | Efecto |
|------|---------|--------|
| `state` | `items` | Array a leer |
| `itemTitle` | `name` | Campo título |
| `itemSubtitle` | `description` | Subtítulo |
| `itemMeta` | `price` | Línea meta (ej. precio) |
| `selectState` | `seleccionado` | Al clic guarda el ítem en ese state |
| `empty` | `Sin datos` | Mensaje vacío |

---

## 2. Estados al estilo Alset-JS (`alsetState`)

### En el panel **Estados**
Crear clave `contador` = `0`, refrescar, limpiar.

### Con botón (props)

```
setState: contador
setOp: incf          // incf | decf | toggle | push
setValue: 1          // delta o valor
```

Equivalente mental a:

```js
const contador = alsetState(0);
// click → contador.set(contador.get() + 1)
```

### Con LispAI

```lisp
(set-state "contador" 0)
(incf-state "contador")
(get-state "contador")
(toggle-state "drawerOpen")
(progn (set-state "items" (list)) (states))
```

### En consola del navegador

```js
AlsetState.set('contador', 0)
AlsetState.eval('(incf-state "contador")')
AlsetState.get('contador')
```

---

## 3. LispAI sin tumbar la UI

**Seguro (recomendado):**

```lisp
(set-prop n1 text "Hola")
(set-state "contador" 1)
```

**Reemplazo total del árbol** (solo si el fuente **empieza** por `(ui` o `(column`):

```lisp
(ui (column (text "Hola") (button "OK")))
```

Si el árbol es inválido, Studio **no** borra el canvas y muestra el error.

---

## 4. Cómo crear un componente nuevo en el Toolbox

Archivo: `web/studio/components.js`

### Paso A — Catálogo

```js
// Dentro de CATALOG, grupo adecuado:
{ type: 'mi-widget', label: 'Mi widget', defaults: { text: 'Hola', state: 'x' } }

// Si es solo lógica (conector):
{ type: 'mi-fuente', label: 'Mi fuente', connector: true, defaults: { url: '/v1/data', state: 'data', silent: true } }
```

### Paso B — Runtime de preview/PWA

Archivo: `web/runtime/app-runtime.js` — en el `switch (n.type)`:

```js
case 'mi-widget': {
  const box = el('div', 'rt-card', p.text || '');
  // leer state:
  // const v = ctx.state?.[p.state];
  // escribir:
  // ctx.setState(p.state, nuevoValor);
  wrap.appendChild(box);
  break;
}
```

Si es **conector**, añádelo a `CONNECTOR_TYPES` y no pintes UI (o déjalo vacío); en el `case` solo haz `fetch` / `setState`.

### Paso C — (Opcional) Bridge Alset-JS

`web/studio/alsetBridge.js` — mismo `case` si usas preview nativo alsetState.

### Paso D — Probar

1. Reinicia Studio  
2. Arrastra el componente  
3. **Correr preview**  
4. **Desplegar** y abre `/apps/nombre/`

---

## 5. Despliegue y nombres ANS

Desde Studio, **Desplegar PWA** escribe en `~/.alset-studio/apps/<nombre>/` y abre:

```
http://127.0.0.1:5177/apps/<nombre>/
```

En un **nodo Alset** (PrismaTec), el patrón de apps servidas es:

```
https://<nodo>/w/<nombre>.app.ans
```

Para publicar la PWA generada en un nodo:

1. Despliega en Studio (genera `index.html` + `app.alset.json` + runtime).  
2. Registra la app en el nodo (`/api/apps/register` o panel de apps) con los archivos de `/apps/<nombre>/`.  
3. Accede por `/w/<nombre>.app.ans` cuando el nodo resuelva ese ANS.

Las apps generadas usan el mismo `app-runtime.js` (conectores, list, estados, Lisp en botón).

---

## 6. Multimedia y mapa

- **video**: `src`, `controls`, `autoplay`, `loop`, `preload`. Formatos: mp4, webm, ogg, mov, m4v.  
- **audio**: igual con audio/*  
- **map**: `lat`, `lng`, `zoom`, `label` (OSM embebido)

Alineados a las primitivas de Alset-JS-Runtime en el bridge cuando el preview usa `renderAlsetPreview`.

---

## 7. Pulse consumer

Como el REST consumer:

- `url`: endpoint SSE/pulse (ej. `/api/pulse`)  
- `keys` / `key`: filtro de mensajes  
- `state`: dónde guardar el último payload o lista  

La **vista** no es el consumer: usa `list` / `text` / `metric` leyendo ese `state`.
