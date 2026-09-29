# Manual de Alset Studio (LISPAI Runtime)

Guía completa para **aprender a crear, probar y desplegar** aplicaciones con el editor visual, el emulador por dispositivo y el runtime compartido (preview = PWA).

**Repositorio:** https://github.com/yecharlot/Alset-LISPAI-Runtime  

**Principio clave:** el preview del Studio y la app desplegada usan el **mismo motor** (`web/runtime/app-runtime.js`). Lo que ves en el marco del dispositivo es lo que se publica.

---

## 0. Qué es este editor

Alset Studio es un entorno **no-code / low-code** que:

1. Construye una interfaz como **árbol de nodos** (JSON `alset-app/v1`).
2. La **emula** en Móvil, Tablet o Desktop (gestos, estados, layout por dispositivo).
3. Permite **lógica** con LispAI y un **backend lite** embebido en Go.
4. **Despliega una PWA** offline-first en `/apps/<nombre>/` y la abre en una pestaña del navegador.

No es un generador de tokens tipo LLM: la UI es declarativa (nodos + props + opcionalmente LispAI).

---

## 1. Instalación y arranque

### Requisitos

- Go 1.21+ (recomendado)
- Navegador moderno (Chrome / Firefox / Edge / Safari)
- Git

### Pasos

```bash
git clone https://github.com/yecharlot/Alset-LISPAI-Runtime.git
cd Alset-LISPAI-Runtime
git pull
go run ./cmd/alset-studio -addr :5177 -dir web
```

Abre en el navegador:

**http://127.0.0.1:5177/**

Deberías ver la barra **ALSET STUDIO**, el toolbox a la izquierda, el canvas al centro y el panel de lógica a la derecha.

### Reiniciar tras un `git pull`

Detén el proceso (`Ctrl+C`) y vuelve a ejecutar `go run …`. El runtime y el HTML se sirven desde `web/`.

---

## 2. Mapa de la interfaz

### Barra superior

| Control | Función |
|---------|---------|
| **Nombre** (`mi-app`) | Identificador de la app al desplegar (`/apps/mi-app/`) |
| **Estado** (badge) | `listo`, `N nodos`, `preview ok`, `deployed`, errores |
| **Toolbox / Lógica / Consola / Preview** | Muestra u oculta paneles |
| **Ejemplos** | Drawer con apps listas (landing, SaaS, móvil, etc.) |
| **Correr preview** | Vuelve a montar el árbol en el emulador (no despliega) |
| **Backend** | Prueba `GET /v1/health` |
| **Limpiar preview** | Vacía solo el marco del emulador |
| **Limpiar** | Borra el árbol completo |
| **Export** | Descarga el JSON `alset-app/v1` |
| **Desplegar PWA** | Publica y **abre una pestaña** con la app final |

### Paneles

| Panel | Uso |
|-------|-----|
| **Toolbox** | Plantillas, componentes arrastrables, colores del tema |
| **Canvas** | Árbol de nodos (estructura). Clic = seleccionar. Drop = añadir hijo o raíz |
| **Preview** | **Emulador**: render real + gestos + arrastre/resize por nodo |
| **Lógica → Propiedades** | Props del nodo + layout por dispositivo |
| **Lógica → LispAI** | Parches o árbol completo en S-expresiones |
| **Lógica → Backend** | Endpoints del servidor y flujo recomendado |
| **Consola / App JSON** | Logs, errores aislados y serialización actual |

Los paneles se redimensionan con los *splitters* y el layout se guarda en `localStorage`.

---

## 3. Flujo de aprendizaje (de 0 a PWA)

Sigue este orden la primera vez:

```
1. Arrancar Studio
2. Cargar un ejemplo (App móvil first)
3. Correr preview → explorar gestos y tabs
4. Cambiar Móvil / Tablet / Desktop
5. Arrastrar un nodo · redimensionar esquina ↘
6. Editar props (texto, color, layout)
7. (Opcional) LispAI → Aplicar
8. Desplegar PWA → comprobar pestaña nueva
9. Crear una app propia desde plantilla o en blanco
```

### 3.1 Cargar un ejemplo

1. Clic en **Ejemplos**.
2. Lee la tarjeta (tags y descripción).
3. Elige una acción:
   - **Cargar** — pone el árbol en el canvas (y refresca preview).
   - **Correr preview** — carga + fuerza el montaje del emulador.
   - **Desplegar** — carga + publica PWA.

**Recomendado para móvil:** ejemplo **«App móvil first»** o plantilla **«App móvil (shell)»**.

### 3.2 Qué hace «Correr preview»

- **No** publica la app.
- **Sí** monta el árbol actual en el panel Preview con el runtime compartido.
- Vuelve a disparar componentes `api` con `auto`, splash, estados, etc.

Úsalo cuando el preview se vea vacío o desactualizado.

### 3.3 Qué hace «Desplegar PWA»

1. Serializa el árbol + estados + dispositivo activo → `POST /v1/deploy`.
2. El servidor escribe en disco:
   - `app.alset.json` (árbol)
   - `app-runtime.js` (**misma** lógica que el preview)
   - `index.html`, `manifest.webmanifest`, `sw.js` (offline)
3. Abre **una pestaña nueva** en `http://127.0.0.1:5177/apps/<nombre>/`.

Si el navegador bloquea pop-ups, la consola del Studio muestra la URL para abrirla a mano.

---

## 4. Crear una app paso a paso

### Paso A — Nombre y base

1. Escribe el nombre en la barra (`ventas-local`, `catalogo`, …). Solo letras, números, `-` y `_`.
2. Opciones de partida:
   - Plantilla **En blanco**
   - Plantilla **Landing / Login / Dashboard / App móvil (shell) / CRUD**
   - Ejemplo del drawer

### Paso B — Añadir componentes

**Desde el toolbox**

- Clic en un ítem → se añade a la raíz.
- Arrastra sobre el canvas → raíz.
- Arrastra sobre la zona de hijos de un contenedor (columna, fila, card, drawer, tabs…) → hijo.

**Grupos del catálogo**

| Grupo | Ejemplos |
|-------|----------|
| Básicos | Texto, Botón, Input, Columna, Fila, Card, Imagen |
| Formularios | Login, Registro, Contacto, Select, Switch |
| Compuestos | Métrica, Lista, Nav tabs, Hero, Tabla |
| Acceso / roles | Login token, Gate por rol |
| Datos / red | REST GET/POST, Estado, Persistencia |
| Motion | Anim fade / slide / scale |
| **Móvil / shell** | Hamburguesa, Menú lateral, Tabs shell, Splash |

### Paso C — Seleccionar y editar

1. Clic en un nodo del **canvas** (queda resaltado).
2. En **Lógica → Propiedades**:
   - **Contenido / datos:** `text`, `title`, `url`, `state`, `tabs`, …
   - **Layout · móvil|tablet|desktop:** `x`, `y`, `width`, `height`, `bg`, `color`, `radius`, `opacity`, `size`
3. Los cambios de texto/color refrescan el preview al vuelo.
4. El layout por dispositivo se guarda en `props.devices.<id>` y también se refleja en props base para el deploy.

### Paso D — Emulador: mover y redimensionar

En el **Preview** (modo interactivo del Studio):

| Gesto | Efecto |
|-------|--------|
| Arrastrar un nodo | Mueve **solo ese** nodo (`x`, `y`) |
| Esquina inferior derecha ↘ | Cambia `width` / `height` de ese nodo |
| Soltar el puntero | Persiste el layout en el árbol |

Cambia **Móvil / Tablet / Desktop** en la barra del canvas: cada dispositivo tiene su propio layout. Así puedes afinar una UI *mobile first* sin romper desktop.

### Paso E — Probar como app real (antes de desplegar)

- **Correr preview**
- Swipe horizontal en el marco → abrir/cerrar menú lateral (si hay drawer + hamburguesa)
- Pull hacia abajo → “refresh” simulado (log en consola)
- Tabs, formularios, botones y `api` auto deben responder

### Paso F — Desplegar y validar paridad

1. **Desplegar PWA**
2. En la pestaña nueva comprueba:
   - Mismos textos, métricas, tabs, splash
   - Mismo orden de nodos
   - Layout coherente con el dispositivo (o con el `device` guardado en el JSON)
3. En móvil real o DevTools: “Añadir a pantalla de inicio” usa el manifest PWA
4. Sin red: el service worker sirve `index.html` + `app-runtime.js` + JSON (offline-first)

---

## 5. App móvil first (shell completo)

Plantilla / ejemplo con:

1. **Splash** (animada o no, auto-oculta)
2. **Hamburguesa** + **drawer** (menú lateral)
3. **tabs-shell** con paneles hijos
4. Opcional: `api`, `persist`, métricas

### Props útiles del shell

| Componente | Props importantes |
|------------|-------------------|
| `splash` | `title`, `subtitle`, `duration` (ms), `animated`, `autoHide`, `state` |
| `hamburger` | `state` (ej. `drawerOpen`) — debe coincidir con el drawer |
| `drawer` / `side-menu` | `title`, `state`, `side` (`left`\|`right`), hijos = ítems del menú |
| `tabs-shell` | `tabs` (`"Inicio,Datos,Yo"`), `state`, **hijos** = un panel por tab en el mismo orden |

### Estados que maneja el runtime

- `drawerOpen` (bool) — menú
- `tab` / `mainTab` — pestaña activa
- Estados de `metric` / `button` con `state`
- `session` tras login token

---

## 6. LispAI (lógica declarativa)

Panel **Lógica → LispAI**.

| Acción | Botón |
|--------|--------|
| Escribir parches o un árbol `(ui …)` | — |
| Aplicar al canvas | **Aplicar LispAI** |
| Regenerar texto Lisp desde el árbol | **Sync desde árbol** |

### Formas frecuentes

| Forma | Efecto |
|-------|--------|
| `(set-prop n3 text "Hola")` | Cambia una prop |
| `(set-prop n3 size 18)` | Número |
| `(ui (column (pad 12) (text "Título") (button "OK")))` | Sustituye el árbol |
| `(column …)` / `(row …)` | También como árbol raíz |

Más detalle: [LISPAI_FORMS.md](./LISPAI_FORMS.md).

### Ejemplo mínimo

```lisp
(ui
  (column (pad 16) (gap 12)
    (text "Mi panel" (size 20) (weight "bold"))
    (row (gap 10)
      (button "Guardar" (action "save"))
      (button "Cancelar" (action "cancel")))))
```

---

## 7. Backend lite del Studio

El proceso Go expone APIs de desarrollo (no sustituyen un nodo PrismaTec en producción).

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/v1/health` | Vida del runtime |
| GET / POST / DELETE | `/v1/data` | CRUD en memoria (CRM demo) |
| POST | `/v1/auth/login` | Token y rol |
| GET | `/v1/auth/me` | Sesión (Bearer) |
| POST | `/v1/deploy` | Publicar PWA |

### Usuarios de prueba

| Usuario | Clave | Rol |
|---------|-------|-----|
| `admin` | `admin123` | admin |
| `demo` | `demo123` | user |
| `master` | `master123` | master |

En UI: componentes **Login token**, **Gate por rol**, **REST GET** (`url: /v1/health`, `auto: true`).

Botón **Backend** en la barra = atajo a health check (resultado en consola).

---

## 8. Formato `alset-app/v1`

Al exportar o desplegar se genera un documento similar a:

```json
{
  "format": "alset-app/v1",
  "name": "mi-app",
  "tree": [ { "id": "n1", "type": "column", "props": {}, "children": [] } ],
  "states": {},
  "theme": { "primary": "#f5c542" },
  "device": "mobile",
  "rootcid": "cid:alset:…",
  "pwa": true
}
```

Cada nodo:

```json
{
  "id": "n12",
  "type": "button",
  "props": {
    "text": "OK",
    "x": 8,
    "y": 4,
    "width": 120,
    "devices": {
      "mobile": { "x": 8, "y": 4, "width": 120 },
      "tablet": { "x": 16, "width": 160 }
    }
  }
}
```

---

## 9. Errores frecuentes y solución

| Síntoma | Qué hacer |
|---------|-----------|
| Preview vacío | **Correr preview**; revisa consola; «Limpiar preview» y vuelve a correr |
| Error `DOMTokenList` / token vacío | Actualiza el repo (`git pull`); era un bug de clases vacías ya corregido |
| Plantilla móvil falla al cargar | `git pull` + reiniciar `go run`; usa ejemplo «App móvil first» |
| Deploy sin componentes | Debe existir `app-runtime.js` en la carpeta de la app; vuelve a **Desplegar** tras pull |
| Pop-up bloqueado | Abre a mano la URL que imprime la consola (`/apps/…`) |
| API no responde en PWA | Las rutas `/v1/*` solo existen mientras el Studio (Go) está en marcha |
| Nodo no se mueve | Arrastra el nodo concreto (no un botón hijo); usa el marco del preview |

Errores de render se muestran en el **panel rojo aislado** (patrón, dónde, corrección sugerida) sin tumbar el editor.

---

## 10. Checklist antes de dar una app por lista

- [ ] Nombre estable en la barra
- [ ] Árbol coherente en canvas (contenedores con hijos correctos)
- [ ] Preview OK en **Móvil** (y Tablet/Desktop si aplica)
- [ ] Layout crítico guardado por dispositivo (arrastre/props)
- [ ] Splash / drawer / tabs probados si es app móvil
- [ ] **Correr preview** sin errores en consola
- [ ] **Desplegar PWA** → pestaña con la misma UI
- [ ] (Opcional) Export JSON de respaldo

---

## 11. Relación con el ecosistema Alset

| Pieza | Rol |
|-------|-----|
| **Alset Studio** (este repo) | Autoría UI + PWA de desarrollo |
| **app-runtime.js** | Motor único preview ↔ deploy |
| **Alset-JS / Pulse Core** | Primitivas reactivas (camino alternativo en bridge) |
| **LispAI** | UI y parches como datos |
| **PrismaTec / Mind / Gen** | Nodo, políticas, red; el Studio no sustituye ethics del nodo |

---

## 12. Resumen del flujo mental

```
Diseñar (toolbox / ejemplos)
    → Estructurar (canvas)
    → Emular (preview · gestos · layout por dispositivo)
    → Lógica (props · LispAI · backend)
    → Correr preview (validar)
    → Desplegar PWA (pestaña = misma pintura)
    → Export (respaldo JSON)
```

---

*Alset Studio — crear, probar y desplegar con el mismo runtime. Actualizado con emulador por dispositivo, shell móvil y paridad preview/PWA.*
