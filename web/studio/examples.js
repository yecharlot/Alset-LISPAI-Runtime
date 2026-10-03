/**
 * Apps funcionales con MapLibre (Alset-JS MapNode), rutas polyline, direcciones.
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
  return createNode('button', { text, ...extra });
}
function metric(t, v, state, hint) {
  return createNode('metric', { title: t, value: v, state, hint });
}
function st(name, value) {
  const v = typeof value === 'string' ? value : JSON.stringify(value);
  return createNode('state', { name, value: v, silent: true });
}

/** Ruta Guantánamo centro → Baracoa (lat,lng samples) */
const ROUTE_BARACOA = [
  [20.1453, -75.2062],
  [20.18, -75.05],
  [20.22, -74.85],
  [20.28, -74.65],
  [20.3467, -74.4964],
];
const ROUTE_SANTIAGO = [
  [20.1453, -75.2062],
  [20.10, -75.40],
  [20.05, -75.65],
  [20.0217, -75.8267],
];
const ROUTE_MOA = [
  [20.1453, -75.2062],
  [20.30, -75.10],
  [20.50, -75.00],
  [20.655, -74.95],
];

function appTravelAgency() {
  const routes = [
    { id: 'r1', name: 'Guantánamo → Baracoa', km: 152, walkH: '35 h', carH: '3.0 h', priceBus: 85, priceTaxi: 220, priceShared: 120 },
    { id: 'r2', name: 'Guantánamo → Santiago', km: 78, walkH: '16 h', carH: '1.3 h', priceBus: 45, priceTaxi: 140, priceShared: 70 },
    { id: 'r3', name: 'Guantánamo → Moa', km: 110, walkH: '25 h', carH: '2.2 h', priceBus: 60, priceTaxi: 180, priceShared: 95 },
  ];
  const c = col(12, 12);
  c.children.push(st('rutas', routes));
  c.children.push(st('routeCoords', ROUTE_BARACOA));
  c.children.push(st('mapMarkers', [
    { lat: 20.1453, lng: -75.2062, label: 'Origen' },
    { lat: 20.3467, lng: -74.4964, label: 'Baracoa' },
  ]));
  c.children.push(st('mapLat', 20.1453));
  c.children.push(st('mapLng', -75.2062));
  c.children.push(st('ticketType', 'Bus'));
  c.children.push(st('precio', 85));
  c.children.push(st('tWalk', '35 h'));
  c.children.push(st('tCar', '3.0 h'));
  c.children.push(st('distKm', 152));
  c.children.push(st('toast', ''));
  c.children.push(st('address', 'Guantánamo, Centro'));

  c.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  const dr = createNode('drawer', { title: 'Viajes Oriente', subtitle: 'Rutas reales en mapa', state: 'drawerOpen' });
  dr.children.push(btn('Rutas', { setState: 'drawerOpen', setValue: false }));
  dr.children.push(btn('Direcciones', { setState: 'drawerOpen', setValue: false }));
  dr.children.push(btn('Ayuda', { setState: 'drawerOpen', setValue: false }));
  c.children.push(dr);

  c.children.push(createNode('hero', {
    title: 'Viajes Oriente',
    subtitle: 'MapLibre · polilínea · provincias · precios',
  }));
  c.children.push(createNode('toast', { state: 'toast' }));
  c.children.push(createNode('badge', { text: 'MAPLIBRE' }));

  c.children.push(createNode('map', {
    latState: 'mapLat',
    lngState: 'mapLng',
    routeState: 'routeCoords',
    markersState: 'mapMarkers',
    height: 260,
    zoom: 9,
    label: 'Ruta seleccionada',
    routeColor: '#f4b400',
    routeWidth: 5,
  }));

  c.children.push(title('Elige ruta', 16));
  const routesBtns = row(8);
  routesBtns.children.push(btn('Baracoa', {
    setState: 'routeCoords', setValue: JSON.stringify(ROUTE_BARACOA),
  }));
  routesBtns.children.push(btn('Santiago', {
    setState: 'routeCoords', setValue: JSON.stringify(ROUTE_SANTIAGO),
  }));
  routesBtns.children.push(btn('Moa', {
    setState: 'routeCoords', setValue: JSON.stringify(ROUTE_MOA),
  }));
  c.children.push(routesBtns);
  const metaBtns = row(8);
  metaBtns.children.push(btn('Meta Baracoa', { setState: 'distKm', setValue: 152 }));
  metaBtns.children.push(btn('Meta Santiago', { setState: 'distKm', setValue: 78 }));
  metaBtns.children.push(btn('Meta Moa', { setState: 'distKm', setValue: 110 }));
  c.children.push(metaBtns);
  c.children.push(muted('Baracoa / Santiago / Moa recargan la polilínea en el mapa MapLibre.'));

  c.children.push(createNode('list', {
    state: 'rutas',
    itemTitle: 'name',
    itemSubtitle: 'km',
    itemMeta: 'priceBus',
    selectState: 'rutaSel',
  }));

  const det = createNode('card', { pad: 14, gap: 10 });
  det.children.push(title('Detalle', 15));
  const times = row(8);
  times.children.push(metric('Distancia', '152', 'distKm', 'km'));
  times.children.push(metric('A pie', '35 h', 'tWalk', ''));
  times.children.push(metric('En carro', '3.0 h', 'tCar', ''));
  det.children.push(times);
  det.children.push(muted('Tipo de pasaje'));
  const tickets = row(8);
  tickets.children.push(btn('Bus', { setState: 'ticketType', setValue: 'Bus' }));
  tickets.children.push(btn('Colectivo', { setState: 'ticketType', setValue: 'Colectivo' }));
  tickets.children.push(btn('Taxi', { setState: 'ticketType', setValue: 'Taxi' }));
  det.children.push(tickets);
  det.children.push(metric('Tipo', 'Bus', 'ticketType', ''));
  det.children.push(metric('Precio CUP', '85', 'precio', ''));
  const pe = row(8);
  pe.children.push(btn('−10', { setState: 'precio', setOp: 'decf', setValue: '10' }));
  pe.children.push(btn('+10', { setState: 'precio', setOp: 'incf', setValue: '10' }));
  det.children.push(pe);
  det.children.push(btn('Confirmar boleto', { setState: 'toast', setValue: 'Boleto reservado · viaje simulado' }));
  c.children.push(det);

  c.children.push(title('Origen / destino por dirección', 16));
  c.children.push(createNode('address-picker', {
    title: 'Catálogo Oriente',
    latState: 'mapLat',
    lngState: 'mapLng',
    addressState: 'address',
    markersState: 'mapMarkers',
  }));
  c.children.push(createNode('geocode', {
    title: 'Buscar cualquier dirección (Nominatim)',
    latState: 'mapLat',
    lngState: 'mapLng',
    queryState: 'geoQuery',
  }));
  c.children.push(metric('Dirección', '—', 'address', ''));

  c.children.push(createNode('bottom-tabs', {
    tabs: 'Mapa,Rutas,Boletos,Yo', icons: '◎,☰,▣,☺', state: 'mainTab',
  }));
  return [c];
}

function appLocalBizMap() {
  const negocios = [
    { id: 'n1', name: 'Mercado La Plaza', category: 'Alimentos', offers: 3, lat: 20.145, lng: -75.206 },
    { id: 'n2', name: 'Tech Point', category: 'Electrónica', offers: 2, lat: 20.148, lng: -75.210 },
    { id: 'n3', name: 'Café del Este', category: 'Café', offers: 1, lat: 20.142, lng: -75.200 },
  ];
  const productos = [
    { id: 'p1', name: 'Arroz 1kg', business: 'Mercado La Plaza', price: '120 CUP', description: 'Oferta del día' },
    { id: 'p2', name: 'Audífonos BT', business: 'Tech Point', price: '25 USD', description: 'Nueva' },
    { id: 'p3', name: 'Cortado', business: 'Café del Este', price: '50 CUP', description: 'Happy hour' },
  ];
  const markers = negocios.map((n) => ({ lat: n.lat, lng: n.lng, label: n.name }));
  const c = col(12, 12);
  c.children.push(st('negocios', negocios));
  c.children.push(st('productos', productos));
  c.children.push(st('mapMarkers', markers));
  c.children.push(st('mapLat', 20.145));
  c.children.push(st('mapLng', -75.206));
  c.children.push(st('routeCoords', []));
  c.children.push(st('toast', 'Bienvenido a tu barrio'));
  c.children.push(st('notifCount', 1));

  c.children.push(createNode('toast', { state: 'toast' }));
  c.children.push(createNode('hero', { title: 'Barrio Vivo', subtitle: 'Marcadores MapLibre · ofertas' }));
  c.children.push(metric('Avisos', '1', 'notifCount', ''));
  c.children.push(createNode('map', {
    latState: 'mapLat', lngState: 'mapLng', markersState: 'mapMarkers',
    height: 240, zoom: 14, label: 'Negocios cercanos',
  }));
  c.children.push(createNode('address-picker', {
    title: 'Ir a zona', latState: 'mapLat', lngState: 'mapLng', markersState: 'mapMarkers',
  }));
  c.children.push(createNode('list', {
    state: 'negocios', itemTitle: 'name', itemSubtitle: 'category', itemMeta: 'offers', selectState: 'neg',
  }));
  c.children.push(createNode('list', {
    state: 'productos', itemTitle: 'name', itemSubtitle: 'business', itemMeta: 'price', selectState: 'prod',
  }));
  const a = row(8);
  a.children.push(btn('Nueva oferta', { setState: 'toast', setValue: 'Nueva oferta en Mercado La Plaza' }));
  a.children.push(btn('+1 aviso', { setState: 'notifCount', setOp: 'incf', setValue: '1' }));
  c.children.push(a);
  c.children.push(createNode('bottom-tabs', { tabs: 'Mapa,Ofertas,Yo', icons: '◎,★,☺', state: 't' }));
  return [c];
}

function appModernShell() {
  const c = col(12, 12);
  c.children.push(st('drawerOpen', false));
  c.children.push(st('kpi', 1280));
  c.children.push(st('series', [
    { label: 'Lun', value: 40 }, { label: 'Mar', value: 65 }, { label: 'Mié', value: 52 },
    { label: 'Jue', value: 80 }, { label: 'Vie', value: 95 },
  ]));
  c.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  const dr = createNode('drawer', { title: 'Nova', subtitle: 'Menú opaco', state: 'drawerOpen' });
  ['Inicio', 'Analítica', 'Catálogo', 'Ajustes'].forEach((t) => {
    dr.children.push(btn(t, { setState: 'drawerOpen', setValue: false }));
  });
  c.children.push(dr);
  c.children.push(createNode('hero', { title: 'Nova Commerce', subtitle: 'Drawer sólido · charts · tabs' }));
  c.children.push(metric('Ventas', '1280', 'kpi', 'CUP'));
  c.children.push(createNode('chart-bar', { state: 'series', title: 'Semana' }));
  c.children.push(createNode('chart-line', { state: 'series', title: 'Tendencia' }));
  const r = row(8);
  r.children.push(btn('+ venta', { setState: 'kpi', setOp: 'incf', setValue: '50' }));
  r.children.push(btn('Menú', { setState: 'drawerOpen', setValue: true }));
  c.children.push(r);
  c.children.push(createNode('bottom-tabs', {
    tabs: 'Inicio,Buscar,Carrito,Perfil', icons: '⌂,⌕,▣,☺', state: 'mainTab',
  }));
  return [c];
}

function appShopMarketing() {
  const products = [
    { id: '1', name: 'Zapatillas Pulse', description: 'Edición limitada', price: '45 USD' },
    { id: '2', name: 'Reloj Chronos', description: 'Smart + GPS', price: '89 USD' },
    { id: '3', name: 'Auriculares Air', description: 'Noise cancel', price: '32 USD' },
  ];
  const c = col(12, 14);
  c.children.push(st('catalog', products));
  c.children.push(st('cartCount', 0));
  c.children.push(st('toast', ''));
  c.children.push(st('series', [
    { label: 'S1', value: 20 }, { label: 'S2', value: 45 }, { label: 'S3', value: 70 }, { label: 'S4', value: 110 },
  ]));
  c.children.push(createNode('hero', { title: 'PULSE STORE', subtitle: 'Marketing · carrito · charts' }));
  c.children.push(createNode('badge', { text: 'ENVÍO 24H' }));
  c.children.push(createNode('toast', { state: 'toast' }));
  c.children.push(metric('Carrito', '0', 'cartCount', ''));
  c.children.push(createNode('list', {
    state: 'catalog', itemTitle: 'name', itemSubtitle: 'description', itemMeta: 'price', selectState: 'sel',
  }));
  const buy = row(8);
  buy.children.push(btn('Agregar al carrito', { setState: 'cartCount', setOp: 'incf', setValue: '1' }));
  buy.children.push(btn('Checkout', { setState: 'toast', setValue: 'Pedido simulado OK' }));
  c.children.push(buy);
  c.children.push(createNode('chart-bar', { state: 'series', title: 'Conversión' }));
  c.children.push(createNode('bottom-tabs', {
    tabs: 'Shop,Ofertas,Carrito,Cuenta', icons: '▣,★,🛒,☺', state: 'shopTab',
  }));
  return [c];
}

function appRouteLab() {
  const c = col(12, 12);
  c.children.push(st('routeCoords', ROUTE_SANTIAGO));
  c.children.push(st('mapMarkers', [
    { lat: 20.1453, lng: -75.2062, label: 'Guantánamo' },
    { lat: 20.0217, lng: -75.8267, label: 'Santiago' },
  ]));
  c.children.push(st('mapLat', 20.08));
  c.children.push(st('mapLng', -75.5));
  c.children.push(title('Laboratorio de rutas', 18));
  c.children.push(muted('Polilínea MapLibre + geocoder + address-picker'));
  c.children.push(createNode('map', {
    routeState: 'routeCoords', markersState: 'mapMarkers',
    latState: 'mapLat', lngState: 'mapLng', height: 280, zoom: 9, label: 'GTM → SCU',
  }));
  c.children.push(createNode('geocode', { title: 'Geocodificar texto libre' }));
  c.children.push(createNode('address-picker', { title: 'Catálogo Cuba Oriente' }));
  return [c];
}

export const EXAMPLES = [
  { id: 'travel-agency', name: 'Agencia de viajes', blurb: 'Polilínea MapLibre · pasajes · direcciones', tags: ['mapa', 'completo'], build: appTravelAgency },
  { id: 'route-lab', name: 'Lab de rutas', blurb: 'Solo mapa + geocode + polyline', tags: ['mapa', 'dev'], build: appRouteLab },
  { id: 'local-biz', name: 'Barrio Vivo', blurb: 'Marcadores de negocios · ofertas · avisos', tags: ['mapa', 'local'], build: appLocalBizMap },
  { id: 'modern-shell', name: 'Nova Shell', blurb: 'Drawer opaco · tabs · charts', tags: ['ui'], build: appModernShell },
  { id: 'shop-mkt', name: 'Pulse Store', blurb: 'Catálogo · carrito · marketing', tags: ['ventas'], build: appShopMarketing },
];
