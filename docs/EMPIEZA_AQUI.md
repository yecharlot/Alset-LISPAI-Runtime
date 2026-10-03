# Empieza aquí (en lenguaje claro)

Este proyecto te deja **crear aplicaciones** arrastrando piezas (Alset Studio) y **probarlas** en el móvil o el PC. También puedes escribir apps solo con el lenguaje Alset-JS.

## Las tres puertas

1. **Alset Studio** (`/` en el servidor del studio)  
   Construyes la app con el mouse (toolbox, canvas, preview). Sirve para casi todo.

2. **Alset-JS Editor** (`/alset-editor/`)  
   Escribes código solo con las piezas de Alset-JS-Runtime (Column, Button, MapNode…). No usa el árbol de Studio.

3. **AlsetOS** (ejemplo en Studio)  
   Es la “pantalla de inicio” donde caben las apps que creaste, como si fueran programas del sistema (`/w/nombre.app.ans` en un nodo Alset).

## Primeros 5 minutos

1. Arranca el Studio.
2. Abre **Ejemplos** y carga **Alset Ride (tipo Uber)**.
3. Pulsa **Correr preview**.
4. Elige origen y destino, luego **Calcular ruta y tarifa**.  
   Verás la línea en el mapa (ruta real de OSRM) y una tarifa estimada.
5. Prueba **Pedir conductor** y el panel de Mind si quieres hablar con el asistente.

## ¿Qué es Mind? ¿Es una IA?

**Sí, pero no es un ChatGPT.**

Mind es un **agente de decisión** que:

- Lee lo que escribes.
- Pasa el mensaje por varios “órganos” (diálogo, memoria, ética, curiosidad…).
- Cada órgano responde con lógica **ternaria** (0, 1 o 2), no con probabilidades de palabras.
- Puede guardar hechos en memoria (CID / episodios).
- Puede decir **no** con fuerza (ética en 2) cuando el pedido es peligroso.

### ¿Qué gana una app si embebe Mind?

| Sin Mind | Con Mind |
|----------|----------|
| Solo botones y formularios | Un asistente que entiende pedidos en texto |
| Reglas fijas if/else | Decisiones 0/1/2 que se pueden auditar |
| No recuerda al usuario | Puede anclar hechos (“me llamo Ana”) |
| No hay freno ético | Puede bloquear acciones de riesgo |

Zyrion es el **motor de decisión 0/1/2** (el 2 “absorbe” y corta el flujo). Mind usa Zyrion por dentro.

## Cómo meter Mind en tu app

1. Arrastra **mind-panel** desde el toolbox.  
2. O abre la pestaña **Mind · Zyrion** en Lógica y prueba el latido.  
3. Al desplegar, la app puede hablar con el mini-nodo embebido o con la API del nodo.

## Mapas y viajes (tipo Uber)

- El mapa usa **MapLibre** (igual que Alset-JS).
- Las rutas se calculan con **OSRM** (servidor público de rutas).
- Las direcciones se eligen con **address-picker** o se buscan con **geocode**.

## Documentos útiles (también en lenguaje simple)

- `docs/MAPAS_EN_SIMPLE.md` — mapas y rutas sin jerga
- `docs/EJEMPLOS_PACK.es.md` — lista de ejemplos
- `docs/COMPONENTES_Y_CONECTORES.es.md` — qué hace cada pieza

## Si algo se ve mal

1. `git pull`
2. Reinicia el Studio
3. En el navegador: **Ctrl+Shift+R** (recarga forzada)
