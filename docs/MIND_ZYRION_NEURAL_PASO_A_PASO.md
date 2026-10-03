# Mind, Zyrion y red neuronal en las apps — guía práctica

Esta guía es para **crear apps potentes** en Alset Studio o en el **Alset-JS Editor** sin asumir que eres experto en el nodo.

## 1. Qué es cada pieza (en una frase)

| Pieza | Qué hace | Qué no es |
|-------|----------|-----------|
| **Mind** | Organismo de decisión: órganos 0/1/2, memoria, voz | Un ChatGPT |
| **Zyrion** | Evalúa un campo con lógica ternaria (0 seguir, 1 matizar, 2 sumidero) | Una red neuronal |
| **alsetNeuralState** | Estado reactivo con clave (útil para pesos/sensores en la UI) | Entrenar un modelo grande |
| **Silogismos** | Hechos sujeto–relación–objeto con confianza 0/1/2 y deducción | Magia: son reglas explícitas |

## 2. Caso A — Chat / agente dentro de tu app

**Objetivo:** el usuario escribe y recibe respuesta de Mind.

### En Alset-JS Editor

1. Carga el ejemplo **Mind + Zyrion en app**.
2. O inserta el snippet `mind` del toolbox.
3. Ejecuta. Si el Studio corre con mini-nodo/PrismaTec, `POST /api/mind/tick` responde.
4. Despliega: la app en `/apps/tu-nombre/` llamará al mismo origen.

### En Studio

1. Panel **Mind · Zyrion** (derecha).
2. Escribe un mensaje → **Enviar latido**.
3. O arrastra el componente `mind-panel` al canvas.

**Cuándo usarlo:** soporte, onboarding, “preguntar al nodo”, no para inventar hechos médicos/legales sin evidencias.

## 3. Caso B — Decisión ternaria (filtro / alarma)

**Objetivo:** dos o más señales → un estado 0, 1 o 2.

1. Snippet `zyrion` o panel Zyrion del editor.
2. Interpreta: **2** = prioridad alta / bloqueo / “hay que subir de nivel”; **0** = no aplica; **1** = ambiguo.
3. En la UI, muestra un color o bloquea un botón si el resultado es 2.

**Ejemplo mental:** temperatura alta + vibración alta → riesgo 2 → no arrancar máquina en la app.

## 4. Caso C — Self-model (¿puedo ejecutar X?)

**Objetivo:** la app “sabe” si una capacidad es ejecutable ahora.

1. Ejemplo **Silogismos / Self-model**.
2. Hechos:
   - organismo tiene_capacidad backup [2]
   - backup requiere storage [2]
   - storage disponible [2|0|1]
   - backup permite_policy [2]
3. **Infer** → `puede_ejecutar(backup)` cambia si cambias la disponibilidad.

En producción (PrismaTec) el mismo patrón vivirá en `mind_reason` + API assert/ask (ver `docs/INFERENCE_PRIMITIVE_ANALYSIS.md` en PrismaTec).

**Importante:** conclusión 2 ≠ permiso de ejecutar. Policy/ethics van después.

## 5. Caso D — Estados neuronales en UI

```js
const peso = alsetNeuralState("sensor.temp", 0.4);
Text(String(peso.get()));
```

Sirve para **nombrar** valores que quieras observar en el panel “Neuronal” del editor y reutilizar entre vistas. No sustituye un modelo ML en servidor.

## 6. Caso E — App AlsetOS

1. Ejemplo **AlsetOS Launcher**.
2. Despliega con nombre `mi-modulo` → URL `/apps/mi-modulo/` y ANS `mi-modulo.app.ans`.
3. En un nodo Alset, registra la app en el espacio `/w/mi-modulo.app.ans`.

## 7. Checklist antes de desplegar

- [ ] `function App()` devuelve el árbol
- [ ] Preview móvil/tablet/desktop OK
- [ ] Si usas Mind/Zyrion API, el host las expone
- [ ] Silogismos: no ejecutas acciones solo porque conf=2
- [ ] Multimedia: URLs accesibles offline-first si hace falta cache

## 8. Dónde trabajar

| Tarea | Herramienta |
|-------|-------------|
| Arrastrar UI visual | Alset Studio `/` |
| Código nativo + ejemplos repo | `/alset-editor/` |
| Export Studio → JS | botón **→ Alset-JS** / **JS Editor** |
| Documentación silogismos (arquitectura) | PrismaTec `docs/INFERENCE_PRIMITIVE_ANALYSIS.md` |
