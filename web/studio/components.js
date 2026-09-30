/** Toolbox: basic, composite, forms, data, motion */
export const CATALOG = [
  { group: 'Básicos', items: [
    { type: 'text', label: 'Texto', defaults: { text: 'Título', size: 18, weight: 'bold', color: 'primary' } },
    { type: 'button', label: 'Botón', defaults: { text: 'Acción', action: 'click', anim: 'fade' } },
    { type: 'input', label: 'Input', defaults: { placeholder: 'Escribe…', state: 'input1', type: 'text' } },
    { type: 'textarea', label: 'Textarea', defaults: { placeholder: 'Notas…', state: 'notes', rows: 3 } },
    { type: 'column', label: 'Columna', defaults: { gap: 8, pad: 8 }, container: true },
    { type: 'row', label: 'Fila', defaults: { gap: 8 }, container: true },
    { type: 'card', label: 'Card', defaults: { pad: 14, gap: 8 }, container: true },
    { type: 'spacer', label: 'Espacio', defaults: { size: 12 } },
    { type: 'image', label: 'Imagen', defaults: { src: '', alt: 'img', height: 120 } },
    { type: 'badge', label: 'Badge', defaults: { text: 'LIVE', tone: 'ok' } },
  ]},
  { group: 'Formularios', items: [
    { type: 'form-login', label: 'Login', defaults: { title: 'Entrar', userState: 'user', passState: 'pass' }, container: false },
    { type: 'form-register', label: 'Registro', defaults: { title: 'Crear cuenta' }, container: false },
    { type: 'form-contact', label: 'Contacto', defaults: { title: 'Contacto', emailState: 'email', msgState: 'msg' } },
    { type: 'form-search', label: 'Búsqueda', defaults: { state: 'q', placeholder: 'Buscar…' } },
    { type: 'select', label: 'Select', defaults: { state: 'choice', options: 'A,B,C' } },
    { type: 'checkbox', label: 'Checkbox', defaults: { state: 'ok', label: 'Acepto' } },
    { type: 'switch', label: 'Switch', defaults: { state: 'enabled', label: 'Activo' } },
  ]},
  { group: 'Compuestos', items: [
    { type: 'metric', label: 'Métrica', defaults: { title: 'KPI', value: '—', state: 'kpi', hint: 'alsetState' } },
    { type: 'list', label: 'Lista', defaults: { state: 'items', empty: 'Sin datos' } },
    { type: 'nav', label: 'Nav tabs', defaults: { tabs: 'Inicio,Datos,Ajustes', state: 'tab' } },
    { type: 'hero', label: 'Hero', defaults: { title: 'Producto', subtitle: 'Declarativo · Alset' } },
    { type: 'table', label: 'Tabla', defaults: { state: 'rows', columns: 'id,name' } },
  ]},
  { group: 'Acceso / roles', items: [
    { type: 'login-token', label: 'Login token', defaults: { title: 'Entrar', userState: 'user', passState: 'pass', button: 'Entrar' } },
    { type: 'auth-gate', label: 'Gate por rol', defaults: { role: 'admin', deny: 'Sin permiso' }, container: true },
    { type: 'role-badge', label: 'Badge de rol', defaults: {} },
  ]},
  { group: 'Datos / red', items: [
    { type: 'api', label: 'REST GET', defaults: { url: '/v1/health', state: 'apiData', auto: true } },
    { type: 'api-post', label: 'REST POST', defaults: { url: '/v1/data', state: 'postBody', event: 'submit' } },
    { type: 'state', label: 'Estado', defaults: { name: 'count', value: '0' } },
    { type: 'persist', label: 'Persistencia', defaults: { key: 'app.v1', state: 'count' } },
    { type: 'ipfs', label: 'RootCID / IPFS', defaults: { cid: '', state: 'ipfsDoc' } },
    { type: 'agent', label: 'Agente', defaults: { name: 'ui-agent', note: 'política default-deny en Core' } },
  ]},
  { group: 'Motion (Alset)', items: [
    { type: 'anim-fade', label: 'Anim fade', defaults: { duration: 400 }, container: true },
    { type: 'anim-slide', label: 'Anim slide', defaults: { duration: 400 }, container: true },
    { type: 'anim-scale', label: 'Anim scale', defaults: { duration: 350 }, container: true },
  ]},
  { group: 'Móvil / shell', items: [
    { type: 'hamburger', label: 'Hamburguesa', defaults: { state: 'drawerOpen' } },
    { type: 'drawer', label: 'Menú lateral', defaults: { title: 'Menú', state: 'drawerOpen', side: 'left', open: false }, container: true },
    { type: 'side-menu', label: 'Side menu', defaults: { title: 'Navegación', state: 'drawerOpen', side: 'left' }, container: true },
    { type: 'tabs-shell', label: 'Tabs (shell)', defaults: { tabs: 'Inicio,Explorar,Perfil', state: 'tab' }, container: true },
    { type: 'splash', label: 'Splash', defaults: { title: 'Alset', subtitle: 'Cargando…', duration: 1600, animated: true, autoHide: true, state: 'splash' } },
  ]},
  { group: 'Alset-JS core', items: [
    { type: 'icon', label: 'Icon', defaults: { name: 'pulse', size: 24 } },
    { type: 'fab', label: 'FAB', defaults: { text: '+', action: 'add' } },
    { type: 'layer', label: 'Layer', defaults: {}, container: true },
    { type: 'gradient', label: 'Gradient', defaults: { from: '#1a1f2e', to: '#e8c547', pad: 14 }, container: true },
    { type: 'toast', label: 'Toast', defaults: { text: 'Guardado' } },
    { type: 'animate', label: 'Animate', defaults: { duration: 400 }, container: true },
    { type: 'video', label: 'Video', defaults: { height: 160 } },
    { type: 'audio', label: 'Audio', defaults: {} },
    { type: 'map', label: 'Mapa', defaults: { height: 160, lat: 23.1, lng: -82.3 } },
    { type: 'list-stream', label: 'List stream', defaults: { state: 'items', height: 140 } },
  ]},
];

export const TEMPLATES = [
  {
    id: 'blank',
    name: 'En blanco',
    build() { return []; },
  },
  {
    id: 'landing',
    name: 'Landing',
    build() {
      const c = createNode('column', { gap: 12, pad: 12 });
      c.children.push(createNode('hero', { title: 'Alset App', subtitle: 'UI no-code · RootCID · agentes' }));
      c.children.push(createNode('row', { gap: 8 }));
      c.children[1].children.push(createNode('button', { text: 'Empezar', action: 'start', anim: 'fade' }));
      c.children[1].children.push(createNode('button', { text: 'Docs', action: 'docs' }));
      c.children.push(createNode('metric', { title: 'Usuarios', value: '0', state: 'users' }));
      return [c];
    },
  },
  {
    id: 'login',
    name: 'Login',
    build() {
      return [createNode('form-login', { title: 'Sesión' })];
    },
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    build() {
      const c = createNode('column', { gap: 10, pad: 10 });
      c.children.push(createNode('nav', { tabs: 'Resumen,Datos,API', state: 'tab' }));
      c.children.push(createNode('row', { gap: 8 }));
      c.children[1].children.push(createNode('metric', { title: 'Pulse', state: 'pulse', value: '—' }));
      c.children[1].children.push(createNode('metric', { title: 'API', state: 'apiOk', value: '—' }));
      c.children.push(createNode('api', { url: '/v1/health', state: 'apiData', auto: true }));
      c.children.push(createNode('list', { state: 'apiData', empty: 'Sin payload' }));
      return [c];
    },
  },
  {
    id: 'mobile-shell',
    name: 'App móvil (shell)',
    build() {
      const root = createNode('column', { gap: 0, pad: 0 });
      root.children.push(createNode('splash', { title: 'Mi App', subtitle: 'Offline first', duration: 1400, animated: true }));
      const top = createNode('row', { gap: 10, pad: 10 });
      top.children.push(createNode('hamburger', { state: 'drawerOpen' }));
      top.children.push(createNode('text', { text: 'Inicio', size: 18, weight: 'bold', color: 'primary' }));
      root.children.push(top);
      const drawer = createNode('drawer', { title: 'Menú', state: 'drawerOpen', side: 'left', open: false });
      drawer.children.push(createNode('button', { text: 'Inicio', action: 'home' }));
      drawer.children.push(createNode('button', { text: 'Perfil', action: 'profile' }));
      drawer.children.push(createNode('button', { text: 'Ajustes', action: 'settings' }));
      root.children.push(drawer);
      const tabs = createNode('tabs-shell', { tabs: 'Inicio,Datos,Yo', state: 'mainTab' });
      const t1 = createNode('column', { gap: 10, pad: 12 });
      t1.children.push(createNode('hero', { title: 'Mobile first', subtitle: 'Swipe → menú · gestos en preview' }));
      t1.children.push(createNode('metric', { title: 'Pulses', value: '0', state: 'pulses' }));
      const t2 = createNode('column', { gap: 10, pad: 12 });
      t2.children.push(createNode('api', { url: '/v1/health', state: 'apiData', auto: true }));
      t2.children.push(createNode('list', { state: 'apiData', empty: 'Sin red · offline' }));
      const t3 = createNode('column', { gap: 10, pad: 12 });
      t3.children.push(createNode('text', { text: 'Perfil local', size: 16, weight: 'bold' }));
      t3.children.push(createNode('persist', { key: 'app.v1', state: 'pulses' }));
      tabs.children.push(t1, t2, t3);
      root.children.push(tabs);
      return [root];
    },
  },
  {
    id: 'crud',
    name: 'CRUD fullstack',
    build() {
      const c = createNode('column', { gap: 10, pad: 10 });
      c.children.push(createNode('text', { text: 'Backend Alset /v1/data', size: 16, weight: 'bold', color: 'primary' }));
      c.children.push(createNode('form-contact', { title: 'Nuevo registro' }));
      c.children.push(createNode('api', { url: '/v1/data', state: 'rows', auto: true }));
      c.children.push(createNode('table', { state: 'rows', columns: 'id,email,msg' }));
      return [c];
    },
  },
];

export const THEME_COLORS = {
  primary: '#f5c542',
  secondary: '#5b9cf5',
  background: '#09090b',
  surface: '#161922',
  success: '#34d399',
  danger: '#f87171',
  muted: '#a1a1aa',
  text: '#f4f4f5',
};

export const DEVICES = [
  { id: 'mobile', label: 'Móvil', width: 390, height: 720 },
  { id: 'tablet', label: 'Tablet', width: 768, height: 900 },
  { id: 'desktop', label: 'Desktop', width: 1100, height: 700 },
];

let _id = 1;
export function uid() { return 'n' + (_id++); }

export function createNode(type, defaults = {}) {
  const meta = CATALOG.flatMap((g) => g.items).find((i) => i.type === type);
  const d = { ...(meta?.defaults || {}), ...defaults };
  const container = meta?.container || ['column', 'row', 'card', 'form', 'anim-fade', 'anim-slide', 'anim-scale', 'auth-gate', 'gate', 'drawer', 'side-menu', 'tabs-shell'].includes(type);
  return {
    id: uid(),
    type,
    props: { ...d },
    children: container ? [] : undefined,
  };
}

export function treeToLisp(nodes) {
  function esc(s) { return String(s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"'); }
  function one(n) {
    if (!n) return '';
    const p = n.props || {};
    const props = Object.entries(p)
      .filter(([, v]) => v !== '' && v != null)
      .map(([k, v]) => (typeof v === 'number' ? `(${k} ${v})` : `(${k} "${esc(v)}")`))
      .join(' ');
    const kids = (n.children || []).map(one).join(' ');
    if (n.type === 'text') return `(text "${esc(p.text)}" ${props})`;
    if (n.type === 'button') return `(button "${esc(p.text)}" ${props})`;
    return `(${n.type} ${props} ${kids})`.replace(/  +/g, ' ');
  }
  return `(ui\n  (column (pad 8) (gap 10)\n${(nodes || []).map((n) => '    ' + one(n)).join('\n')}\n  )\n)`;
}

export function treeToApp(nodes, meta = {}) {
  return {
    format: 'alset-app/v1',
    name: meta.name || 'untitled',
    created: new Date().toISOString(),
    rootcid: meta.rootcid || null,
    agent: meta.agent || 'studio-builder',
    tree: nodes,
    states: meta.states || {},
    theme: meta.theme || THEME_COLORS,
    device: meta.device || null,
    pwa: true,
  };
}

/**
 * Apply LispAI source to the visual tree.
 * Supports:
 *  - (set-prop id key "value") / (set-prop id key 123) / (set-prop id key true)
 *  - (add-child parentId (button "…"))  — adds one node under parent or root
 *  - (ui …) / (do …) / (column …) full tree replace when source is a full UI form
 * Returns number of mutations (or nodes replaced).
 */
export function applyLispSnippet(src, nodes) {
  const text = String(src || '').trim();
  if (!text) return 0;
  let n = 0;

  // 1) set-prop patches (string | number | bool)
  const reProp = /\(set-prop\s+(\w+)\s+(\w+)\s+("(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?|true|false)\)/g;
  let m;
  while ((m = reProp.exec(text))) {
    const id = m[1];
    const key = m[2];
    let raw = m[3];
    let val;
    if (raw.startsWith('"')) {
      try { val = JSON.parse(raw); } catch { val = raw.slice(1, -1); }
    } else if (raw === 'true' || raw === 'false') val = raw === 'true';
    else val = Number(raw);
    const walk = (list) => {
      for (const node of list || []) {
        if (node.id === id) {
          node.props[key] = val;
          n++;
        }
        if (node.children) walk(node.children);
      }
    };
    walk(nodes);
  }

  // 2) Full UI tree: (ui …) or top-level column/row
  const isFull =
    /^\(\s*ui\b/i.test(text) ||
    /^\(\s*do\b/i.test(text) ||
    /^\(\s*column\b/i.test(text) ||
    /^\(\s*row\b/i.test(text);
  if (isFull) {
    try {
      const built = lispTreeToNodes(text);
      if (built && built.length) {
        nodes.length = 0;
        built.forEach((x) => nodes.push(x));
        n += built.length;
      }
    } catch (e) {
      console.warn('[LispAI] full tree', e);
      throw e;
    }
  }
  return n;
}

/** Convert LispAI source into studio nodes (uses lightweight local parse). */
export function lispTreeToNodes(src) {
  // Dynamic import avoided (no bundler): inline minimal reuse of forms via Function not needed.
  // Parse with a tiny S-expr reader duplicated for sync use.
  const forms = parseSexpr(src);
  const roots = [];
  const list = Array.isArray(forms) && forms[0] && (forms[0].s === 'do' || forms[0] === 'do')
    ? forms.slice(1)
    : [forms];

  function sym(x) {
    if (x && typeof x === 'object' && 's' in x) return x.s;
    return typeof x === 'string' ? x : null;
  }

  function convert(form) {
    if (form == null) return null;
    if (typeof form === 'string' || typeof form === 'number' || typeof form === 'boolean') {
      return createNode('text', { text: String(form) });
    }
    if (!Array.isArray(form) || !form.length) return null;
    const op = sym(form[0]) || form[0];
    if (op === 'ui' || op === 'do') {
      const kids = form.slice(1).map(convert).filter(Boolean);
      return kids.length === 1 ? kids[0] : createNode('column', { gap: 10, pad: 8, __kids: kids });
    }
    if (op === 'theme') return null; // theme applied separately via meta
    if (op === 'def' || op === 'set!' || op === 'log' || op === 'mind-note' || op === 'rootcid') return null;

    const props = {};
    const children = [];
    for (let i = 1; i < form.length; i++) {
      const item = form[i];
      if (Array.isArray(item) && item.length >= 1) {
        const k = sym(item[0]) || item[0];
        const isWidget = ['column','row','text','button','card','input','nav','list','table','api','hero','metric','spacer','badge','image','auth-gate','gate','login-token','role-badge','form-login','select','checkbox'].includes(k);
        if (typeof k === 'string' && !isWidget) {
          props[k] = item.length === 2 ? literal(item[1]) : item.slice(1).map(literal);
        } else {
          const c = convert(item);
          if (c) children.push(c);
        }
      } else if (typeof item === 'string' || typeof item === 'number') {
        if (op === 'text' || op === 'button') props.text = String(item);
        else children.push(createNode('text', { text: String(item) }));
      }
    }
    // normalize prop names
    if (props.label && !props.text) props.text = props.label;
    const node = createNode(String(op), props);
    if (children.length) {
      node.children = children;
    }
    if (props.__kids) {
      node.children = props.__kids;
      delete node.props.__kids;
    }
    return node;
  }

  function literal(x) {
    if (x && typeof x === 'object' && 's' in x) return x.s;
    return x;
  }

  for (const f of list) {
    const n = convert(f);
    if (!n) continue;
    if (n.props && n.props.__kids) {
      n.children = n.props.__kids;
      delete n.props.__kids;
    }
    // unwrap single column from ui
    if (n.type === 'column' && n.children && !Object.keys(n.props || {}).filter(k => k !== 'gap' && k !== 'pad').length) {
      // keep as is
    }
    roots.push(n);
  }
  return roots;
}

function parseSexpr(src) {
  const tokens = [];
  const s = String(src || '').replace(/;[^\n]*/g, '').replace(/\(/g, ' ( ').replace(/\)/g, ' ) ');
  const re = /"([^"\\]|\\.)*"|[^\s]+/g;
  let m;
  while ((m = re.exec(s))) {
    const t = m[0];
    if (t.startsWith('"')) tokens.push(JSON.parse(t));
    else if (t === '(' || t === ')') tokens.push(t);
    else if (t === 'true') tokens.push(true);
    else if (t === 'false') tokens.push(false);
    else if (t === 'nil' || t === 'null') tokens.push(null);
    else if (/^-?\d+(\.\d+)?$/.test(t)) tokens.push(Number(t));
    else tokens.push({ s: t });
  }
  let i = 0;
  function read() {
    if (i >= tokens.length) throw new Error('fin inesperado');
    const t = tokens[i++];
    if (t === '(') {
      const list = [];
      while (i < tokens.length && tokens[i] !== ')') list.push(read());
      if (i >= tokens.length) throw new Error('falta )');
      i++;
      return list;
    }
    if (t === ')') throw new Error(') inesperado');
    return t;
  }
  const forms = [];
  while (i < tokens.length) forms.push(read());
  return forms.length === 1 ? forms[0] : [{ s: 'do' }, ...forms];
}
