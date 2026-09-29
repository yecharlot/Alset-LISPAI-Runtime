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
  primary: '#e8c547',
  secondary: '#6ea8fe',
  background: '#0b0e14',
  surface: '#161b24',
  success: '#3ddc97',
  danger: '#f07178',
  muted: '#8b93a7',
  text: '#eef1f6',
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
  const container = meta?.container || ['column', 'row', 'card', 'form', 'anim-fade', 'anim-slide', 'anim-scale'].includes(type);
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
    pwa: true,
  };
}

/** Very small lisp list → shallow prop patch (safe subset) */
export function applyLispSnippet(src, nodes) {
  // Only allow (set-prop id key value) forms for safety
  const re = /\(set-prop\s+(\w+)\s+(\w+)\s+"([^"]*)"\)/g;
  let m;
  let n = 0;
  while ((m = re.exec(src))) {
    const [, id, key, val] = m;
    const walk = (list) => {
      for (const node of list || []) {
        if (node.id === id) node.props[key] = val;
        if (node.children) walk(node.children);
      }
    };
    walk(nodes);
    n++;
  }
  return n;
}
