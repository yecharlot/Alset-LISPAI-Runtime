/**
 * Alset-JS Editor — paridad de potencia con Studio, solo Runtime nativo.
 */
import * as Core from '../alset/AlsetPulseCore.js';

const {
  alsetState, Column, Row, Text, Button, Card, Spacer, mod, MapNode,
  Theme, Icon, Input, List, Image, Router, navigateTo, currentRoute,
  Animate, createToast, FloatingButton, GradientLayer, LoginForm, RegisterForm,
  AudioNode, VideoNode, ALSET_ICONS,
} = Core;

const $ = (id) => document.getElementById(id);
const codeEl = $('code');
const preview = $('preview');
const frame = $('device-frame');
const statusEl = $('status');
const statesOut = $('states-out');

const DEVICES = {
  mobile: { label: 'Móvil 390×720', w: 390, h: 720 },
  tablet: { label: 'Tablet 768×1024', w: 768, h: 1024 },
  desktop: { label: 'Desktop', w: null, h: 700 },
  watch: { label: 'Watch 198×242', w: 198, h: 242 },
};
let deviceId = 'mobile';

/** Registro de estados creados en la sesión (inspección) */
const liveStates = new Map();
function trackState(name, st) {
  liveStates.set(name, st);
  paintStates();
  const orig = st.set.bind(st);
  st.set = (v) => {
    orig(v);
    paintStates();
  };
  return st;
}
function paintStates() {
  if (!statesOut) return;
  const lines = [];
  liveStates.forEach((st, k) => {
    try {
      lines.push(k + ' = ' + JSON.stringify(st.get()));
    } catch {
      lines.push(k + ' = ' + String(st.get()));
    }
  });
  statesOut.textContent = lines.length ? lines.join('\n') : 'Sin estados aún (usa alsetState en el código).';
}

const SNIPPETS = {
  text: `Text("Hola Alset-JS", mod().sizeText(20).weight("800").color(Theme.current.primary))`,
  button: `Button("Acción", () => count.set(count.get() + 1))`,
  card: `Card(mod().padding(16), () => {
    Text("Tarjeta", mod().weight("700"));
    Text("Contenido nativo", mod().sizeText(13).color("#999"));
  })`,
  row: `Row(mod().gap(8), () => {
    Button("A", () => {});
    Button("B", () => {});
  })`,
  input: `Input(nameState, mod().fillMaxWidth(), { placeholder: "Escribe…" })`,
  map: `MapNode(mod().height(220).radius(12), { center: [-75.2062, 20.1453], zoom: 12 })`,
  icon: `Icon("pulse", mod().size(28).color(Theme.current.primary))`,
  gradient: `GradientLayer({ from: "#f4b400", to: "#1a1200" }, () => {
    Text("Hero", mod().sizeText(22).weight("800"));
  }, mod().padding(16).radius(12))`,
  login: `LoginForm({ onSubmit: (u, p) => console.log(u, p) })`,
  fab: `FloatingButton("+", () => count.set(count.get() + 1))`,
  spacer: `Spacer(16)`,
};

const TEMPLATES = {
  counter: `// Contador reactivo
const count = alsetState(0);

function App() {
  return Column(mod().padding(16).gap(12).fillMaxSize(), () => {
    Text("Contador", mod().sizeText(22).weight("800").color(Theme.current.primary));
    Text(String(count.get()), mod().sizeText(36).weight("800"));
    Row(mod().gap(8), () => {
      Button("+1", () => count.set(count.get() + 1));
      Button("Reset", () => count.set(0), mod().background("#333").color("#fff"));
    });
  });
}
`,
  login: `const user = alsetState("");
function App() {
  return Column(mod().padding(20).gap(14).fillMaxSize(), () => {
    Text("Entrar", mod().sizeText(24).weight("800").color(Theme.current.primary));
    LoginForm({ onSubmit: (u) => user.set(u) });
    if (user.get()) Text("Hola, " + user.get(), mod().sizeText(14));
  });
}
`,
  mapHome: `function App() {
  return Column(mod().padding(12).gap(10).fillMaxSize(), () => {
    Text("Mapa nativo", mod().sizeText(18).weight("800").color(Theme.current.primary));
    MapNode(mod().height(280).radius(14), {
      center: [-75.2062, 20.1453],
      zoom: 12,
    });
    Text("MapLibre · Guantánamo", mod().sizeText(12).color("#999"));
  });
}
`,
  osHome: `const toast = alsetState("");
function App() {
  return Column(mod().padding(16).gap(12).fillMaxSize(), () => {
    Text("AlsetOS", mod().sizeText(26).weight("800").color(Theme.current.primary));
    Text("Apps direccionables · ANS", mod().sizeText(13).color("#999"));
    Row(mod().gap(10), () => {
      Card(mod().padding(12), () => {
        Text("Ride", mod().weight("700"));
        Button("Abrir", () => toast.set("ride-share.app.ans"));
      });
      Card(mod().padding(12), () => {
        Text("Shop", mod().weight("700"));
        Button("Abrir", () => toast.set("shop.app.ans"));
      });
    });
    if (toast.get()) Text("→ " + toast.get(), mod().sizeText(12).color(Theme.current.primary));
  });
}
`,
  shop: `const cart = alsetState(0);
const items = alsetState([
  { name: "Pulse Sneaker", price: "45 USD" },
  { name: "Chronos Watch", price: "89 USD" },
]);
function App() {
  return Column(mod().padding(14).gap(12).fillMaxSize(), () => {
    Text("PULSE STORE", mod().sizeText(22).weight("800").color(Theme.current.primary));
    Text("Carrito: " + cart.get(), mod().sizeText(14));
    items.get().forEach((it) => {
      Card(mod().padding(12), () => {
        Text(it.name, mod().weight("700"));
        Text(it.price, mod().sizeText(13).color("#999"));
        Button("Agregar", () => cart.set(cart.get() + 1));
      });
    });
  });
}
`,
};

const EXAMPLES = [
  { id: 'counter', name: 'Contador', blurb: 'alsetState + botones', code: TEMPLATES.counter },
  { id: 'login', name: 'Login nativo', blurb: 'LoginForm + estado', code: TEMPLATES.login },
  { id: 'map', name: 'Mapa MapLibre', blurb: 'MapNode nativo', code: TEMPLATES.mapHome },
  { id: 'os', name: 'AlsetOS launcher', blurb: 'Tarjetas ANS', code: TEMPLATES.osHome },
  { id: 'shop', name: 'Tienda', blurb: 'Lista + carrito', code: TEMPLATES.shop },
];

function setStatus(msg, ok) {
  statusEl.textContent = msg;
  statusEl.style.color = ok === false ? '#ff8a80' : ok ? '#4caf50' : 'var(--muted)';
}

function insertSnippet(snippet) {
  const ta = codeEl;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const before = ta.value.slice(0, start);
  const after = ta.value.slice(end);
  const needsNL = before && !before.endsWith('\n');
  ta.value = before + (needsNL ? '\n' : '') + snippet + '\n' + after;
  ta.focus();
}

function buildToolbox() {
  const box = $('toolbox');
  box.innerHTML = '';
  Object.keys(SNIPPETS).forEach((k) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tool';
    b.innerHTML = `<strong>${k}</strong><small>Insertar en el código</small>`;
    b.onclick = () => insertSnippet(SNIPPETS[k]);
    box.appendChild(b);
  });
  const tpl = $('templates');
  tpl.innerHTML = '';
  Object.keys(TEMPLATES).forEach((k) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tpl';
    b.innerHTML = `<strong>${k}</strong><small>Plantilla completa</small>`;
    b.onclick = () => {
      codeEl.value = TEMPLATES[k];
      run();
    };
    tpl.appendChild(b);
  });
  const icons = $('icons');
  icons.innerHTML = '';
  const names = ALSET_ICONS ? Object.keys(ALSET_ICONS).slice(0, 24) : ['pulse', 'home', 'user', 'map', 'star'];
  names.forEach((name) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'icon-btn';
    b.title = name;
    b.textContent = (ALSET_ICONS && ALSET_ICONS[name]) || '◆';
    b.onclick = () => insertSnippet(`Icon("${name}", mod().size(24).color(Theme.current.primary))`);
    icons.appendChild(b);
  });
}

function buildExamples() {
  const list = $('examples-list');
  list.innerHTML = '';
  EXAMPLES.forEach((ex) => {
    const card = document.createElement('div');
    card.className = 'ex-card';
    card.innerHTML = `<h4>${ex.name}</h4><p>${ex.blurb}</p>`;
    const load = document.createElement('button');
    load.type = 'button';
    load.className = 'btn gold';
    load.textContent = 'Cargar';
    load.onclick = () => {
      codeEl.value = ex.code;
      $('app-name').value = ex.id;
      $('examples-drawer').hidden = true;
      run();
    };
    card.appendChild(load);
    list.appendChild(card);
  });
}

function setDevice(id) {
  deviceId = id;
  document.querySelectorAll('.dev').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-d') === id);
  });
  const d = DEVICES[id];
  $('dev-label').textContent = d.label;
  frame.className = 'device-frame ' + id;
  if (d.w) {
    frame.style.width = d.w + 'px';
    frame.style.height = d.h + 'px';
  } else {
    frame.style.width = '100%';
    frame.style.maxWidth = '1100px';
    frame.style.height = d.h + 'px';
  }
  run();
}

function run() {
  liveStates.clear();
  preview.innerHTML = '';
  const host = document.createElement('div');
  host.style.minHeight = '100%';
  preview.appendChild(host);

  // Proxy alsetState para inspección
  const trackedAlsetState = (initial) => {
    const st = alsetState(initial);
    const name = 's' + (liveStates.size + 1);
    return trackState(name, st);
  };

  try {
    const src = codeEl.value;
    const fn = new Function(
      'alsetState', 'Column', 'Row', 'Text', 'Button', 'Card', 'Spacer', 'mod', 'MapNode',
      'Theme', 'Icon', 'Input', 'List', 'Image', 'Router', 'navigateTo', 'currentRoute',
      'Animate', 'createToast', 'FloatingButton', 'GradientLayer', 'LoginForm', 'RegisterForm',
      'AudioNode', 'VideoNode', 'root', 'Core',
      src + "\n;\nif (typeof App === 'function') { const v = App(); if (v && root) root.appendChild(v); }"
    );
    fn(
      trackedAlsetState, Column, Row, Text, Button, Card, Spacer, mod, MapNode,
      Theme, Icon, Input, List, Image, Router, navigateTo, currentRoute,
      Animate, createToast, FloatingButton, GradientLayer, LoginForm, RegisterForm,
      AudioNode, VideoNode, host, Core
    );
    setStatus('Ejecutado · ' + deviceId, true);
  } catch (e) {
    const err = document.createElement('pre');
    err.style.cssText = 'color:#ff8a80;padding:12px;white-space:pre-wrap;font-size:12px';
    err.textContent = 'Error: ' + (e && e.message ? e.message : e);
    preview.appendChild(err);
    setStatus('Error de ejecución', false);
    console.error(e);
  }
  paintStates();
}

async function deploy() {
  const name = ($('app-name').value || 'app-js').trim();
  setStatus('Desplegando…');
  try {
    const r = await fetch('/v1/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        kind: 'alset-js',
        source: codeEl.value,
        runtime: 'alset-js',
        ans: name + '.app.ans',
      }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'deploy failed');
    setStatus('Desplegado · ' + (j.url || ''), true);
    const url = j.url || ('/apps/' + encodeURIComponent(name) + '/');
    window.open(url.startsWith('http') ? url : location.origin + url, '_blank', 'noopener');
  } catch (e) {
    setStatus('Deploy: ' + (e.message || e), false);
  }
}

// UI wiring
buildToolbox();
buildExamples();
document.querySelectorAll('.dev').forEach((b) => {
  b.onclick = () => setDevice(b.getAttribute('data-d'));
});
$('btn-run').onclick = run;
$('btn-deploy').onclick = deploy;
$('btn-examples').onclick = () => { $('examples-drawer').hidden = false; };
$('btn-close-ex').onclick = () => { $('examples-drawer').hidden = true; };

codeEl.value = TEMPLATES.counter;
setDevice('mobile');
