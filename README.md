# Alset-LISPAI-Runtime

**Motor de desarrollo web declarativo** que une:

- **Alset-JS-Runtime** — UI por pulsos, sin recomposición total del DOM  
- **LispAI** — programación simbólica / metaprogramación de interfaces como datos  
- **Studio** — editor, preview (AlsetInspector), consola, árbol UI, RootCID  
- **Tokens de organismo** — gene, agent, mind-note, rootcid (abstracción ligera)  
- **Mobile-first · offline-first** — CSS tokens + service worker  

> No reemplaza PrismaTec-Core ni AlsetOS. Es el **runtime de autoría de interfaces**.

## Inicio rápido

```bash
# Requiere Node 18+
cd Alset-LISPAI-Runtime
npm install
npm run dev
# → http://127.0.0.1:5177
```

Estructura junto a Alset-JS (opcional; el core va vendored en `src/vendor/`):

```text
pulso-dev/
  Alset-JS-Runtime/
  Alset-LISPAI-Runtime/   ← este repo
```

## LispAI → UI (ejemplo)

```lisp
(ui
  (column (pad 16) (gap 12)
    (text "Hola" (size 22) (weight bold) (color primary))
    (button "OK" (on-click "ping"))))
```

El evaluador produce un **árbol de datos**; el bridge lo proyecta a `Column` / `Row` / `Text` de Alset-JS.

## Docs

- [ES — Visión](docs/VISION.es.md)  
- [EN — Vision](docs/VISION.en.md)  
- [LispAI forms](docs/LISPAI_FORMS.md)

## Principios

1. La interfaz es **dato direccionable**, no solo JSX oculto.  
2. LispAI no autoriza acciones de negocio críticas (eso sigue en Core/Policy).  
3. Offline por defecto; online mejora sensores y sync.  
4. No inventar estado de mercado: este runtime es de **autoría UI**, no de inteligencia económica.
