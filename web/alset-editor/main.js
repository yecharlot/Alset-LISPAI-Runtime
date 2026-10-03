/**
 * Editor visual mínimo solo con Alset-JS-Runtime (PulseCore).
 * No depende del árbol de Alset Studio.
 */
import {
  alsetState, Column, Text, Button, Card, Row, Spacer, mod,
  MapNode, Theme,
} from '../alset/AlsetPulseCore.js';

const codeEl = document.getElementById('code');
const preview = document.getElementById('preview');

const EXAMPLE = `// Ejemplo: contador + mapa (solo Alset-JS)
const count = alsetState(0);

function App() {
  return Column(mod().padding(16).gap(12).fillMaxSize(), () => {
    Text('Alset-JS Editor', mod().sizeText(22).weight('800').color(Theme.current.primary));
    Text('Contador: ' + count.get(), mod().sizeText(16));
    Row(mod().gap(8), () => {
      Button('+1', () => count.set(count.get() + 1));
      Button('Reset', () => count.set(0), mod().background('#333').color('#fff'));
    });
    Spacer(12);
    Text('Mapa MapLibre (MapNode)', mod().sizeText(13).color('#999'));
    MapNode(mod().height(220).radius(12), {
      center: [-75.2062, 20.1453],
      zoom: 12,
    });
  });
}
App();
`;

codeEl.value = EXAMPLE;

function run() {
  preview.innerHTML = '';
  const host = document.createElement('div');
  host.style.minHeight = '100%';
  preview.appendChild(host);
  // Ejecutar el código del usuario en un ámbito con las primitivas
  try {
    const fn = new Function(
      'alsetState', 'Column', 'Text', 'Button', 'Card', 'Row', 'Spacer', 'mod', 'MapNode', 'Theme', 'root',
      codeEl.value.replace(/App\(\);\s*$/, '') +
        '\nconst __view = (typeof App === "function") ? App() : null;\n' +
        'if (__view && root) root.appendChild(__view);'
    );
    fn(alsetState, Column, Text, Button, Card, Row, Spacer, mod, MapNode, Theme, host);
  } catch (e) {
    const err = document.createElement('pre');
    err.style.color = '#ff8a80';
    err.style.padding = '12px';
    err.textContent = 'Error: ' + (e && e.message ? e.message : e);
    preview.appendChild(err);
    console.error(e);
  }
}

document.getElementById('btn-run').onclick = run;
document.getElementById('btn-example').onclick = () => {
  codeEl.value = EXAMPLE;
  run();
};
run();
