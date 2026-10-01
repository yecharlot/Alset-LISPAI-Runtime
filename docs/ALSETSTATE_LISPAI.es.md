# alsetState ↔ LispAI (motor fusionado)

En Alset Studio la **memoria reactiva** y el **intérprete LispAI** comparten el mismo almacén.

```
UI (input, list, metric)  ⇄  alsetState(registry)  ⇄  LispAI
         ↑                         ↑
   setState / .get()         (get-state) (set-state)
```

## Formas Lisp de estado

```lisp
(get-state "contador")
(set-state "contador" 0)
(incf-state "contador")
(incf-state "contador" 5)
(toggle-state "drawerOpen")
(when-state "ruta" "detalle" (set-state "visto" true))
(states)
(progn (set-state "a" 1) (set-state "b" 2) (get-state "a"))
(+ 1 2 3)
```

## En el Studio

1. Panel **LispAI** (derecha / abajo).
2. Escribe por ejemplo:
   ```lisp
   (progn (set-state "contador" 0) (incf-state "contador") (get-state "contador"))
   ```
3. **Aplicar Lisp** → el resultado sale en consola; los estados quedan en el registry.
4. Un **metric** o **list** con `state: contador` / `items` refleja el valor tras **Correr preview**.

También desde consola del navegador (con Studio abierto):

```js
AlsetState.set('contador', 3)
AlsetState.get('contador')
AlsetState.eval('(incf-state "contador")')
AlsetState.dump()
```

## UI + Lisp juntos

| UI | Lisp | Resultado |
|----|------|-----------|
| input `state: nombre` | `(get-state "nombre")` | Lee lo tecleado |
| botón / lógica | `(set-state "items" …)` | La list con `state: items` se actualiza |
| hamburger `drawerOpen` | `(toggle-state "drawerOpen")` | Abre/cierra drawer |

## Árbol visual vs estado

- `(set-prop n1 text "Hola")` → muta el **árbol** del canvas (estructura).
- `(set-state "x" 1)` → muta la **memoria** reactiva (lógica en runtime).

Ambos conviven: el árbol describe la UI; alsetState + LispAI describen el comportamiento.

## Mini-nodo (Go /api/lispai)

```bash
curl -s -X POST http://127.0.0.1:5177/api/lispai \
  -H 'Content-Type: application/json' \
  -d '{"cmd":"(set-state \"ping\" 1)"}'
```

En el **navegador** la fusión completa usa `AlsetLispEngine` + registry del Studio (más potente que el subset Go).
