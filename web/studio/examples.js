/**
 * Paquete de ejemplos Alset Studio — apps reales (presente + futuro + AlsetOS).
 * Cargar → Correr preview → Desplegar PWA / registrar en nodo (/w/nombre.app.ans)
 */
import { createNode } from './components.js';

function col(pad = 14, gap = 12) {
  return createNode('column', { gap, pad });
}
function row(gap = 10) {
  return createNode('row', { gap });
}
function title(text, size = 20) {
  return createNode('text', { text, size, weight: 'bold', color: 'primary' });
}
function muted(text, size = 13) {
  return createNode('text', { text, size, color: 'muted' });
}
function btn(text, extra = {}) {
  return createNode('button', { text, action: extra.action || 'ok', ...extra });
}
function metric(t, v, state, hint) {
  return createNode('metric', { title: t, value: v, state, hint });
}
function card(...kids) {
  const c = createNode('card', { pad: 14, gap: 10 });
  kids.forEach((k) => c.children.push(k));
  return c;
}

/* ─── 1. Shell contable estilo ÁbacoPhy ─── */
function appAbacoShell() {
  const root = col(12, 12);
  root.children.push(createNode('state', { name: 'caja', value: '0' }));
  root.children.push(createNode('state', { name: 'items', value: '[]' }));
  root.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  const dr = createNode('drawer', { title: 'Ábaco', state: 'drawerOpen', side: 'left' });
  ['Inicio', 'Inventario', 'Facturas', 'Nómina', 'Informes'].forEach((t) => {
    dr.children.push(btn(t, { action: 'tab-' + t, icon: '▣' }));
  });
  root.children.push(dr);
  root.children.push(createNode('hero', {
    title: 'ÁbacoPhy',
    subtitle: 'Sistema contable · offline-first · Alset',
  }));
  const kpis = row(12);
  kpis.children.push(metric('Caja', '0', 'caja', 'CUP'));
  kpis.children.push(metric('Movimientos', '—', 'items', 'hoy'));
  root.children.push(kpis);
  root.children.push(createNode('rest-consumer', {
    url: '/v1/data', method: 'GET', state: 'items', auto: true, silent: true,
  }));
  root.children.push(createNode('list', {
    state: 'items', empty: 'Sin movimientos', itemTitle: 'name', itemSubtitle: 'id', selectState: 'sel',
  }));
  const ops = row(8);
  ops.children.push(btn('+ Ingreso', { setState: 'caja', setOp: 'incf', setValue: '100' }));
  ops.children.push(btn('− Gasto', { setState: 'caja', setOp: 'decf', setValue: '50' }));
  root.children.push(ops);
  root.children.push(createNode('bottom-tabs', {
    tabs: 'Inicio,Inventario,Facturas,Yo', icons: '⌂,▦,📄,☺', state: 'mainTab',
  }));
  return [root];
}

/* ─── 2. AlsetOS Launcher ─── */
function appAlsetOSHome() {
  const c = col(16, 14);
  c.children.push(createNode('splash', {
    title: 'AlsetOS', subtitle: 'Sistema de apps ANS', duration: 1200, autoHide: true, state: 'splashOs',
    from: '#0a0a0a', to: '#1a1400', icon: 'pulse', spinner: true,
  }));
  c.children.push(title('AlsetOS', 24));
  c.children.push(muted('Apps en /w/nombre.app.ans · identidad del nodo'));
  const grid = row(12);
  const apps = [
    ['Ábaco', 'contable'], ['Ventas', 'sales'], ['Tati', 'tati'],
    ['Mind', 'mind'], ['Mesh', 'mesh'], ['Studio', 'studio'],
  ];
  apps.forEach(([name, id]) => {
    const card = createNode('card', { pad: 12, gap: 6 });
    card.children.push(createNode('icon', { name: 'cpu', size: 28, color: 'primary' }));
    card.children.push(createNode('text', { text: name, weight: 'bold', size: 14 }));
    card.children.push(btn('Abrir', { action: 'route-' + id }));
    grid.children.push(card);
  });
  c.children.push(grid);
  c.children.push(createNode('mesh-peers', { name: 'alsetos', state: 'peers' }));
  return [c];
}

/* ─── 3. Ventas + gestores (Sales Hub) ─── */
function appSalesHub() {
  const c = col(12, 12);
  c.children.push(createNode('state', { name: 'productos', value: '[]' }));
  c.children.push(createNode('rest-consumer', {
    url: '/v1/data', method: 'GET', state: 'productos', auto: true, silent: true,
  }));
  const shell = createNode('bottom-tabs', {
    tabs: 'Catálogo,Pedidos,Chat,Plan', icons: '▣,✎,💬,★', state: 'mainTab',
  });
  const cat = col(10, 10);
  cat.children.push(title('Catálogo', 18));
  cat.children.push(createNode('form-search', { state: 'q', placeholder: 'Buscar producto…' }));
  cat.children.push(createNode('list', {
    state: 'productos', itemTitle: 'name', itemSubtitle: 'description', itemMeta: 'price',
    empty: 'Publica productos', selectState: 'producto',
  }));
  cat.children.push(btn('Agregar al carrito', { action: 'add-cart', setState: 'toast', setValue: 'Añadido' }));
  const ped = col(10, 10);
  ped.children.push(title('Pedidos', 18));
  ped.children.push(createNode('table', { state: 'productos', columns: 'id,name' }));
  ped.children.push(createNode('progress', { value: 60, state: 'uploadPct' }));
  const chat = col(10, 10);
  chat.children.push(title('Chat', 18));
  chat.children.push(createNode('pulse-consumer', { url: '/api/pulse', keys: 'chat', state: 'msgs', silent: true }));
  chat.children.push(createNode('list', { state: 'msgs', empty: 'Sin mensajes', itemTitle: 'text' }));
  chat.children.push(createNode('input', { placeholder: 'Mensaje…', state: 'msg' }));
  chat.children.push(btn('Enviar', { action: 'send' }));
  const plan = col(10, 10);
  plan.children.push(title('Plan', 18));
  plan.children.push(createNode('badge', { text: 'PRO' }));
  plan.children.push(muted('Límites de gestores y clientes según plan'));
  shell.children.push(cat, ped, chat, plan);
  c.children.push(shell);
  return [c];
}

/* ─── 4. La Tati — gestora ─── */
function appLaTati() {
  const c = col(12, 12);
  c.children.push(createNode('hero', { title: 'La Tati', subtitle: 'Catálogo · pedidos · WhatsApp' }));
  c.children.push(createNode('carousel', { state: 'productos', animated: true }));
  c.children.push(createNode('rest-consumer', {
    url: '/v1/data', method: 'GET', state: 'productos', auto: true, silent: true,
  }));
  c.children.push(createNode('list', {
    state: 'productos', itemTitle: 'name', itemSubtitle: 'description', itemMeta: 'price',
    empty: 'Sin ofertas', selectState: 'sel',
  }));
  const r = row(8);
  r.children.push(btn('Marcar interés', { action: 'interest' }));
  r.children.push(btn('Pedir por WA', { action: 'wa' }));
  c.children.push(r);
  c.children.push(createNode('fab', { icon: 'plus', action: 'new' }));
  return [c];
}

/* ─── 5. Estados + CRUD completo ─── */
function appStateCrud() {
  const c = col(14, 12);
  c.children.push(createNode('state', { name: 'contador', value: '0' }));
  c.children.push(createNode('state', { name: 'items', value: '[]' }));
  c.children.push(title('Laboratorio de estado', 18));
  c.children.push(muted('Botones setOp · list custom · REST · Lisp (get-state)'));
  c.children.push(metric('Contador', '0', 'contador', 'alsetState'));
  const r = row(8);
  r.children.push(btn('+1', { setState: 'contador', setOp: 'incf', setValue: '1' }));
  r.children.push(btn('−1', { setState: 'contador', setOp: 'decf', setValue: '1' }));
  r.children.push(btn('Reset', { setState: 'contador', setValue: 0 }));
  c.children.push(r);
  c.children.push(createNode('input', { placeholder: 'Nuevo nombre', state: 'nuevoNombre' }));
  c.children.push(createNode('api-post', { url: '/v1/data', state: 'nuevoNombre', event: 'submit', silent: true }));
  c.children.push(btn('Crear (POST)', { action: 'submit' }));
  c.children.push(createNode('rest-consumer', {
    url: '/v1/data', method: 'GET', state: 'items', auto: true, silent: true,
  }));
  c.children.push(createNode('list', {
    state: 'items', itemTitle: 'name', itemSubtitle: 'id', empty: 'Lista vacía', selectState: 'sel',
  }));
  c.children.push(createNode('table', { state: 'items', columns: 'id,name' }));
  return [c];
}

/* ─── 6. Mind · Zyrion deck ─── */
function appMindDeck() {
  const c = col(14, 12);
  c.children.push(title('Mind Control', 20));
  c.children.push(muted('Latido ternario · Zyrion 0/1/2 · memoria local'));
  c.children.push(createNode('mind-panel', { title: 'Alset Mind' }));
  c.children.push(createNode('zyrion-panel', { title: 'Zyrion' }));
  c.children.push(createNode('zyrion-filter', { state: 'filtro', label: 'Filtro' }));
  c.children.push(createNode('mcp-agent', { name: 'studio-mcp' }));
  return [c];
}

/* ─── 7. Red mesh + pulsos ─── */
function appMeshLive() {
  const c = col(14, 12);
  c.children.push(title('Red en vivo', 18));
  c.children.push(createNode('pulse-consumer', {
    url: '/api/pulse', keys: 'live,feed', state: 'pulseData', silent: true,
  }));
  c.children.push(createNode('mesh-peers', { name: 'studio-peer', state: 'peers' }));
  c.children.push(createNode('list', { state: 'pulseData', empty: 'Esperando pulsos…', itemTitle: 'text' }));
  c.children.push(createNode('metric', { title: 'Peers', value: '0', state: 'peers', hint: 'mesh' }));
  return [c];
}

/* ─── 8. Media + mapa ─── */
function appMediaMap() {
  const tabs = createNode('tabs-shell', { tabs: 'Video,Audio,Mapa', state: 'mediaTab' });
  const v = col(10, 10);
  v.children.push(title('Video', 16));
  v.children.push(createNode('video', {
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    controls: true,
  }));
  const a = col(10, 10);
  a.children.push(title('Audio', 16));
  a.children.push(createNode('audio', {
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
    controls: true,
  }));
  const m = col(10, 10);
  m.children.push(title('Mapa', 16));
  m.children.push(createNode('map', { lat: 20.145, lng: -75.206, height: 220, label: 'Guantánamo' }));
  tabs.children.push(v, a, m);
  return [tabs];
}

/* ─── 9. Identidad / login ANS ─── */
function appIdentity() {
  const c = col(16, 14);
  c.children.push(createNode('hero', {
    title: 'Identidad Alset',
    subtitle: 'Token · roles · gate',
  }));
  c.children.push(createNode('login-token', {
    title: 'Entrar', userState: 'user', passState: 'pass', button: 'Entrar',
  }));
  c.children.push(createNode('role-badge', {}));
  const gate = createNode('auth-gate', { role: 'admin', deny: 'Solo admin' });
  gate.children.push(title('Zona admin', 16));
  gate.children.push(muted('Visible solo con rol admin'));
  c.children.push(gate);
  return [c];
}

/* ─── 10. Agente futuro / desk autónomo ─── */
function appFutureAgent() {
  const c = col(14, 12);
  c.children.push(createNode('badge', { text: 'FUTURO' }));
  c.children.push(title('Agent Desk', 22));
  c.children.push(muted('Vista-agente · pulse · mind · gen temporal'));
  c.children.push(createNode('view-agent', { key: 'desk', name: 'ops-agent' }));
  c.children.push(createNode('agent', { name: 'ops-agent', note: 'default-deny' }));
  c.children.push(createNode('mind-panel', { title: 'Mind' }));
  c.children.push(createNode('pulse-consumer', { url: '/api/pulse', keys: 'agent', state: 'agentFeed', silent: true }));
  c.children.push(createNode('list', { state: 'agentFeed', empty: 'Sin hallazgos de sonda', itemTitle: 'text' }));
  c.children.push(createNode('architecture', { layer: 'domain' }));
  return [c];
}

/* ─── 11. Inventario multi-unidad ─── */
function appInventory() {
  const c = col(12, 12);
  c.children.push(title('Inventario', 18));
  c.children.push(createNode('state', { name: 'stock', value: '[]' }));
  c.children.push(createNode('rest-consumer', {
    url: '/v1/data', method: 'GET', state: 'stock', auto: true, silent: true,
  }));
  c.children.push(createNode('nav', { tabs: 'Almacén,Unidades,Recepción', state: 'invTab' }));
  c.children.push(createNode('list', {
    state: 'stock', itemTitle: 'name', itemMeta: 'qty', empty: 'Sin SKU', selectState: 'sku',
  }));
  c.children.push(createNode('table', { state: 'stock', columns: 'id,name' }));
  const r = row(8);
  r.children.push(btn('Entrada', { action: 'in' }));
  r.children.push(btn('Salida', { action: 'out' }));
  c.children.push(r);
  return [c];
}

/* ─── 12. Ciudad / servicios (futuro social) ─── */
function appCityServices() {
  const c = col(14, 12);
  c.children.push(createNode('hero', {
    title: 'Servicios municipales',
    subtitle: 'Reportes · mapa · trazabilidad CID',
  }));
  c.children.push(createNode('map', { lat: 20.145, lng: -75.206, height: 180, label: 'Municipio' }));
  c.children.push(createNode('form-contact', { title: 'Reportar incidencia', emailState: 'email', msgState: 'msg' }));
  c.children.push(createNode('list', { state: 'items', empty: 'Sin reportes', itemTitle: 'name' }));
  c.children.push(createNode('ipfs', { cid: '', state: 'ipfsDoc', silent: true }));
  return [c];
}

/* ─── 13. WebRTC + stream (ops) ─── */
function appLiveOps() {
  const c = col(12, 12);
  c.children.push(title('Live Ops', 18));
  c.children.push(createNode('webrtc-camera', { height: 200 }));
  c.children.push(createNode('stream-hub', { matchId: 'demo', label: 'Cam-A' }));
  c.children.push(createNode('chip', { text: 'edge' }));
  return [c];
}

/* ─── 14. Clean architecture sample ─── */
function appCleanArch() {
  const c = col(12, 12);
  c.children.push(title('Clean Architecture', 18));
  c.children.push(createNode('architecture', { layer: 'presentation' }));
  c.children.push(createNode('architecture', { layer: 'domain' }));
  c.children.push(createNode('architecture', { layer: 'data' }));
  c.children.push(muted('Organiza el árbol por capas sin perder reactividad'));
  c.children.push(createNode('rest-consumer', {
    url: '/v1/health', method: 'GET', state: 'health', auto: true, silent: true,
  }));
  c.children.push(metric('Health', '—', 'health', 'data layer'));
  return [c];
}

export const EXAMPLES = [
  { id: 'abaco-shell', name: 'ÁbacoPhy Shell', blurb: 'Contable · drawer · KPIs · list · estados', tags: ['negocio', 'abaco', 'os'], build: appAbacoShell },
  { id: 'alsetos-home', name: 'AlsetOS Home', blurb: 'Launcher de apps ANS para el sistema', tags: ['os', 'alsetos'], build: appAlsetOSHome },
  { id: 'sales-hub', name: 'Sales Hub', blurb: 'Catálogo · pedidos · chat pulse · plan', tags: ['negocio', 'ventas'], build: appSalesHub },
  { id: 'la-tati', name: 'La Tati', blurb: 'Gestora · catálogo · interés · WA', tags: ['negocio', 'tati'], build: appLaTati },
  { id: 'state-crud', name: 'Estados + CRUD', blurb: 'setOp · REST · list custom · table', tags: ['logic', 'crud'], build: appStateCrud },
  { id: 'mind-deck', name: 'Mind · Zyrion', blurb: 'Latido ternario y filtros', tags: ['mind', 'zyrion'], build: appMindDeck },
  { id: 'mesh-live', name: 'Mesh + Pulsos', blurb: 'Red en vivo y consumers', tags: ['mesh', 'pulse'], build: appMeshLive },
  { id: 'media-map', name: 'Media + Mapa', blurb: 'Video · audio · OSM', tags: ['media', 'map'], build: appMediaMap },
  { id: 'identity', name: 'Identidad ANS', blurb: 'Login token · roles · gate', tags: ['auth', 'os'], build: appIdentity },
  { id: 'future-agent', name: 'Agent Desk', blurb: 'Agente autónomo · mind · pulse', tags: ['futuro', 'agent'], build: appFutureAgent },
  { id: 'inventory', name: 'Inventario', blurb: 'SKU · almacén · unidades', tags: ['negocio', 'ops'], build: appInventory },
  { id: 'city', name: 'Servicios ciudad', blurb: 'Mapa · reportes · CID', tags: ['futuro', 'social'], build: appCityServices },
  { id: 'live-ops', name: 'Live Ops', blurb: 'WebRTC + stream hub', tags: ['webrtc', 'ops'], build: appLiveOps },
  { id: 'clean-arch', name: 'Clean Architecture', blurb: 'Capas + health connector', tags: ['arch'], build: appCleanArch },
];
