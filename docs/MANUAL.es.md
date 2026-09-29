# Manual de Alset Studio (LISPAI Runtime)

Guía práctica para crear, probar y desplegar aplicaciones con **LispAI**, **Alset-JS** y el servidor Go del studio.

## 1. Arranque

```bash
git clone https://github.com/yecharlot/Alset-LISPAI-Runtime.git
cd Alset-LISPAI-Runtime
go run ./cmd/alset-studio -addr :5177 -dir web
```

Abre **http://127.0.0.1:5177/**

| Panel | Uso |
|-------|-----|
| **Toolbox** (izq.) | Arrastra componentes o haz clic para añadirlos |
| **Canvas** | Árbol visual de la app |
| **Props** (der.) | Edita propiedades del nodo seleccionado |
| **LispAI** | Programa la UI como datos; aplica parches o árboles completos |
| **Preview** | Vista en vivo Móvil / Tablet / Desktop |
| **Consola** | Logs y errores aislados (no congelan el PC) |

## 2. Crear una app de cero

1. Pon un **nombre** en la barra superior (`mi-app`).
2. Elige una **plantilla** o arrastra **Columna**, **Texto**, **Fila**, **Botón**.
3. Selecciona un nodo → edita props a la derecha (el preview se actualiza al vuelo).
4. En **LispAI**, puedes:
   - Parchear: `(set-prop n1 text "Hola")`
   - Reconstruir: pega un árbol `(ui (column (pad 12) (text "Título") (row (button "A") (button "B"))))` y pulsa **Aplicar Lisp**.
5. Cambia **Móvil / Tablet / Desktop**: el marco y los breakpoints se recalculan (**hot-reload** del preview).
6. **Export** descarga el JSON `alset-app/v1`.
7. **Desplegar PWA** publica en `/apps/<nombre>/` y **abre una pestaña** con la versión final.

## 3. LispAI: formas útiles

| Forma | Efecto |
|-------|--------|
| `(set-prop id key "valor")` | Cambia una prop de un nodo (`text`, `gap`, …) |
| `(set-prop id key 16)` | Valor numérico |
| `(ui …)` / `(column …)` / `(row …)` | Sustituye el árbol visual |
| `(text "…")` `(button "…")` `(card …)` | Widgets |
| `(theme (primary "#e8c547") …)` | Tema |
| `(def x 1)` `(si cond a b)` `(+ 1 2)` | Lógica |
| `(login-token …)` `(auth-gate (role "admin") …)` | Acceso por rol |

Lista completa: [LISPAI_FORMS.md](./LISPAI_FORMS.md).

### Ejemplo completo

```lisp
(ui
  (column (pad 16) (gap 12)
    (text "Mi panel" (size 20) (weight "bold"))
    (row (gap 10)
      (button "Guardar" (action "save"))
      (button "Cancelar" (action "cancel")))
    (login-token (title "Entrar"))
    (auth-gate (role "admin") (deny "Solo admin")
      (text "Zona restringida"))))
```

## 4. Roles y tokens (backend lite)

El servidor incluye autenticación de prueba:

| Usuario | Clave | Rol |
|---------|-------|-----|
| `admin` | `admin123` | admin |
| `demo` | `demo123` | user |
| `master` | `master123` | master |

- `POST /v1/auth/login` → `{ token, role, views }`
- `GET /v1/auth/me` (header `Authorization: Bearer …`)
- `GET /v1/data` / `POST /v1/data` — datos de demo
- `POST /v1/deploy` — publica la app

En el toolbox: **Login token**, **Gate por rol**, **Badge de rol**. El estado de sesión vive en `alsetState('session')`.

## 5. Preview por dispositivo

- **Móvil** ~390px · **Tablet** ~768px · **Desktop** ~1100px  
- Alset-JS usa el ancho del marco (no el del navegador) para breakpoints `sm/md/lg/xl`.  
- Los botones en un **Row** permanecen en horizontal al hacer clic (salvo que actives `wrap`).

## 6. Flujo recomendado

```
Diseñar en canvas → afinar en LispAI → probar Móvil/Tablet/Desktop
    → Export JSON → Desplegar PWA → abrir pestaña de la app
```

## 7. Seguridad del sandbox

- Errores de Lisp/UI se capturan en el panel de error aislado.
- El host no se bloquea por un árbol defectuoso.
- El budget de render avisa si el árbol es demasiado pesado.

## 8. Relación con el ecosistema Alset

| Pieza | Rol |
|-------|-----|
| **Alset-JS Runtime** | Primitivas `Column`/`Row`/`Button`/`alsetState` |
| **LispAI** | UI y lógica como S-expresiones |
| **PrismaTec / Core** | Nodo, Mind, Gen (este studio no sustituye políticas del nodo) |
| **Formato `alset-app/v1`** | Intercambio de árboles + tema + estados |

---

*Alset Studio — autoría rápida sin perder la potencia de LispAI y Alset-JS.*
