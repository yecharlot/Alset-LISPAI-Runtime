/**
 * Ejemplos potentes: viaje tipo Uber (OSRM), barrio, tienda, AlsetOS, Mind.
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

/** Viaje estilo Uber: direcciones + OSRM real + mapa MapLibre + tarifa + conductor */
function appRideShare() {
  const c = col(12, 12);
  c.children.push(st('originLat', 20.1453));
  c.children.push(st('originLng', -75.2062));
  c.children.push(st('destLat', 20.0217));
  c.children.push(st('destLng', -75.8267));
  c.children.push(st('mapLat', 20.08));
  c.children.push(st('mapLng', -75.5));
  c.children.push(st('routeCoords', []));
  c.children.push(st('mapMarkers', [
    { lat: 20.1453, lng: -75.2062, label: 'Origen' },
    { lat: 20.0217, lng: -75.8267, label: 'Destino' },
  ]));
  c.children.push(st('tripKm', 0));
  c.children.push(st('tripMin', 0));
  c.children.push(st('tripFare', 0));
  c.children.push(st('tripStatus', 'Elige origen y destino'));
  c.children.push(st('driver', null));
  c.children.push(st('toast', ''));

  c.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  const dr = createNode('drawer', { title: 'Alset Ride', subtitle: 'Tu viaje', state: 'drawerOpen' });
  dr.children.push(btn('Viajar', { setState: 'drawerOpen', setValue: false }));
  dr.children.push(btn('Historial', { setState: 'drawerOpen', setValue: false }));
  dr.children.push(btn('Ayuda Mind', { setState: 'drawerOpen', setValue: false }));
  c.children.push(dr);

  c.children.push(createNode('hero', {
    title: 'Alset Ride',
    subtitle: 'Ruta real OSRM · tarifa · conductor · mapa MapLibre',
  }));
  c.children.push(createNode('toast', { state: 'toast' }));
  c.children.push(createNode('badge', { text: 'EN VIVO' }));

  c.children.push(title('1. Origen', 15));
  c.children.push(createNode('address-picker', {
    title: 'Desde',
    latState: 'originLat',
    lngState: 'originLng',
    addressState: 'originAddr',
    markersState: 'mapMarkers',
  }));
  c.children.push(title('2. Destino', 15));
  c.children.push(createNode('address-picker', {
    title: 'Hasta',
    latState: 'destLat',
    lngState: 'destLng',
    addressState: 'destAddr',
    markersState: 'mapMarkers',
  }));
  c.children.push(createNode('geocode', {
    title: 'O escribe una dirección (Nominatim)',
    latState: 'destLat',
    lngState: 'destLng',
    queryState: 'geoQuery',
  }));

  c.children.push(createNode('route-planner', {
    title: '3. Calcular viaje',
    originLatState: 'originLat',
    originLngState: 'originLng',
    destLatState: 'destLat',
    destLngState: 'destLng',
    routeState: 'routeCoords',
    markersState: 'mapMarkers',
    distanceState: 'tripKm',
    durationState: 'tripMin',
    fareState: 'tripFare',
    statusState: 'tripStatus',
    latState: 'mapLat',
    lngState: 'mapLng',
    auto: false,
  }));

  c.children.push(createNode('map', {
    latState: 'mapLat',
    lngState: 'mapLng',
    routeState: 'routeCoords',
    markersState: 'mapMarkers',
    height: 280,
    zoom: 10,
    label: 'Ruta del viaje',
    routeColor: '#f4b400',
    routeWidth: 6,
  }));

  const k = row(10);
  k.children.push(metric('Km', '0', 'tripKm', ''));
  k.children.push(metric('Min', '0', 'tripMin', ''));
  k.children.push(metric('Tarifa', '0', 'tripFare', 'CUP'));
  c.children.push(k);
  c.children.push(metric('Estado', '—', 'tripStatus', ''));

  c.children.push(createNode('mind-panel', { title: 'Asistente del viaje', state: 'mindText' }));
  c.children.push(createNode('bottom-tabs', {
    tabs: 'Viaje,Mapa,Cuenta', icons: '◎,☰,☺', state: 'rideTab',
  }));
  return [c];
}

function appLocalBiz() {
  const negocios = [
    { id: 'n1', name: 'Mercado La Plaza', category: 'Alimentos', offers: 3, lat: 20.145, lng: -75.206 },
    { id: 'n2', name: 'Tech Point', category: 'Electrónica', offers: 2, lat: 20.148, lng: -75.210 },
    { id: 'n3', name: 'Café del Este', category: 'Café', offers: 1, lat: 20.142, lng: -75.200 },
  ];
  const productos = [
    { id: 'p1', name: 'Arroz 1kg', business: 'Mercado La Plaza', price: '120 CUP', description: 'Oferta' },
    { id: 'p2', name: 'Audífonos', business: 'Tech Point', price: '25 USD', description: 'Nuevo' },
  ];
  const c = col(12, 12);
  c.children.push(st('negocios', negocios));
  c.children.push(st('productos', productos));
  c.children.push(st('mapMarkers', negocios.map((n) => ({ lat: n.lat, lng: n.lng, label: n.name }))));
  c.children.push(st('mapLat', 20.145));
  c.children.push(st('mapLng', -75.206));
  c.children.push(st('toast', 'Bienvenido'));
  c.children.push(st('notifCount', 1));
  c.children.push(createNode('toast', { state: 'toast' }));
  c.children.push(createNode('hero', { title: 'Barrio Vivo', subtitle: 'Ofertas cerca de ti' }));
  c.children.push(metric('Avisos', '1', 'notifCount', ''));
  c.children.push(createNode('map', {
    markersState: 'mapMarkers', latState: 'mapLat', lngState: 'mapLng', height: 240, zoom: 14,
  }));
  c.children.push(createNode('list', {
    state: 'negocios', itemTitle: 'name', itemSubtitle: 'category', itemMeta: 'offers',
  }));
  c.children.push(createNode('list', {
    state: 'productos', itemTitle: 'name', itemSubtitle: 'business', itemMeta: 'price',
  }));
  const a = row(8);
  a.children.push(btn('Nueva oferta', { setState: 'toast', setValue: 'Nueva oferta publicada' }));
  a.children.push(btn('+ aviso', { setState: 'notifCount', setOp: 'incf', setValue: '1' }));
  c.children.push(a);
  return [c];
}

function appShop() {
  const products = [
    { id: '1', name: 'Zapatillas Pulse', description: 'Edición limitada', price: '45 USD' },
    { id: '2', name: 'Reloj Chronos', description: 'Smart', price: '89 USD' },
    { id: '3', name: 'Auriculares Air', description: 'ANC', price: '32 USD' },
  ];
  const c = col(12, 14);
  c.children.push(st('catalog', products));
  c.children.push(st('cartCount', 0));
  c.children.push(st('toast', ''));
  c.children.push(st('series', [
    { label: 'S1', value: 20 }, { label: 'S2', value: 55 }, { label: 'S3', value: 90 },
  ]));
  c.children.push(createNode('hero', { title: 'PULSE STORE', subtitle: 'Compra en un toque' }));
  c.children.push(createNode('toast', { state: 'toast' }));
  c.children.push(metric('Carrito', '0', 'cartCount', ''));
  c.children.push(createNode('list', {
    state: 'catalog', itemTitle: 'name', itemSubtitle: 'description', itemMeta: 'price', selectState: 'sel',
  }));
  const r = row(8);
  r.children.push(btn('Agregar al carrito', { setState: 'cartCount', setOp: 'incf', setValue: '1' }));
  r.children.push(btn('Pagar', { setState: 'toast', setValue: 'Pago simulado OK' }));
  c.children.push(r);
  c.children.push(createNode('chart-bar', { state: 'series', title: 'Ventas' }));
  c.children.push(createNode('bottom-tabs', {
    tabs: 'Shop,Carrito,Cuenta', icons: '▣,🛒,☺', state: 'tab',
  }));
  return [c];
}

function appAlsetOS() {
  const c = col(16, 14);
  c.children.push(st('toast', ''));
  c.children.push(createNode('splash', {
    title: 'AlsetOS', subtitle: 'Cargando entorno…', duration: 1000, autoHide: true, spinner: true,
    from: '#0a0a0a', to: '#1a1400',
  }));
  c.children.push(createNode('toast', { state: 'toast' }));
  c.children.push(title('AlsetOS', 24));
  c.children.push(muted('Las apps de Studio se abren aquí como /w/nombre.app.ans'));
  const grid = row(10);
  [
    ['Alset Ride', 'ride-share'],
    ['Barrio', 'local-biz'],
    ['Tienda', 'shop-mkt'],
    ['Mind', 'mind-demo'],
  ].forEach(([name, id]) => {
    const card = createNode('card', { pad: 12, gap: 8 });
    card.children.push(createNode('text', { text: name, weight: 'bold', size: 15 }));
    card.children.push(btn('Abrir', {
      setState: 'toast', setValue: 'Abriendo ' + id + ' (compatible Studio)',
    }));
    grid.children.push(card);
  });
  c.children.push(grid);
  c.children.push(createNode('mind-panel', { title: 'Mind del sistema' }));
  return [c];
}

function appMindEmbed() {
  const c = col(14, 12);
  c.children.push(st('riskA', 0.2));
  c.children.push(st('riskB', 0.5));
  c.children.push(title('Mind + Zyrion en la app', 18));
  c.children.push(muted('Agente opcional y decisión ternaria embebidos'));
  c.children.push(createNode('mind-panel', { title: 'Agente Mind', state: 'mindText' }));
  c.children.push(createNode('zyrion-panel', { title: 'Filtro Zyrion' }));
  c.children.push(createNode('zyrion-filter', { state: 'filtro' }));
  return [c];
}

export const EXAMPLES = [
  { id: 'ride-share', name: 'Alset Ride (tipo Uber)', blurb: 'OSRM real · mapa · tarifa · conductor · Mind', tags: ['mapa', 'completo', 'flagship'], build: appRideShare },
  { id: 'local-biz', name: 'Barrio Vivo', blurb: 'Negocios en mapa · ofertas · avisos', tags: ['mapa', 'local'], build: appLocalBiz },
  { id: 'shop-mkt', name: 'Pulse Store', blurb: 'Catálogo · carrito · charts', tags: ['ventas'], build: appShop },
  { id: 'alsetos', name: 'AlsetOS', blurb: 'Launcher de apps Studio / ANS', tags: ['os'], build: appAlsetOS },
  { id: 'mind-demo', name: 'Mind + Zyrion', blurb: 'Agente y lógica ternaria embebidos', tags: ['mind', 'ia'], build: appMindEmbed },
];
