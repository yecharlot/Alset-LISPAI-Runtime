# Alset-LISPAI-Runtime

Motor **ordenado** para construir interfaces de próxima generación:

- **Alset-JS-Runtime** — primitivas, `alsetState`, pulsos, sin recomposición total del DOM  
- **LispAI embebido** — la UI se describe y manipula como datos (S-expresiones)  
- **Go** — sirve estáticos y orquesta el studio (**sin npm**)  
- **Studio limpio** — editor · vista previa · consola · árbol  

## Arranque (solo Go)

```bash
git clone https://github.com/yecharlot/Alset-LISPAI-Runtime.git
cd Alset-LISPAI-Runtime
go run ./cmd/alset-studio -addr :5177
```

Abre **http://127.0.0.1:5177/**

No hace falta Node ni `npm install`.

## Flujo de trabajo

1. Escribes LispAI a la izquierda.  
2. **Ejecutar** → evalúa LispAI → árbol de datos.  
3. Alset-JS **proyecta** el árbol en la vista previa.  
4. Consola y panel «UI como datos» para depurar.

## Ejemplo

```lisp
(ui
  (column (pad 8) (gap 12)
    (card (pad 16)
      (text "Hola" (size 20) (weight bold) (color primary)))
    (button "OK" (on-click "ok"))))
```

## Estructura

```text
cmd/alset-studio/   → servidor Go
web/
  index.html        → shell ordenado
  css/studio.css    → diseño limpio (densidad tipo producto)
  alset/            → AlsetPulseCore (módulos ES)
  lispai/           → parse + eval
  studio/           → render bridge + main
```

## Principios

1. **Módulos ES en el navegador** — no bundler obligatorio.  
2. **Go genera/sirve estáticos** — eficiente, testeable, un binario.  
3. **LispAI no es caos** — pocas formas claras orientadas a UI.  
4. **La interfaz es dato** — auditable, versionable, transformable.  

Ver `docs/VISION.es.md`.
