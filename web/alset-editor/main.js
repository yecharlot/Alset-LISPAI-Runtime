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

function enableFloatingPanels() {
  const ws = document.getElementById('workspace');
  if (!ws) {
    console.error('[alset-editor] workspace no encontrado');
    return;
  }

  document.querySelectorAll('.float-panel').forEach((panel) => {
    // Normalizar: si solo tiene right, convertir a left
    const cs = getComputedStyle(panel);
    if ((!panel.style.left || panel.style.left === 'auto') && panel.style.right) {
      const wsR = ws.getBoundingClientRect();
      const pR = panel.getBoundingClientRect();
      panel.style.left = (pR.left - wsR.left) + 'px';
      panel.style.right = 'auto';
    }

    const head = panel.querySelector('.panel-head') || panel.querySelector('[data-drag]');
    const handle = panel.querySelector('.resize-handle') || panel.querySelector('[data-resize]');

    if (head) {
      head.style.cursor = 'move';
      head.addEventListener('mousedown', onDragStart);
      head.addEventListener('touchstart', onDragStart, { passive: false });
    }
    if (handle) {
      handle.addEventListener('mousedown', onResizeStart);
      handle.addEventListener('touchstart', onResizeStart, { passive: false });
    }

    function onDragStart(e) {
      if (e.target.closest('[data-close]') || e.target.closest('button.ph-btn')) return;
      e.preventDefault();
      e.stopPropagation();
      const pt = e.touches ? e.touches[0] : e;
      const wsRect = ws.getBoundingClientRect();
      const rect = panel.getBoundingClientRect();
      const ox = pt.clientX - rect.left;
      const oy = pt.clientY - rect.top;
      panel.classList.add('dragging');
      panel.style.zIndex = '60';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      panel.style.left = (rect.left - wsRect.left) + 'px';
      panel.style.top = (rect.top - wsRect.top) + 'px';

      function onMove(ev) {
        const p = ev.touches ? ev.touches[0] : ev;
        let left = p.clientX - wsRect.left - ox;
        let top = p.clientY - wsRect.top - oy;
        left = Math.max(0, Math.min(left, ws.clientWidth - 100));
        top = Math.max(0, Math.min(top, ws.clientHeight - 48));
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
      }
      function onUp() {
        panel.classList.remove('dragging');
        panel.style.zIndex = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        saveLayout();
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    }

    function onResizeStart(e) {
      e.preventDefault();
      e.stopPropagation();
      const pt = e.touches ? e.touches[0] : e;
      const startX = pt.clientX;
      const startY = pt.clientY;
      const startW = panel.offsetWidth;
      const startH = panel.offsetHeight;
      function onMove(ev) {
        const p = ev.touches ? ev.touches[0] : ev;
        panel.style.width = Math.max(200, startW + (p.clientX - startX)) + 'px';
        panel.style.height = Math.max(140, startH + (p.clientY - startY)) + 'px';
        if (panel.id === 'panel-right' && cm) {
          try {
            const body = document.getElementById('code-body');
            cm.setSize('100%', Math.max(160, (body ? body.clientHeight : 200) - 36));
            cm.refresh();
          } catch (_) {}
        }
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        saveLayout();
        if (cm) try { cm.refresh(); } catch (_) {}
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    }
  });

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-close');
      const panel = document.querySelector('.float-panel[data-panel="' + id + '"]');
      if (panel) panel.classList.add('hidden-panel');
      document.body.classList.remove('panels-' + id);
      document.querySelectorAll('.ptog[data-panel="' + id + '"]').forEach((b) => b.classList.remove('active'));
    });
  });

  console.log('[alset-editor] paneles flotantes listos:', document.querySelectorAll('.float-panel').length);
}

function saveLayout() {
  try {
    const layout = {};
    document.querySelectorAll('.float-panel').forEach((p) => {
      layout[p.id] = {
        left: p.style.left,
        top: p.style.top,
        width: p.style.width,
        height: p.style.height,
        hidden: p.classList.contains('hidden-panel'),
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
      if (L.left) { p.style.left = L.left; p.style.right = 'auto'; }
      if (L.top) p.style.top = L.top;
      if (L.width) p.style.width = L.width;
      if (L.height) p.style.height = L.height;
      p.classList.toggle('hidden-panel', !!L.hidden);
    });
  } catch (_) {}
}

function resetLayout() {
  try { localStorage.removeItem('alset-js-editor-layout'); } catch (_) {}
  location.reload();
}

/* —— Preview: editar componentes —— */
let editMode = false;
let selectedEl = null;

function markEditable(root) {
  if (!root) return;
  root.querySelectorAll('.alset-editable').forEach((el) => {
    el.classList.remove('alset-editable', 'selected');
    el.removeAttribute('data-alset-edit');
  });
  const candidates = root.querySelectorAll('*');
  candidates.forEach((el) => {
    if (el.closest('#inspector')) return;
    const tag = el.tagName;
    if (['SCRIPT', 'STYLE', 'SVG', 'PATH', 'INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
    const text = (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3)
      ? (el.textContent || '').trim()
      : (tag === 'BUTTON' || tag === 'SPAN' || tag === 'P' || tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'LABEL' || tag === 'A')
        ? (el.innerText || '').trim()
        : '';
    if (text && text.length > 0 && text.length < 300) {
      el.classList.add('alset-editable');
      el.setAttribute('data-alset-edit', '1');
      el.setAttribute('data-prev-text', text);
    }
  });
}

function selectPreviewEl(el) {
  if (selectedEl) {
    selectedEl.classList.remove('selected');
    if (selectedEl.isContentEditable) selectedEl.contentEditable = 'false';
  }
  selectedEl = el;
  const insp = document.getElementById('inspector');
  if (!el) {
    if (insp) insp.classList.add('hidden');
    return;
  }
  el.classList.add('selected');
  if (insp) insp.classList.remove('hidden');
  const text = (el.innerText || el.textContent || '').trim();
  const ti = document.getElementById('insp-text');
  const ci = document.getElementById('insp-color');
  const si = document.getElementById('insp-size');
  if (ti) ti.value = text;
  try {
    const cs = getComputedStyle(el);
    const m = String(cs.color).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m && ci) {
      ci.value = '#' + [m[1], m[2], m[3]].map((x) => Number(x).toString(16).padStart(2, '0')).join('');
    }
    const fs = parseInt(cs.fontSize, 10);
    if (fs && si) si.value = String(fs);
  } catch (_) {}
}

function applyInspector() {
  if (!selectedEl) return;
  const text = document.getElementById('insp-text')?.value ?? '';
  const color = document.getElementById('insp-color')?.value;
  const size = document.getElementById('insp-size')?.value;
  selectedEl.setAttribute('data-prev-text', (selectedEl.innerText || '').trim());
  if (selectedEl.childNodes.length === 1 && selectedEl.childNodes[0].nodeType === 3) {
    selectedEl.childNodes[0].textContent = text;
  } else {
    selectedEl.textContent = text;
  }
  if (color) selectedEl.style.color = color;
  if (size) selectedEl.style.fontSize = size + 'px';
  setStatus('Componente actualizado en preview', true);
}

function syncSelectionToCode() {
  if (!selectedEl) return;
  const text = document.getElementById('insp-text')?.value ?? '';
  const prev = selectedEl.getAttribute('data-prev-text') || '';
  const code = getCode();
  if (!prev) {
    setStatus('No hay texto previo para buscar en el código', false);
    return;
  }
  const lit1 = JSON.stringify(prev);
  const lit2 = JSON.stringify(text);
  if (code.includes(lit1)) {
    setCode(code.replace(lit1, lit2));
    selectedEl.setAttribute('data-prev-text', text);
    setStatus('Sincronizado al código', true);
    return;
  }
  // fallback: replace first occurrence of prev as plain in quotes
  const idx = code.indexOf(prev);
  if (idx >= 0) {
    setCode(code.slice(0, idx) + text + code.slice(idx + prev.length));
    selectedEl.setAttribute('data-prev-text', text);
    setStatus('Sincronizado (coincidencia parcial)', true);
    return;
  }
  setStatus('No se encontró «' + prev.slice(0, 40) + '» en el código', false);
}

function wirePreviewEdit() {
  const root = document.getElementById('preview');
  const btn = document.getElementById('btn-edit-mode');
  if (!root || !btn) {
    console.error('[alset-editor] preview o btn-edit-mode faltan');
    return;
  }

  // captura en fase capture para ganar a botones
  root.addEventListener('click', (e) => {
    if (!editMode) return;
    const el = e.target.closest('[data-alset-edit="1"]');
    if (!el || !root.contains(el)) return;
    e.preventDefault();
    e.stopPropagation();
    selectPreviewEl(el);
  }, true);

  root.addEventListener('dblclick', (e) => {
    if (!editMode) return;
    const el = e.target.closest('[data-alset-edit="1"]');
    if (!el || !root.contains(el)) return;
    e.preventDefault();
    e.stopPropagation();
    selectPreviewEl(el);
    el.contentEditable = 'true';
    el.focus();
    const finish = () => {
      el.contentEditable = 'false';
      el.removeEventListener('blur', finish);
      const t = (el.innerText || '').trim();
      const ti = document.getElementById('insp-text');
      if (ti) ti.value = t;
      setStatus('Texto editado en preview', true);
    };
    el.addEventListener('blur', finish);
  }, true);

  btn.addEventListener('click', () => {
    editMode = !editMode;
    root.classList.toggle('edit-mode', editMode);
    btn.setAttribute('aria-pressed', editMode ? 'true' : 'false');
    btn.textContent = editMode ? '✏️ Modo edición ON' : '✏️ Editar componentes';
    const hint = document.getElementById('edit-hint');
    if (hint) {
      hint.textContent = editMode
        ? 'Clic = seleccionar · Doble clic = editar texto · Inspector abajo'
        : 'Activa para seleccionar y cambiar texto/estilo en el preview';
    }
    if (editMode) markEditable(root);
    else selectPreviewEl(null);
    setStatus(editMode ? 'Modo edición activo' : 'Modo edición off', true);
  });

  document.getElementById('insp-apply')?.addEventListener('click', applyInspector);
  document.getElementById('insp-to-code')?.addEventListener('click', syncSelectionToCode);
  console.log('[alset-editor] edición de preview lista');
}

/* —— boot único —— */
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
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(refreshCm) : null;
  if (ro && $('code-body')) ro.observe($('code-body'));
  cm.getWrapperElement().addEventListener('dragover', (e) => e.preventDefault());
  cm.getWrapperElement().addEventListener('drop', (e) => {
    e.preventDefault();
    const sn = e.dataTransfer.getData('text/alset-snippet') || e.dataTransfer.getData('text/plain');
    if (sn) insertSnippet(sn);
  });
  const ta = $('code');
  if (ta) { ta.readOnly = false; ta.disabled = false; }
} else {
  const ta = $('code');
  if (ta) { ta.style.display = 'block'; ta.readOnly = false; }
}

document.querySelectorAll('.dev').forEach((b) => {
  b.onclick = () => setDevice(b.getAttribute('data-d'));
});

document.querySelectorAll('.ptog').forEach((b) => {
  b.onclick = () => {
    const p = b.getAttribute('data-panel');
    const panel = document.querySelector('.float-panel[data-panel="' + p + '"]');
    if (!panel) return;
    const hide = !panel.classList.contains('hidden-panel');
    panel.classList.toggle('hidden-panel', hide);
    document.body.classList.toggle('panels-' + p, !hide);
    b.classList.toggle('active', !hide);
    if (!hide && p === 'right' && cm) setTimeout(() => { try { cm.refresh(); } catch (_) {} }, 50);
  };
});

document.getElementById('btn-reset-layout')?.addEventListener('click', () => {
  try { localStorage.removeItem('alset-js-editor-layout'); } catch (_) {}
  location.reload();
});

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

const hostDrop = $('preview-host');
if (hostDrop) {
  hostDrop.addEventListener('dragover', (e) => { e.preventDefault(); hostDrop.classList.add('drag-over'); });
  hostDrop.addEventListener('dragleave', () => hostDrop.classList.remove('drag-over'));
  hostDrop.addEventListener('drop', (e) => {
    e.preventDefault();
    hostDrop.classList.remove('drag-over');
    const sn = e.dataTransfer.getData('text/alset-snippet') || e.dataTransfer.getData('text/plain');
    if (sn) {
      if (sn.includes('function App')) setCode(sn);
      else insertSnippet(sn);
      run();
    }
  });
}

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
    $('mind-out').textContent = 'API Mind no disponible aquí.\n' + e.message;
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
    $('zyrion-out').textContent = JSON.stringify(await r.json(), null, 2);
  } catch {
    $('zyrion-out').textContent = 'Zyrion local (min conf): ' + local;
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
  $('syl-out').textContent = JSON.stringify(r, null, 2);
};
$('btn-ask').onclick = () => {
  const r = inferLocal();
  $('syl-out').textContent = 'ask → ' + r.conclusion + ' = ' + r.conf;
};

try {
  const params = new URLSearchParams(location.search);
  if (params.get('from') === 'studio') {
    const code = sessionStorage.getItem('alset-js-export');
    const n = sessionStorage.getItem('alset-js-export-name');
    if (code) {
      setCode(code);
      if (n) $('app-name').value = n;
    }
  }
} catch (_) {}

if (!getCode()) setCode(EXAMPLE_APPS[0].code);
setDevice('mobile');
paintSyl();
console.log('[alset-editor] listo — paneles movibles + edición preview');
