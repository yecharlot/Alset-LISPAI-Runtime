# Estados, navegación, CRUD e iconos en Alset Studio

Tutorial práctico: cómo darle **lógica** a una app sin ser un programador de backend pesado.

---

## 1. ¿Qué es un “estado”?

Un **estado** es una caja con nombre que guarda un valor mientras la app está abierta (y, si usas `persist`, también al recargar).

Ejemplos de nombres:

| Nombre de state | Qué guarda |
|-----------------|------------|
| `email` | Texto del input correo |
| `productos` | Lista de productos (array) |
| `drawerOpen` | `true` / `false` del menú |
| `mainTab` | Pestaña activa (`Inicio`, `Carrito`…) |
| `ruta` | Vista actual (`lista`, `detalle`) |
| `seleccionado` | Id del ítem elegido |

**Regla de oro:** el mismo nombre de `state` une al que **escribe** y al que **lee**.

```
input (state: "email")  →  escribe lo que tecleas
text  (que lea email)   →  mostraría ese valor si el runtime lo enlaza
list  (state: "items")  →  pinta lo que haya en items
api   (state: "items")  →  al terminar el GET, guarda el resultado en items
```

---

## 2. Cómo se crea y se usa un estado en el Studio

### A) Declarar un valor inicial

1. Toolbox → **Estado** (`state`)
2. Props:
   - `name`: `contador`
   - `value`: `0`

### B) Escribir desde un input

1. Toolbox → **Input**
2. Prop `state`: `email`  
   Cada tecla actualiza `email` en memoria.

### C) Cambiar estado con un botón

En el botón, props útiles:

| Prop | Ejemplo | Efecto |
|------|---------|--------|
| `action` | `tab-Pedidos` | Navegación (ver §4) |
| `setState` | `drawerOpen` | Nombre del estado a cambiar |
| `setValue` | `true` / `false` / texto | Valor nuevo |

Ejemplo mental: botón “Abrir menú”

- `setState` = `drawerOpen`
- `setValue` = `true`

El **hamburger** ya hace toggle de `drawerOpen` solo; el **drawer** debe tener el **mismo** `state: drawerOpen`.

### D) Ver el estado al depurar

Al **Correr preview**, los cambios de state remontan la vista. Si algo no se actualiza, revisa que **list/table/metric** usen el **mismo** nombre que el API/consumer.

---

## 3. CRUD: crear, leer, actualizar, borrar y mostrar

El backend de prueba del Studio expone rutas bajo `/v1/` (health, data). El patrón general es:

### Leer (Read) y mostrar en la vista

1. Añade **REST GET** (`api`) o **rest-consumer**:
   - `url`: `/v1/data` (o tu API)
   - `state`: `items`
   - `auto`: true (carga al montar)
2. Añade **list** o **table** o **lazy-column**:
   - `state`: `items`  ← **igual** que arriba
3. En table, `columns`: `id,name` (campos que trae cada fila)

Flujo:

```
[rest-consumer GET] --escribe--> state "items" --lee--> [list / table]
```

### Crear (Create)

1. Inputs con `state`: `nuevoNombre`, `nuevoPrecio`
2. Botón con `action`: `submit` (o el `event` que tenga tu `api-post`)
3. **api-post** o **rest-consumer** method POST:
   - `url`: `/v1/data`
   - body desde estados (según props del consumer)
4. Tras el POST, vuelve a hacer GET (o el consumer actualiza `items`)

### Actualizar / Borrar

- PUT/DELETE con **rest-consumer** (`method`: put/delete).
- Identifica el ítem con un state `seleccionado` (id).
- Tras la operación, refresca la lista (mismo `state: items`).

### Checklist CRUD que no falla

1. Un solo nombre de lista: `items` (o `productos`) en todas partes.
2. La tabla/lista **solo pinta**; no llama a la red.
3. Quien llama a la red es `api` / `rest-consumer`.
4. Tras mutar, el array en state debe ser un **array** (si la API devuelve `{ items: [...] }`, el runtime a veces usa `.items`; si la lista sale vacía, mira la forma del JSON en consola).

---

## 4. Navegar entre vistas y pasar estado

En Alset Studio la “navegación” **no es una URL del navegador**: es **cambiar un state** que decide qué se ve.

### Patrón A — Tabs / bottom-tabs

```
bottom-tabs  state: mainTab   tabs: "Inicio,Pedidos,Yo"
```

- Al pulsar una tab, `mainTab` pasa a `Pedidos`, etc.
- Botones del drawer pueden usar `action`: `tab-Pedidos` (mismo efecto).

### Patrón B — Rutas con prefijo en el botón

`action` del botón:

| action | Qué hace el runtime |
|--------|---------------------|
| `tab-Pedidos` | `mainTab` / tab = `Pedidos` |
| `route-detalle` | `route` = `detalle` |
| `nav-home` | `route` = `home` |

Props opcionales del botón:

- `routeState`: nombre del state de ruta (default `route`)
- `tabState`: nombre del state de tab (default `mainTab`)

### Patrón C — Lista → detalle (pasar el id)

1. State `ruta` = `lista` | `detalle`
2. State `seleccionado` = id del producto
3. En la lista, botón “Ver”:
   - `setState` = `seleccionado`, `setValue` = el id (o action que lo setee)
   - otro `setState` / action para `ruta` = `detalle`
4. Vista detalle: muestra datos de `seleccionado` (y/o busca en `items`)

Esquema:

```
[Lista]  click ítem  →  seleccionado=id , ruta=detalle
[Detalle]  botón Volver  →  ruta=lista
```

### Patrón D — stack o router

- **stack** + `state: paso` → wizard (1, 2, 3).
- **router** / **nav-link** → varias rutas con `key` en las vistas hijas.

### Pasar datos entre vistas

No hay “props de navegación” tipo React Navigation. Se usa **estado global de la app**:

- Vista A escribe `clienteNombre`
- Vista B lee `clienteNombre` (input/text/metric con ese state)

Todo lo que deba sobrevivir el cambio de tab debe estar en **state**, no solo en el texto de un nodo.

---

## 5. Iconos: paleta arrastrable (clic = insertar)

En el panel izquierdo, sección **Iconos**:

1. Clic en un icono → se inserta un nodo `icon` en el canvas.
2. Props: `name` (pulse, home, cart…), `size`, `color`.
3. En botones del drawer, prop `icon` puede ser el glifo o el nombre según plantilla.

Nombres útiles: `home`, `search`, `cart`, `user`, `bell`, `settings`, `trash`, `edit`, `plus`, `check`, `money`, `package`, `truck`…

---

## 6. Ejercicio guiado (15 minutos)

### App “Notas mínimas”

1. Plantilla en blanco o `column` raíz.
2. `state` name=`items` value=`[]` (si el Studio lo permite como texto vacío).
3. `input` state=`nota`.
4. `button` text=`Añadir` — en un flujo real el POST guarda; para demo local puedes usar ejemplos **CRUD fullstack** del panel Ejemplos.
5. `list` state=`items`.
6. `rest-consumer` GET `/v1/data` state=`items` auto.
7. Abre **Ejemplos → CRUD fullstack** si quieres ver el árbol ya armado.

### App “Lista → detalle”

1. `state` implícito vía tabs: `mainTab`.
2. Tab Lista: table/list + botones `action: route-detalle` y set de id.
3. Tab o vista Detalle: textos que explican el id seleccionado + botón `action: route-lista`.

---

## 7. Errores típicos

| Problema | Causa | Solución |
|----------|--------|----------|
| La lista no muestra nada | `state` distinto en api y list | Unificar nombre |
| El menú no abre | hamburger `menuOpen` y drawer `drawerOpen` | Mismo state |
| El botón no cambia de vista | `action` sin prefijo `tab-` / `route-` / `nav-` | Usar `tab-Nombre` |
| Pierdo el dato al cambiar tab | Dato solo en un texto, no en state | Guardar en state |
| No sé qué hay en memoria | — | Correr preview y probar; usar ejemplos oficiales |

---

## 8. Resumen en una frase

**Estado = memoria con nombre; la vista solo refleja esa memoria; la red escribe en esa memoria; la navegación es cambiar un state que elige qué bloque se ve.**

Más componentes: [TOOLBOX_TUTORIAL.es.md](./TOOLBOX_TUTORIAL.es.md).
