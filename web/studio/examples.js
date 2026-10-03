/**
 * Paquete de apps funcionales (datos simulados) — listas para desplegar.
 * Cada build() devuelve un árbol completo con state seed + UI interactiva.
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
function st(name, value) {
  const v = typeof value === 'string' ? value : JSON.stringify(value);
  return createNode('state', { name, value: v, silent: true });
}

/* ========== 1. AGENCIA DE VIAJES ========== */
function appTravelAgency() {
  const routes = [
    { id: 'r1', name: 'Guantánamo → Baracoa', lat: 20.35, lng: -74.5, km: 152, walkMin: 2100, carMin: 180, priceBus: 85, priceTaxi: 220, priceShared: 120 },
    { id: 'r2', name: 'Guantánamo → Santiago', lat: 20.02, lng: -75.82, km: 78, walkMin: 960, carMin: 75, priceBus: 45, priceTaxi: 140, priceShared: 70 },
    { id: 'r3', name: 'Guantánamo → Moa', lat: 20.65, lng: -74.95, km: 110, walkMin: 1500, carMin: 130, priceBus: 60, priceTaxi: 180, priceShared: 95 },
    { id: 'r4', name: 'Centro → Aeropuerto', lat: 20.09, lng: -75.16, km: 12, walkMin: 150, carMin: 18, priceBus: 15, priceTaxi: 40, priceShared: 25 },
  ];
  const c = col(12, 12);
  c.children.push(st('rutas', routes));
  c.children.push(st('rutaSel', routes[0]));
  c.children.push(st('ticketType', 'Bus'));
  c.children.push(st('precio', 85));
  c.children.push(st('mapLat', 20.35));
  c.children.push(st('mapLng', -74.5));
  c.children.push(st('toast', ''));

  c.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  const dr = createNode('drawer', { title: 'Viajes Oriente', state: 'drawerOpen', side: 'left' });
  dr.children.push(btn('Rutas', { action: 'tab-rutas', setState: 'drawerOpen', setValue: false }));
  dr.children.push(btn('Mis boletos', { action: 'tab-boletos', setState: 'drawerOpen', setValue: false }));
  dr.children.push(btn('Ayuda', { action: 'tab-help', setState: 'drawerOpen', setValue: false }));
  c.children.push(dr);

  c.children.push(createNode('hero', {
    title: 'Viajes Oriente',
    subtitle: 'Rutas · mapa · tiempos · precios editables',
  }));
  c.children.push(createNode('toast', { state: 'toast' }));

  c.children.push(title('Elige ruta', 16));
  c.children.push(createNode('list', {
    state: 'rutas',
    itemTitle: 'name',
    itemSubtitle: 'km',
    itemMeta: 'priceBus',
    empty: 'Sin rutas',
    selectState: 'rutaSel',
  }));

  const det = createNode('card', { pad: 14, gap: 10 });
  det.children.push(title('Detalle de ruta', 15));
  det.children.push(metric('Distancia (km)', '—', 'rutaSel', 'campo km en objeto'));
  det.children.push(createNode('map', {
    latState: 'mapLat', lngState: 'mapLng', height: 200, zoom: 10, label: 'Destino en mapa',
  }));
  // Tiempos simulados (métricas fijas de demo + botones que actualizan)
  const times = row(8);
  times.children.push(metric('A pie', '35 h', 'tWalk', 'simulado'));
  times.children.push(metric('En carro', '3 h', 'tCar', 'simulado'));
  det.children.push(times);
  det.children.push(muted('Tipos de pasaje'));
  const tickets = row(8);
  tickets.children.push(btn('Bus 85 CUP', {
    setState: 'ticketType', setValue: 'Bus',
  }));
  tickets.children.push(btn('Colectivo 120', {
    setState: 'ticketType', setValue: 'Colectivo',
  }));
  tickets.children.push(btn('Taxi 220', {
    setState: 'ticketType', setValue: 'Taxi',
  }));
  det.children.push(tickets);
  det.children.push(metric('Tipo elegido', 'Bus', 'ticketType', ''));
  det.children.push(metric('Precio CUP', '85', 'precio', ''));
  const priceEdit = row(8);
  priceEdit.children.push(btn('Precio −10', { setState: 'precio', setOp: 'decf', setValue: '10' }));
  priceEdit.children.push(btn('Precio +10', { setState: 'precio', setOp: 'incf', setValue: '10' }));
  det.children.push(priceEdit);
  det.children.push(btn('Confirmar boleto', {
    setState: 'toast', setValue: 'Boleto reservado (simulado)',
  }));
  c.children.push(det);

  // Sync map center when selecting - user uses buttons for demo destinations
  const dests = row(8);
  dests.children.push(btn('Ver Baracoa', {
    setState: 'mapLat', setValue: 20.35,
  }));
  dests.children.push(btn('Ver Santiago', {
    setState: 'mapLat', setValue: 20.02,
  }));
  c.children.push(dests);
  c.children.push(btn('Centrar Moa', { setState: 'mapLng', setValue: -74.95 }));
  c.children.push(muted('Al tocar una ruta en la lista queda en rutaSel; ajusta precio y tipo libremente.'));
  return [c];
}

/* ========== 2. NEGOCIOS LOCALES + OFERTAS + NOTIF ========== */
function appLocalBizMap() {
  const negocios = [
    { id: 'n1', name: 'Mercado La Plaza', lat: 20.145, lng: -75.206, category: 'Alimentos', offers: 3 },
    { id: 'n2', name: 'Tech Point', lat: 20.148, lng: -75.210, category: 'Electrónica', offers: 2 },
    { id: 'n3', name: 'Café del Este', lat: 20.142, lng: -75.200, category: 'Café', offers: 1 },
    { id: 'n4', name: 'Farmacia Central', lat: 20.146, lng: -75.203, category: 'Salud', offers: 0 },
  ];
  const productos = [
    { id: 'p1', name: 'Arroz 1kg', business: 'Mercado La Plaza', price: '120 CUP', description: 'Oferta del día' },
    { id: 'p2', name: 'Aceite 1L', business: 'Mercado La Plaza', price: '380 CUP', description: 'Stock limitado' },
    { id: 'p3', name: 'Audífonos BT', business: 'Tech Point', price: '25 USD', description: 'Nueva oferta' },
    { id: 'p4', name: 'Cortado', business: 'Café del Este', price: '50 CUP', description: 'Happy hour' },
  ];
  const c = col(12, 12);
  c.children.push(st('negocios', negocios));
  c.children.push(st('productos', productos));
  c.children.push(st('mapLat', 20.145));
  c.children.push(st('mapLng', -75.206));
  c.children.push(st('toast', 'Bienvenido a tu barrio'));
  c.children.push(st('notifCount', 1));

  c.children.push(createNode('toast', { state: 'toast' }));
  c.children.push(createNode('hero', {
    title: 'Barrio Vivo',
    subtitle: 'Negocios · mapa · ofertas en tiempo real (simulado)',
  }));
  c.children.push(metric('Avisos', '1', 'notifCount', 'nuevas ofertas'));

  c.children.push(createNode('map', {
    latState: 'mapLat', lngState: 'mapLng', height: 210, zoom: 14, label: 'Tu localidad',
  }));

  c.children.push(title('Negocios', 16));
  c.children.push(createNode('list', {
    state: 'negocios',
    itemTitle: 'name',
    itemSubtitle: 'category',
    itemMeta: 'offers',
    selectState: 'negocioSel',
    empty: 'Sin negocios',
  }));

  c.children.push(title('Productos y ofertas', 16));
  c.children.push(createNode('list', {
    state: 'productos',
    itemTitle: 'name',
    itemSubtitle: 'business',
    itemMeta: 'price',
    selectState: 'prodSel',
  }));

  const actions = row(8);
  actions.children.push(btn('Nueva oferta', {
    setState: 'toast', setValue: 'Nueva oferta en Mercado La Plaza',
  }));
  actions.children.push(btn('+1 aviso', {
    setState: 'notifCount', setOp: 'incf', setValue: '1',
  }));
  c.children.push(actions);
  c.children.push(btn('Centrar mapa Plaza', {
    setState: 'mapLat', setValue: 20.145,
  }));

  c.children.push(createNode('bottom-tabs', {
    tabs: 'Mapa,Ofertas,Yo', icons: '◎,★,☺', state: 'mainTab',
  }));
  return [c];
}

/* ========== 3. DRAWER + BOTTOM TABS MODERNOS ========== */
function appModernShell() {
  const c = col(12, 12);
  c.children.push(st('drawerOpen', false));
  c.children.push(st('mainTab', 'Inicio'));
  c.children.push(st('kpi', 1280));
  c.children.push(st('series', [
    { label: 'Lun', value: 40 }, { label: 'Mar', value: 65 }, { label: 'Mié', value: 52 },
    { label: 'Jue', value: 80 }, { label: 'Vie', value: 95 },
  ]));

  c.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  const dr = createNode('drawer', { title: 'Nova', state: 'drawerOpen', side: 'left' });
  ['Inicio', 'Analítica', 'Catálogo', 'Ajustes'].forEach((t) => {
    dr.children.push(btn(t, {
      action: 'nav-' + t,
      setState: 'drawerOpen',
      setValue: false,
    }));
  });
  c.children.push(dr);

  c.children.push(createNode('gradient', {
    from: '#f4b400', to: '#1a1200', pad: 16,
  }));
  // gradient may be container - if not, hero works
  c.children.push(createNode('hero', {
    title: 'Nova Commerce',
    subtitle: 'Drawer · tabs · charts · motion',
  }));
  c.children.push(createNode('chip', { text: 'LIVE' }));
  const k = row(10);
  k.children.push(metric('Ventas', '1280', 'kpi', 'CUP'));
  k.children.push(metric('Tab', 'Inicio', 'mainTab', ''));
  c.children.push(k);
  c.children.push(createNode('chart-bar', { state: 'series', title: 'Semana' }));
  c.children.push(createNode('chart-line', { state: 'series', title: 'Tendencia' }));
  const r = row(8);
  r.children.push(btn('+ venta', { setState: 'kpi', setOp: 'incf', setValue: '50' }));
  r.children.push(btn('Abrir menú', { setState: 'drawerOpen', setValue: true }));
  c.children.push(r);

  c.children.push(createNode('bottom-tabs', {
    tabs: 'Inicio,Buscar,Carrito,Perfil',
    icons: '⌂,⌕,▣,☺',
    state: 'mainTab',
  }));
  return [c];
}

/* ========== 4. CATÁLOGO E-COMMERCE MARKETING ========== */
function appShopMarketing() {
  const products = [
    { id: '1', name: 'Zapatillas Pulse', description: 'Edición limitada', price: '45 USD', tag: 'HOT' },
    { id: '2', name: 'Reloj Chronos', description: 'Smart + GPS', price: '89 USD', tag: 'NEW' },
    { id: '3', name: 'Auriculares Air', description: 'Noise cancel', price: '32 USD', tag: '−20%' },
    { id: '4', name: 'Mochila Urban', description: 'Impermeable', price: '28 USD', tag: '' },
  ];
  const c = col(12, 14);
  c.children.push(st('catalog', products));
  c.children.push(st('cartCount', 0));
  c.children.push(st('toast', ''));
  c.children.push(st('series', [
    { label: 'S1', value: 20 }, { label: 'S2', value: 45 }, { label: 'S3', value: 70 }, { label: 'S4', value: 110 },
  ]));

  c.children.push(createNode('hero', {
    title: 'PULSE STORE',
    subtitle: 'Colores vivos · tipografía fuerte · conversión',
  }));
  c.children.push(createNode('badge', { text: 'ENVÍO 24H' }));
  c.children.push(createNode('carousel', { state: 'catalog', animated: true }));
  c.children.push(metric('Carrito', '0', 'cartCount', 'ítems'));
  c.children.push(createNode('toast', { state: 'toast' }));
  c.children.push(createNode('form-search', { state: 'q', placeholder: 'Buscar producto…' }));
  c.children.push(createNode('list', {
    state: 'catalog',
    itemTitle: 'name',
    itemSubtitle: 'description',
    itemMeta: 'price',
    selectState: 'sel',
    empty: 'Catálogo vacío',
  }));
  const buy = row(8);
  buy.children.push(btn('Agregar al carrito', {
    setState: 'cartCount', setOp: 'incf', setValue: '1',
  }));
  buy.children.push(btn('Checkout', {
    setState: 'toast', setValue: 'Pedido simulado enviado',
  }));
  c.children.push(buy);
  c.children.push(createNode('chart-bar', { state: 'series', title: 'Conversión semanal' }));
  c.children.push(createNode('shape', { kind: 'blob', size: 72, from: '#f4b400', to: '#fb7185' }));
  c.children.push(createNode('bottom-tabs', {
    tabs: 'Shop,Ofertas,Carrito,Cuenta', icons: '▣,★,🛒,☺', state: 'shopTab',
  }));
  return [c];
}

/* ========== 5. ÁBACO DASHBOARD CON GRÁFICOS ========== */
function appAbacoDashboard() {
  const c = col(12, 12);
  c.children.push(st('caja', 15400));
  c.children.push(st('gastos', 3200));
  c.children.push(st('series', [
    { label: 'Ene', value: 12 }, { label: 'Feb', value: 18 }, { label: 'Mar', value: 15 },
    { label: 'Abr', value: 22 }, { label: 'May', value: 28 },
  ]));
  c.children.push(st('movimientos', [
    { id: '1', name: 'Venta mostrador', description: 'Ingreso', price: '+800 CUP' },
    { id: '2', name: 'Compra insumos', description: 'Gasto', price: '−450 CUP' },
    { id: '3', name: 'Servicio', description: 'Ingreso', price: '+200 CUP' },
  ]));

  c.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  const dr = createNode('drawer', { title: 'ÁbacoPhy', state: 'drawerOpen' });
  ['Dashboard', 'Inventario', 'Facturas', 'Nómina'].forEach((t) => {
    dr.children.push(btn(t, { setState: 'drawerOpen', setValue: false }));
  });
  c.children.push(dr);
  c.children.push(createNode('hero', { title: 'ÁbacoPhy', subtitle: 'Dashboard contable vivo' }));
  const k = row(10);
  k.children.push(metric('Caja', '15400', 'caja', 'CUP'));
  k.children.push(metric('Gastos', '3200', 'gastos', 'CUP'));
  c.children.push(k);
  c.children.push(createNode('chart-bar', { state: 'series', title: 'Ingresos mensuales' }));
  c.children.push(createNode('chart-line', { state: 'series', title: 'Tendencia' }));
  c.children.push(createNode('list', {
    state: 'movimientos', itemTitle: 'name', itemSubtitle: 'description', itemMeta: 'price',
  }));
  const r = row(8);
  r.children.push(btn('+800 venta', { setState: 'caja', setOp: 'incf', setValue: '800' }));
  r.children.push(btn('−200 gasto', { setState: 'caja', setOp: 'decf', setValue: '200' }));
  c.children.push(r);
  c.children.push(createNode('bottom-tabs', {
    tabs: 'Inicio,Libro,Informes,Más', icons: '⌂,▦,▥,☰', state: 'abTab',
  }));
  return [c];
}

/* ========== 6. PEDIDOS ONLINE (TATI-LIKE) ========== */
function appOrdersOnline() {
  const catalog = [
    { id: 'a', name: 'Combo familiar', description: 'Sin precio aún', price: 'Consultar' },
    { id: 'b', name: 'Caja de pollo', description: 'Listo', price: '15 USD' },
    { id: 'c', name: 'Refresco pack', description: '6 u', price: '8 USD' },
  ];
  const c = col(12, 12);
  c.children.push(st('catalog', catalog));
  c.children.push(st('orders', []));
  c.children.push(st('cartCount', 0));
  c.children.push(st('toast', ''));
  c.children.push(createNode('hero', { title: 'La Tati', subtitle: 'Pide · confirma · recoge' }));
  c.children.push(createNode('toast', { state: 'toast' }));
  c.children.push(metric('En carrito', '0', 'cartCount', ''));
  c.children.push(createNode('list', {
    state: 'catalog', itemTitle: 'name', itemSubtitle: 'description', itemMeta: 'price', selectState: 'sel',
  }));
  const r = row(8);
  r.children.push(btn('Agregar al carrito', { setState: 'cartCount', setOp: 'incf', setValue: '1' }));
  r.children.push(btn('Hacer pedido', { setState: 'toast', setValue: 'Pedido enviado a gestora' }));
  c.children.push(r);
  c.children.push(btn('Marcar interés (sin precio)', {
    setState: 'toast', setValue: 'Interés registrado — te avisamos el precio',
  }));
  c.children.push(createNode('bottom-tabs', {
    tabs: 'Catálogo,Pedidos,Chat', icons: '▣,✎,💬', state: 'tTab',
  }));
  return [c];
}

/* ========== 7. ALSETOS LAUNCHER FUNCIONAL ========== */
function appAlsetOS() {
  const c = col(16, 14);
  c.children.push(st('toast', ''));
  c.children.push(createNode('splash', {
    title: 'AlsetOS', subtitle: 'Cargando shell…', duration: 900, autoHide: true, spinner: true,
    from: '#0a0a0a', to: '#1a1400',
  }));
  c.children.push(createNode('toast', { state: 'toast' }));
  c.children.push(title('AlsetOS', 24));
  c.children.push(muted('Apps listas para /w/nombre.app.ans'));
  const grid = row(10);
  [
    ['Ábaco', 'abaco-dashboard'],
    ['Viajes', 'travel-agency'],
    ['Barrio', 'local-biz'],
    ['Shop', 'shop-mkt'],
  ].forEach(([name, id]) => {
    const card = createNode('card', { pad: 12, gap: 8 });
    card.children.push(createNode('text', { text: name, weight: 'bold', size: 15 }));
    card.children.push(btn('Abrir', {
      setState: 'toast', setValue: 'Abriendo ' + id + ' (simulado ANS)',
    }));
    grid.children.push(card);
  });
  c.children.push(grid);
  return [c];
}

/* ========== 8. ANALÍTICA + CHARTS ========== */
function appAnalytics() {
  const c = col(14, 12);
  c.children.push(st('series', [
    { label: 'A', value: 30 }, { label: 'B', value: 55 }, { label: 'C', value: 42 },
    { label: 'D', value: 78 }, { label: 'E', value: 90 },
  ]));
  c.children.push(st('kpi', 90));
  c.children.push(title('Analítica', 20));
  c.children.push(metric('Score', '90', 'kpi', ''));
  c.children.push(createNode('chart-bar', { state: 'series', title: 'Canales' }));
  c.children.push(createNode('chart-line', { state: 'series', title: 'Evolución' }));
  c.children.push(btn('Simular pico', { setState: 'kpi', setOp: 'incf', setValue: '5' }));
  return [c];
}

export const EXAMPLES = [
  { id: 'travel-agency', name: 'Agencia de viajes', blurb: 'Rutas · mapa · pie/carro · precios · tipos de pasaje', tags: ['mapa', 'negocio', 'completo'], build: appTravelAgency },
  { id: 'local-biz', name: 'Barrio Vivo', blurb: 'Negocios en mapa · ofertas · notificaciones', tags: ['mapa', 'local', 'completo'], build: appLocalBizMap },
  { id: 'modern-shell', name: 'Nova Shell', blurb: 'Drawer + bottom tabs + charts animados', tags: ['ui', 'completo'], build: appModernShell },
  { id: 'shop-mkt', name: 'Pulse Store', blurb: 'Catálogo marketing · carrito · conversión', tags: ['ventas', 'completo'], build: appShopMarketing },
  { id: 'abaco-dashboard', name: 'Ábaco Dashboard', blurb: 'Caja · gráficos · movimientos · drawer', tags: ['abaco', 'completo'], build: appAbacoDashboard },
  { id: 'orders-online', name: 'Pedidos online', blurb: 'Catálogo gestora · carrito · interés', tags: ['ventas', 'tati'], build: appOrdersOnline },
  { id: 'alsetos', name: 'AlsetOS Launcher', blurb: 'Shell de sistema · abrir apps ANS', tags: ['os', 'alsetos'], build: appAlsetOS },
  { id: 'analytics', name: 'Analítica charts', blurb: 'Barras · línea · KPI interactivo', tags: ['charts', 'completo'], build: appAnalytics },
];
