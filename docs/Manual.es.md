# Manual de Alset Studio (ES)

Guía de 0 a 100 para crear, probar y desplegar apps con **Alset-LISPAI-Runtime**.

## 1. Arranque

```bash
cd Alset-LISPAI-Runtime
go run ./cmd/alset-studio -addr :5177 -dir web
```

Abre **http://127.0.0.1:5177/**  
No hace falta npm.

## 2. Mapa del workbench

| Zona | Uso |
|------|-----|
| **Toolbox** (izq.) | Plantillas, componentes, colores |
| **Canvas** (centro) | Árbol de la UI; arrastrar y soltar |
| **Preview** | Vista viva con Alset-JS + `alsetState` |
| **Props / LispAI** (der.) | Editar nodo o el programa Lisp completo |
| **Lógica · Backend** | Probar GET/POST al API lite |
| **Consola / JSON** | Depuración y export mental del modelo |

Paneles redimensionables (arrastrar divisores) y ocultables (× o toggles de la barra). El layout se guarda solo.

## 3. Crear una app en 5 pasos

1. **Ejemplos** → elige *Landing* / *SaaS* / *CRM* → **Cargar** o **Correr**.
2. O arrastra **Columna**, **Texto**, **Botón**, **Input** al canvas.
3. Selecciona un nodo → cambia props (texto, `state`, URL API).
4. Mira el **Preview** (Móvil / Tablet / Desktop).
5. **Desplegar PWA** → se abre una pestaña con la app en `/apps/<nombre>/`.

## 4. Estado (`alsetState`)

- Pon el mismo valor en `state` de un **Botón** y una **Métrica**.
- Cada clic incrementa el estado; solo se recomponen nodos dependientes (no todo el DOM).
- **Persistencia**: componente *Persistencia* o `localStorage` vía ese nodo.

## 5. LispAI (panel derecho)

Puedes:

### A) Árbol completo (recomendado tras Sync)

1. **Sync árbol** — genera Lisp desde el canvas.
2. Edita, por ejemplo el texto de un nodo o la estructura.
3. **Aplicar** — reconstruye el canvas.

Ejemplo mínimo:

```lisp
(ui
  (column (pad 12) (gap 10)
    (text "Hola Studio" (size 20) (weight bold) (color primary))
    (button "Sumar" (state "count") (anim "fade"))
    (metric (title "Total") (state "count") (value "0"))
  )
)
```

### B) Parches puntuales

```lisp
(set-prop n1 text "Nuevo título")
(set-state count 3)
```

### C) Hot-reload

Al escribir, si los paréntesis están balanceados, a los ~500 ms se aplica solo (hot-reload). Si hay error, el **sandbox** muestra patrón y corrección sin colgar el PC.

## 6. Preview multi-dispositivo

- **Móvil / Tablet / Desktop** cambian el ancho del marco **y** el breakpoint Alset (`sm` / `md` / `lg`).
- Sirve para ver cómo queda la UI responsive antes de publicar.

## 7. Backend lite (fullstack mínimo)

| Método | Ruta | Uso |
|--------|------|-----|
| GET/POST | `/v1/data` | Lista / crea registros JSON |
| GET | `/v1/health` | Salud del Studio |
| POST | `/v1/deploy` | Publica PWA + RootCID |

En **Lógica · Backend**:

1. Rellena estados (p.ej. email, msg) desde formularios en el preview.
2. **Probar POST** envía esos estados a `/v1/data`.
3. **GET datos** lista lo guardado.

La plantilla **CRM** ya enlaza formulario de contacto → API → tabla.

## 8. Despliegue

1. Nombre de app en la barra.
2. **Desplegar PWA**.
3. Se abre la app en otra pestaña (UI real, no solo JSON).
4. Incluye `manifest.webmanifest`, `sw.js`, `app.alset.json`, `rootcid`.

## 9. Formato `alset-app/v1`

```json
{
  "format": "alset-app/v1",
  "name": "mi-app",
  "tree": [ /* nodos */ ],
  "states": { },
  "rootcid": "cid:alset:…",
  "agent": "studio",
  "pwa": true
}
```

Compatible con el ecosistema Alset (no es un `.tcz` de Tiny Core).

## 10. Buenas prácticas

- Empieza por un **Ejemplo**, no desde cero.
- Un `state` = una fuente de verdad.
- Usa el sandbox: si falla Lisp, lee **Patrón** y **Corrección**.
- **Limpiar preview** si el marco se ve raro tras muchos cambios.
- No evalúes Lisp arbitrario de terceros sin revisar (el Studio limita formas UI / set-prop / set-state).

## 11. De aquí a producción

| Capa | Hoy en Studio | Después |
|------|----------------|---------|
| UI | Alset-JS + LispAI | Shell en Alset Desktop |
| Datos | `/v1/data` en memoria | PrismaTec / AlsetOS organisms |
| Identidad | RootCID de contenido | RootCID de organismo + policy |
| Agentes | token `agent` en export | Mind + genes en Core |

## 12. Atajos mentales

1. Arrastrar = estructura  
2. Props / Lisp = contenido y comportamiento  
3. Preview dispositivo = aceptación visual  
4. Lógica = probar API  
5. Desplegar = compartir / PWA  
