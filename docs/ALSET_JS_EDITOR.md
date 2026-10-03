# Alset-JS Editor (en claro)

## ¿Qué es?

Es el **hermano** de Alset Studio, pero todo se hace **solo con Alset-JS-Runtime** (PulseCore):

- Escribes o insertas código (`Column`, `Button`, `MapNode`, `alsetState`…).
- Ves el resultado en un marco de **móvil, tablet, desktop o reloj**.
- Despliegas la app en una carpeta servida por el mismo Studio (`/apps/nombre/`).
- Esa app es compatible con **AlsetOS** y con nodos Alset (`nombre.app.ans`).

No usa el árbol visual de Studio ni el toolbox de nodos JSON. El código **es** la app.

## Cómo abrirlo

Con el Studio en marcha:

```text
http://127.0.0.1:5177/alset-editor/
```

## Cómo trabajar

1. Elige un **ejemplo** o una **plantilla** (contador, login, mapa, tienda, AlsetOS).
2. O pulsa un **componente** del panel izquierdo para insertar un trozo de código.
3. Pulsa **Ejecutar** (o cambia de dispositivo: se vuelve a ejecutar).
4. Mira los **estados vivos** abajo a la derecha.
5. Pon un nombre y **Desplegar** → se abre `/apps/tu-nombre/`.

La función principal debe llamarse **`App`** y devolver el árbol de nodos.

## Despliegue

El servidor guarda:

- `app.js` — tu código  
- `AlsetPulseCore.js` — el runtime  
- `index.html` + `app-boot.js` — arranque  
- `manifest.webmanifest` — PWA  

En un nodo Alset puedes registrar esa carpeta y servirla como `/w/tu-nombre.app.ans`.

## Studio vs Alset-JS Editor

| | Studio | Alset-JS Editor |
|--|--------|-----------------|
| Forma de crear | Arrastrar nodos | Código / plantillas |
| Estado | `state` en el árbol | `alsetState(...)` |
| Preview | Emulador de árbol | Mismo código nativo |
| Deploy | Árbol + app-runtime | Código + PulseCore |
| AlsetOS | Sí | Sí (mismo ANS) |

Ambos pueden convivir en el ecosistema. Elige Studio si prefieres el ratón; Alset-JS si quieres el poder total del runtime en código.

## Export desde Studio → Alset-JS

En **Alset Studio**:

1. Construye el árbol visual.
2. **→ Alset-JS**: descarga `.alset.js` generado (`treeToAlsetJS`).
3. **JS Editor**: abre `/alset-editor/?from=studio` con el código en `sessionStorage`.

Los estados del bridge se declaran como `alsetState(...)`. Column/Row/Card/Text/Button/Map/Icon/Input/Gradient se mapean a primitivas PulseCore. Tipos aún no mapeados salen como comentario + Column.

## Bosquejo → código

En el Alset-JS Editor, **Bosquejo→código**:

```text
titulo: Mi tienda
texto: Ofertas del día
boton: Ver catálogo
input: buscar
fila: Inicio | Carrito | Perfil
mapa
card: Producto destacado
```

Genera un `function App()` listo para ejecutar y desplegar.
