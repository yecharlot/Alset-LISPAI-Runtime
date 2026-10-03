/**
 * Alset-JS Editor — paridad Studio: paneles, DnD, iconos SVG, CodeMirror,
 * ejemplos upstream, Mind/Zyrion/silogismos, deploy nativo.
 */
import * as Core from '../alset/AlsetPulseCore.js';
import { EXAMPLE_APPS } from './examples-pack.js';

const {
  alsetState, Column, Row, Text, Button, Card, Spacer, mod, MapNode,
  Theme, Icon, Input, List, Image, Router, navigateTo, currentRoute,
  Animate, createToast, FloatingButton, GradientLayer, LoginForm, RegisterForm,
  AudioNode, VideoNode, ALSET_ICONS, alsetNeuralState,
} = Core;

const $ = (id) => document.getElementById(id);
const liveStates = new Map();
const neuralKeys = new Map();
/** Store local de silogismos del editor */
const sylFacts = [];

const DEVICES = {
  mobile: { label: 'Móvil 390×720', w: 390, h: 720 },
  tablet: { label: 'Tablet 768×900', w: 768, h: 900 },
  desktop: { label: 'Desktop', w: null, h: 640 },
  watch: { label: 'Watch', w: 198, h: 242 },
};
let deviceId = 'mobile';
let cm = null;

const SNIPPETS = {
  text: `Text("Hola Alset-JS", mod().sizeText(20).weight("800").color(Theme.current.primary))`,
  button: `Button("Acción", () => {})`,
  card: `Card(mod().padding(16), () => {\n  Text("Tarjeta", mod().weight("700"));\n})`,
  row: `Row(mod().gap(8), () => {\n  Button("A", () => {});\n  Button("B", () => {});\n})`,
  column: `Column(mod().padding(12).gap(10), () => {\n  Text("Columna");\n})`,
  stack: `Column(mod().gap(8), () => {\n  Card(mod().padding(10), () => Text("Capa 1"));\n  Card(mod().padding(10), () => Text("Capa 2"));\n})`,
  input: `Input(campo, mod().fillMaxWidth(), { placeholder: "Escribe…" })`,
  map: `MapNode(mod().height(220).radius(12), { center: [-82.36, 23.11], zoom: 12 })`,
  icon: `Icon("pulse", mod().size(28).color(Theme.current.primary))`,
  gradient: `GradientLayer({ from: "#f4b400", to: "#1a1200" }, () => {\n  Text("Hero", mod().sizeText(22).weight("800"));\n}, mod().padding(16).radius(12))`,
  login: `LoginForm({ onSubmit: (u, p) => console.log(u, p) })`,
  fab: `FloatingButton("+", () => {})`,
  spacer: `Spacer(16)`,
  video: `VideoNode(mod().height(160).radius(10))`,
  audio: `AudioNode(mod())`,
  drawer: `/* Drawer: ver ejemplo Drawer+Tabs */\nconst open = alsetState(false);\nButton("☰", () => open.set(!open.get()))`,
  tabs: `const tab = alsetState("home");\nRow(mod().gap(6), () => {\n  Button("Home", () => tab.set("home"));\n  Button("Más", () => tab.set("more"));\n})`,
  'bottom-tabs': `Row(mod().padding(8).gap(6).background("#0c0c0c"), () => {\n  Button("Home", () => {});\n  Button("Mapa", () => {});\n  Button("Yo", () => {});\n})`,
  router: `Router({\n  home: () => Text("Home"),\n  detail: () => Text("Detalle"),\n})`,
  navigate: `navigateTo("detail", { id: 1 })`,
  rest: `/* Conector REST */\nconst data = alsetState([]);\nasync function load() {\n  const r = await fetch("/v1/data");\n  data.set((await r.json()).items || []);\n}\nButton("Cargar API", () => load())`,
  pulse: `/* Pulse: EventSource /api/pulse o fetch */\nButton("Pulse ping", async () => {\n  await fetch("/api/pulse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "home", text: "hola" }) });\n})`,
  mind: `const v = alsetState("");\nasync function tick() {\n  const r = await fetch("/api/mind/tick", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "hola" }) });\n  v.set((await r.json()).voice || "");\n}\nButton("Mind", () => tick())`,
  zyrion: `Button("Zyrion", async () => {\n  const r = await fetch("/api/zyrion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entradas: { a: 0.2, b: 0.8 } }) });\n  console.log(await r.json());\n})`,
  neural: `const n = alsetNeuralState("peso", 0.5);\nText("neural=" + n.get())`,
  image: `Image("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400", mod().height(120).radius(10))`,
};

const TEMPLATES = Object.fromEntries(
  EXAMPLE_APPS.filter((e) => ['counter', 'drawer-tabs', 'shop-media', 'os-launcher', 'mind-zyrion', 'syllogism'].includes(e.id))
    .map((e) => [e.id, e.code])
);

function setStatus(msg, ok) {
  const el = $('status');
  if (!el) return;
  el.textContent = msg;
  el.style.color = ok === false ? '#ff8a80' : ok ? '#4caf50' : 'var(--muted)';
}

function getCode() {
  return cm ? cm.getValue() : ($('code')?.value || '');
}
function setCode(v) {
  if (cm) cm.setValue(v);
  else if ($('code')) $('code').value = v;
}

function insertSnippet(snippet) {
  if (cm) {
    const cur = cm.getCursor();
    cm.replaceRange('\n' + snippet + '\n', cur);
    cm.focus();
  } else {
    const ta = $('code');
    const start = ta.selectionStart;
    ta.value = ta.value.slice(0, start) + '\n' + snippet + '\n' + ta.value.slice(ta.selectionEnd);
  }
  setStatus('Snippet insertado', true);
}

function iconSvg(name) {
  const path = (ALSET_ICONS && ALSET_ICONS[name]) || ALSET_ICONS?.pulse || 'M12 2v20';
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  const p = document.createElementNS(ns, 'path');
  p.setAttribute('d', path);
  svg.appendChild(p);
  return svg;
}

function makeDraggable(el, payload) {
  el.draggable = true;
  el.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/alset-snippet', payload);
    e.dataTransfer.setData('text/plain', payload);
    e.dataTransfer.effectAllowed = 'copy';
  });
}

function buildToolbox() {
  const box = $('toolbox');
  box.innerHTML = '';
  Object.keys(SNIPPETS).forEach((k) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tool';
    b.innerHTML = `<strong>${k}</strong><small>Arrastrar o clic</small>`;
    b.onclick = () => insertSnippet(SNIPPETS[k]);
    makeDraggable(b, SNIPPETS[k]);
    box.appendChild(b);
  });
  const tpl = $('templates');
  tpl.innerHTML = '';
  Object.keys(TEMPLATES).forEach((k) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tpl';
    b.innerHTML = `<strong>${k}</strong><small>Plantilla completa</small>`;
    b.onclick = () => { setCode(TEMPLATES[k]); run(); };
    makeDraggable(b, TEMPLATES[k]);
    tpl.appendChild(b);
  });
  const icons = $('icons');
  icons.innerHTML = '';
  const names = ALSET_ICONS ? Object.keys(ALSET_ICONS) : ['pulse', 'home', 'star'];
  names.forEach((name) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'icon-btn';
    b.title = name;
    b.appendChild(iconSvg(name));
    const snip = `Icon("${name}", mod().size(24).color(Theme.current.primary))`;
    b.onclick = () => insertSnippet(snip);
    makeDraggable(b, snip);
    icons.appendChild(b);
  });
}

function buildExamples() {
  const list = $('examples-list');
  list.innerHTML = '';
  EXAMPLE_APPS.forEach((ex) => {
    const card = document.createElement('div');
    card.className = 'ex-card';
    card.innerHTML = `<h4>${ex.name}</h4><p>${ex.blurb}</p>
      <div class="ex-tags">${(ex.tags || []).map((t) => `<span>${t}</span>`).join('')}</div>`;
    const load = document.createElement('button');
    load.type = 'button';
    load.className = 'btn gold';
    load.textContent = 'Cargar y ejecutar';
    load.onclick = () => {
      setCode(ex.code);
      $('app-name').value = ex.id;
      $('examples-drawer').hidden = true;
      run();
    };
    card.appendChild(load);
    if (ex.sourceUrl) {
      const a = document.createElement('a');
      a.href = ex.sourceUrl;
      a.target = '_blank';
      a.className = 'btn ghost';
      a.style.marginLeft = '6px';
      a.textContent = 'Fuente repo';
      card.appendChild(a);
    }
    list.appendChild(card);
  });
}

function trackState(name, st) {
  liveStates.set(name, st);
  paintStates();
  const orig = st.set.bind(st);
  st.set = (v) => { orig(v); paintStates(); };
  return st;
}
function paintStates() {
  const lines = [];
  liveStates.forEach((st, k) => {
    try { lines.push(k + ' = ' + JSON.stringify(st.get())); }
    catch { lines.push(k + ' = ?'); }
  });
  $('states-out').textContent = lines.length ? lines.join('\n') : 'Sin estados aún.';
  const nlines = [];
  neuralKeys.forEach((st, k) => {
    try { nlines.push(k + ' = ' + JSON.stringify(st.get())); }
    catch { nlines.push(k + ' = ?'); }
  });
  $('neural-out').textContent = nlines.length ? nlines.join('\n') : 'Sin alsetNeuralState en esta corrida.';
}

function setDevice(id) {
  deviceId = id;
  document.querySelectorAll('.dev').forEach((b) => b.classList.toggle('active', b.getAttribute('data-d') === id));
  const d = DEVICES[id];
  $('dev-label').textContent = d.label;
  const frame = $('device-frame');
  frame.className = 'device-frame ' + id;
  if (d.w) { frame.style.width = d.w + 'px'; frame.style.height = d.h + 'px'; }
  else { frame.style.width = '100%'; frame.style.maxWidth = '1000px'; frame.style.height = d.h + 'px'; }
  run();
}

function run() {
  liveStates.clear();
  neuralKeys.clear();
  const preview = $('preview');
  preview.innerHTML = '';
  const host = document.createElement('div');
  host.style.minHeight = '100%';
  preview.appendChild(host);

  const trackedAlsetState = (initial) => trackState('s' + (liveStates.size + 1), alsetState(initial));
  const trackedNeural = (key, initial) => {
    const st = typeof alsetNeuralState === 'function' ? alsetNeuralState(key, initial) : alsetState(initial);
    neuralKeys.set(key, st);
    paintStates();
    return st;
  };

  try {
    const src = getCode();
    const fn = new Function(
      'alsetState', 'Column', 'Row', 'Text', 'Button', 'Card', 'Spacer', 'mod', 'MapNode',
      'Theme', 'Icon', 'Input', 'List', 'Image', 'Router', 'navigateTo', 'currentRoute',
      'Animate', 'createToast', 'FloatingButton', 'GradientLayer', 'LoginForm', 'RegisterForm',
      'AudioNode', 'VideoNode', 'alsetNeuralState', 'root', 'Core',
      src + "\n;\nif (typeof App === 'function') { const v = App(); if (v && root) root.appendChild(v); }"
    );
    fn(
      trackedAlsetState, Column, Row, Text, Button, Card, Spacer, mod, MapNode,
      Theme, Icon, Input, List, Image, Router, navigateTo, currentRoute,
      Animate, createToast, FloatingButton, GradientLayer, LoginForm, RegisterForm,
      AudioNode, VideoNode, trackedNeural, host, Core
    );
    setStatus('Ejecutado · ' + deviceId, true);
    markEditable(preview);
    if (editMode) preview.classList.add('edit-mode');
  } catch (e) {
    const err = document.createElement('pre');
    err.style.cssText = 'color:#ff8a80;padding:12px;white-space:pre-wrap;font-size:12px';
    err.textContent = 'Error: ' + (e && e.message ? e.message : e);
    preview.appendChild(err);
    setStatus('Error de ejecución', false);
    console.error(e);
  }
  paintStates();
  selectPreviewEl(null);
}

async function deploy() {
  const name = ($('app-name').value || 'app-js').trim();
  setStatus('Desplegando…');
  try {
    const r = await fetch('/v1/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, kind: 'alset-js', source: getCode(), ans: name + '.app.ans' }),
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

function paintSyl() {
  $('syl-out').textContent = sylFacts.length
    ? sylFacts.map((f) => `${f.s} —${f.r}→ ${f.o} [${f.c}]`).join('\n')
    : 'Sin hechos. Assert un JSON {s,r,o,c}.';
}

function inferLocal() {
  const conf = (s, r, o) => {
    const f = sylFacts.find((x) => x.s === s && x.r === r && (!o || x.o === o));
    return f ? f.c : 1;
  };
  const has = conf('organismo', 'tiene_capacidad', 'backup');
  const req = conf('backup', 'requiere', 'storage');
  const avail = conf('storage', 'disponible');
  const pol = conf('backup', 'permite_policy');
  let c = 2;
  if ([has, req, avail, pol].some((x) => x === 0)) c = 0;
  else if ([has, req, avail, pol].some((x) => x === 1)) c = 1;
  return { conclusion: 'puede_ejecutar(backup)', conf: c, premises: { has, req, avail, pol } };
}

window.alsetSketchToCode = function (spec) {
  const lines = String(spec || '').split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const body = [];
  const states = new Set();
  lines.forEach((line) => {
    const low = line.toLowerCase();
    if (low.startsWith('titulo:') || low.startsWith('título:')) {
      body.push('    Text(' + JSON.stringify(line.split(':').slice(1).join(':').trim()) + ', mod().sizeText(22).weight("800").color(Theme.current.primary));');
    } else if (low.startsWith('texto:')) {
      body.push('    Text(' + JSON.stringify(line.split(':').slice(1).join(':').trim()) + ', mod().sizeText(14).color("#999"));');
    } else if (low.startsWith('boton:') || low.startsWith('botón:')) {
      body.push('    Button(' + JSON.stringify(line.split(':').slice(1).join(':').trim() || 'OK') + ', () => {});');
    } else if (low.startsWith('input:')) {
      const name = line.split(':').slice(1).join(':').trim() || 'campo';
      const id = name.replace(/[^a-zA-Z0-9_]/g, '_') || 'campo';
      states.add(id);
      body.push('    Input(' + id + ', mod().fillMaxWidth(), { placeholder: ' + JSON.stringify(name) + ' });');
    } else if (low.startsWith('mapa')) {
      body.push('    MapNode(mod().height(220).radius(12), { center: [-82.36, 23.11], zoom: 12 });');
    } else if (low.startsWith('fila:')) {
      const parts = line.split(':').slice(1).join(':').split('|').map((x) => x.trim()).filter(Boolean);
      body.push('    Row(mod().gap(8), () => {');
      parts.forEach((p) => body.push('      Button(' + JSON.stringify(p) + ', () => {});'));
      body.push('    });');
    } else if (low.startsWith('card:')) {
      body.push('    Card(mod().padding(12), () => { Text(' + JSON.stringify(line.split(':').slice(1).join(':').trim()) + ', mod().weight("700")); });');
    } else if (low === 'drawer' || low === 'tabs') {
      body.push('    Text("Usa plantilla drawer-tabs para navegación completa", mod().sizeText(12).color("#999"));');
    } else {
      body.push('    Text(' + JSON.stringify(line) + ', mod().sizeText(14));');
    }
  });
  const stDecl = [...states].map((s) => 'const ' + s + ' = alsetState("");').join('\n');
  return (stDecl ? stDecl + '\n\n' : '') +
    'function App() {\n  return Column(mod().padding(16).gap(12).fillMaxSize(), () => {\n' +
    body.join('\n') + '\n  });\n}\n';
};

// —— boot ——
buildToolbox();
buildExamples();

if (window.CodeMirror) {
  cm = CodeMirror.fromTextArea($('code'), {
    mode: 'javascript',
    theme: 'material-darker',
    lineNumbers: true,
    indentUnit: 2,
    tabSize: 2,
    lineWrapping: true,
    readOnly: false,
    autofocus: false,
    extraKeys: { 'Ctrl-Enter': () => run(), 'Cmd-Enter': () => run() },
  });
  function refreshCm() {
    try {
      const body = $('code-body');
      const h = body ? Math.max(160, body.clientHeight - 36) : 400;
      cm.setSize('100%', h);
      cm.refresh();
    } catch (_) {}
  }
  refreshCm();
  window.addEventListener('resize', refreshCm);
  // Cuando el panel se redimensiona
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(refreshCm) : null;
  if (ro && $('code-body')) ro.observe($('code-body'));
  cm.getWrapperElement().addEventListener('dragover', (e) => e.preventDefault());
  cm.getWrapperElement().addEventListener('drop', (e) => {
    e.preventDefault();
    const sn = e.dataTransfer.getData('text/alset-snippet') || e.dataTransfer.getData('text/plain');
    if (sn) insertSnippet(sn);
  });
  // Asegurar que el textarea nativo también sea editable si CM falla
  const ta = $('code');
  if (ta) { ta.readOnly = false; ta.disabled = false; }
} else {
  const ta = $('code');
  if (ta) { ta.style.display = 'block'; ta.readOnly = false; }
}

/* —— Paneles flotantes: arrastrar y redimensionar —— */
function enableFloatingPanels() {
  const ws = $('workspace');
  document.querySelectorAll('.float-panel').forEach((panel) => {
    const head = panel.querySelector('[data-drag]');
    const handle = panel.querySelector('[data-resize]');
    if (head) {
      head.addEventListener('pointerdown', (e) => {
        if (e.target.closest('[data-close]')) return;
        e.preventDefault();
        const rect = panel.getBoundingClientRect();
        const wsRect = ws.getBoundingClientRect();
        const ox = e.clientX - rect.left;
        const oy = e.clientY - rect.top;
        panel.classList.add('dragging');
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
        const onMove = (ev) => {
          let left = ev.clientX - wsRect.left - ox;
          let top = ev.clientY - wsRect.top - oy;
          left = Math.max(0, Math.min(left, wsRect.width - 80));
          top = Math.max(0, Math.min(top, wsRect.height - 40));
          panel.style.left = left + 'px';
          panel.style.top = top + 'px';
        };
        const onUp = () => {
          panel.classList.remove('dragging');
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          saveLayout();
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      });
    }
    if (handle) {
      handle.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = panel.offsetWidth;
        const startH = panel.offsetHeight;
        const onMove = (ev) => {
          panel.style.width = Math.max(180, startW + (ev.clientX - startX)) + 'px';
          panel.style.height = Math.max(120, startH + (ev.clientY - startY)) + 'px';
          if (panel.id === 'panel-right' && cm) {
            try {
              const body = $('code-body');
              cm.setSize('100%', Math.max(160, (body?.clientHeight || 200) - 36));
              cm.refresh();
            } catch (_) {}
          }
        };
        const onUp = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          saveLayout();
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      });
    }
  });
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-close');
      const panel = document.querySelector('.float-panel[data-panel="' + id + '"]');
      if (panel) panel.classList.add('hidden-panel');
      document.body.classList.remove('panels-' + id);
      document.querySelectorAll('.ptog[data-panel="' + id + '"]').forEach((b) => b.classList.remove('active'));
    });
  });
}

function saveLayout() {
  try {
    const layout = {};
    document.querySelectorAll('.float-panel').forEach((p) => {
      layout[p.id] = {
        left: p.style.left, top: p.style.top, width: p.style.width, height: p.style.height,
        right: p.style.right, hidden: p.classList.contains('hidden-panel'),
      };
    });
    localStorage.setItem('alset-js-editor-layout', JSON.stringify(layout));
  } catch (_) {}
}

function loadLayout() {
  try {
    const raw = localStorage.getItem('alset-js-editor-layout');
    if (!raw) return;
    const layout = JSON.parse(raw);
    Object.keys(layout).forEach((id) => {
      const p = document.getElementById(id);
      const L = layout[id];
      if (!p || !L) return;
      if (L.left) p.style.left = L.left;
      if (L.top) p.style.top = L.top;
      if (L.width) p.style.width = L.width;
      if (L.height) p.style.height = L.height;
      if (L.right) p.style.right = L.right;
      p.classList.toggle('hidden-panel', !!L.hidden);
    });
  } catch (_) {}
}

function resetLayout() {
  localStorage.removeItem('alset-js-editor-layout');
  location.reload();
}

/* —— Preview: seleccionar y editar componentes —— */
let editMode = false;
let selectedEl = null;

function markEditable(root) {
  if (!root) return;
  root.querySelectorAll('span, button, p, h1, h2, h3, label, a').forEach((el) => {
    if (el.closest('.inspector')) return;
    el.classList.add('alset-editable');
    el.dataset.alsetEdit = '1';
  });
  // también divs con texto directo corto
  root.querySelectorAll('div').forEach((el) => {
    if (el.children.length === 0 && (el.textContent || '').trim().length > 0 && (el.textContent || '').length < 200) {
      el.classList.add('alset-editable');
      el.dataset.alsetEdit = '1';
    }
  });
}

function selectPreviewEl(el) {
  if (selectedEl) selectedEl.classList.remove('selected');
  selectedEl = el;
  if (!el) {
    $('inspector')?.classList.add('hidden');
    return;
  }
  el.classList.add('selected');
  const insp = $('inspector');
  insp.classList.remove('hidden');
  const text = (el.innerText || el.textContent || '').trim();
  $('insp-text').value = text;
  const cs = getComputedStyle(el);
  const color = cs.color;
  // rgb to hex approx
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) {
    const hex = '#' + [m[1], m[2], m[3]].map((x) => Number(x).toString(16).padStart(2, '0')).join('');
    $('insp-color').value = hex;
  }
  const fs = parseInt(cs.fontSize, 10);
  if (fs) $('insp-size').value = fs;
}

function applyInspector() {
  if (!selectedEl) return;
  const text = $('insp-text').value;
  const color = $('insp-color').value;
  const size = $('insp-size').value;
  if (selectedEl.tagName === 'INPUT') {
    selectedEl.value = text;
  } else {
    selectedEl.textContent = text;
  }
  if (color) selectedEl.style.color = color;
  if (size) selectedEl.style.fontSize = size + 'px';
  setStatus('Preview actualizado (en vivo)', true);
}

function syncSelectionToCode() {
  if (!selectedEl) return;
  const text = $('insp-text').value;
  const code = getCode();
  // Reemplazo simple de la primera cadena que coincida con el texto anterior del nodo
  const prev = selectedEl.getAttribute('data-prev-text') || '';
  let next = code;
  if (prev && code.includes(JSON.stringify(prev))) {
    next = code.replace(JSON.stringify(prev), JSON.stringify(text));
  } else if (prev && code.includes("'" + prev.replace(/'/g, "\\'") + "'")) {
    next = code.replace("'" + prev.replace(/'/g, "\\'") + "'", "'" + text.replace(/'/g, "\\'") + "'");
  } else {
    // intenta Text("...") o Button("...")
    const re = /(Text|Button)\(\s*(["'])([^"']*)\2/;
    // no global replace all — user can edit code manually
    setStatus('No se encontró el literal exacto en el código; aplica el cambio a mano o re-ejecuta', false);
    return;
  }
  setCode(next);
  setStatus('Texto sincronizado al código', true);
}

function wirePreviewEdit() {
  const root = $('preview');
  root.addEventListener('click', (e) => {
    if (!editMode) return;
    const el = e.target.closest('.alset-editable');
    if (!el || !root.contains(el)) return;
    e.preventDefault();
    e.stopPropagation();
    el.setAttribute('data-prev-text', (el.innerText || '').trim());
    selectPreviewEl(el);
  });
  // doble clic → contenteditable
  root.addEventListener('dblclick', (e) => {
    if (!editMode) return;
    const el = e.target.closest('.alset-editable');
    if (!el) return;
    e.preventDefault();
    el.contentEditable = 'true';
    el.focus();
    const done = () => {
      el.contentEditable = 'false';
      el.removeEventListener('blur', done);
      if ($('insp-text')) $('insp-text').value = (el.innerText || '').trim();
      setStatus('Texto editado en preview', true);
    };
    el.addEventListener('blur', done);
  });
  $('btn-edit-mode')?.addEventListener('click', () => {
    editMode = !editMode;
    root.classList.toggle('edit-mode', editMode);
    $('btn-edit-mode').setAttribute('aria-pressed', editMode ? 'true' : 'false');
    $('btn-edit-mode').textContent = editMode ? 'Modo edición ON' : 'Editar componentes';
    $('edit-hint').textContent = editMode
      ? 'Clic = seleccionar · Doble clic = editar texto · Usa el inspector abajo'
      : 'Activa para seleccionar y cambiar texto/estilo en el preview';
    if (!editMode) selectPreviewEl(null);
  });
  $('insp-apply')?.addEventListener('click', applyInspector);
  $('insp-to-code')?.addEventListener('click', syncSelectionToCode);
}


document.querySelectorAll('.dev').forEach((b) => { b.onclick = () => setDevice(b.getAttribute('data-d')); });
document.querySelectorAll('.ptog').forEach((b) => {
  b.onclick = () => {
    const p = b.getAttribute('data-panel');
    const panel = document.querySelector('.float-panel[data-panel="' + p + '"]');
    if (!panel) return;
    const hide = !panel.classList.contains('hidden-panel');
    panel.classList.toggle('hidden-panel', hide);
    document.body.classList.toggle('panels-' + p, !hide);
    b.classList.toggle('active', !hide);
    if (!hide && p === 'right' && cm) setTimeout(() => { cm.refresh(); }, 50);
  };
});
$('btn-reset-layout')?.addEventListener('click', resetLayout);
enableFloatingPanels();
loadLayout();
wirePreviewEdit();


$('btn-run').onclick = run;
$('btn-deploy').onclick = deploy;
$('btn-examples').onclick = () => { $('examples-drawer').hidden = false; };
$('btn-close-ex').onclick = () => { $('examples-drawer').hidden = true; };
$('btn-sketch').onclick = () => { $('sketch-drawer').hidden = false; };
$('btn-close-sketch').onclick = () => { $('sketch-drawer').hidden = true; };
$('btn-apply-sketch').onclick = () => {
  setCode(window.alsetSketchToCode($('sketch-src').value));
  $('sketch-drawer').hidden = true;
  run();
};

const host = $('preview-host');
host.addEventListener('dragover', (e) => { e.preventDefault(); host.classList.add('drag-over'); });
host.addEventListener('dragleave', () => host.classList.remove('drag-over'));
host.addEventListener('drop', (e) => {
  e.preventDefault();
  host.classList.remove('drag-over');
  const sn = e.dataTransfer.getData('text/alset-snippet') || e.dataTransfer.getData('text/plain');
  if (sn) {
    if (sn.includes('function App')) setCode(sn);
    else insertSnippet(sn);
    run();
  }
});

$('btn-mind').onclick = async () => {
  try {
    const r = await fetch('/api/mind/tick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: $('mind-in').value || 'hola' }),
    });
    const j = await r.json();
    $('mind-out').textContent = j.voice || JSON.stringify(j, null, 2);
  } catch (e) {
    $('mind-out').textContent = 'API Mind no disponible aquí. Despliega junto a PrismaTec o mini-nodo.\n' + e.message;
  }
};
$('btn-zyrion').onclick = async () => {
  const a = Number($('zyr-a').value);
  const b = Number($('zyr-b').value);
  const local = Math.min(a > 0.66 ? 2 : a > 0.33 ? 1 : 0, b > 0.66 ? 2 : b > 0.33 ? 1 : 0);
  try {
    const r = await fetch('/api/zyrion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entradas: { a, b } }),
    });
    const j = await r.json();
    $('zyrion-out').textContent = JSON.stringify(j, null, 2);
  } catch {
    $('zyrion-out').textContent = 'Zyrion local (min conf): ' + local + '\n(a=' + a + ', b=' + b + ')';
  }
};

$('btn-assert').onclick = () => {
  try {
    const f = JSON.parse($('syl-in').value || '{}');
    if (!f.s || !f.r) throw new Error('faltan s/r');
    if (f.c == null) f.c = 2;
    sylFacts.push(f);
    paintSyl();
  } catch (e) {
    $('syl-out').textContent = 'JSON inválido: ' + e.message;
  }
};
$('btn-infer').onclick = () => {
  const r = inferLocal();
  $('syl-out').textContent = JSON.stringify(r, null, 2) + '\n\n' + sylFacts.map((f) => `${f.s}—${f.r}→${f.o}[${f.c}]`).join('\n');
};
$('btn-ask').onclick = () => {
  const r = inferLocal();
  $('syl-out').textContent = 'ask → ' + r.conclusion + ' = ' + r.conf;
};

// import Studio
try {
  const params = new URLSearchParams(location.search);
  if (params.get('from') === 'studio') {
    const code = sessionStorage.getItem('alset-js-export');
    const n = sessionStorage.getItem('alset-js-export-name');
    if (code) {
      setCode(code);
      if (n) $('app-name').value = n;
      setStatus('Importado desde Studio', true);
    }
  }
} catch (_) {}

if (!getCode()) setCode(EXAMPLE_APPS[0].code);
setDevice('mobile');
paintSyl();
