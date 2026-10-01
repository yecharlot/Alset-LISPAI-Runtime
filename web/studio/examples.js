/**
 * Catálogo creativo de ejemplos listos: tiendas, billeteras, landings,
 * blogs, CV, pedidos, facturación, banca, cambio, contratos, etc.
 * Cargar · Correr preview · Desplegar PWA
 */
import { createNode } from './components.js';

/* ── helpers ─────────────────────────────────────────── */
function col(pad = 12, gap = 12) {
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
function btn(text, action = 'ok', extra = {}) {
  return createNode('button', { text, action, ...extra });
}
function metric(t, v, state, hint) {
  return createNode('metric', { title: t, value: v, state, hint });
}
function card(...kids) {
  const c = createNode('card', { pad: 14, gap: 8 });
  kids.forEach((k) => c.children.push(k));
  return c;
}

/* ── 1. Marketing / landings ─────────────────────────── */
function landing() {
  const c = col(16, 16);
  c.children.push(createNode('hero', { title: 'Alset', subtitle: 'Interfaces de próxima generación · nativas alsetState' }));
  const r = row();
  r.children.push(btn('Comenzar', 'start', { state: 'cta', anim: 'fade' }));
  r.children.push(btn('Ver docs', 'docs'));
  c.children.push(r);
  c.children.push(metric('Señales', '0', 'cta', 'clicks'));
  return [c];
}

function landingSaaS() {
  const c = col(16, 14);
  c.children.push(createNode('badge', { text: 'NUEVO · BETA' }));
  c.children.push(createNode('hero', { title: 'Opera en el borde', subtitle: 'SaaS offline-first · identidad CID · sin vendor lock-in' }));
  const r = row(12);
  r.children.push(btn('Probar gratis', 'trial', { state: 'trials' }));
  r.children.push(btn('Ver precios', 'pricing'));
  c.children.push(r);
  const kpis = row(12);
  kpis.children.push(metric('Equipos', '240+', 'teams', 'activos'));
  kpis.children.push(metric('Uptime', '99.9%', 'up', 'último mes'));
  kpis.children.push(metric('Latencia', '38ms', 'lat', 'p95 borde'));
  c.children.push(kpis);
  c.children.push(card(
    title('Por qué equipos nos eligen', 15),
    muted('Un runtime, tres dispositivos, PWA instalable. Sin reescribir para cada pantalla.')
  ));
  return [c];
}

function landingProduct() {
  const c = col(14, 12);
  c.children.push(createNode('nav', { tabs: 'Producto,Precios,Historias,Blog', state: 'lpTab' }));
  c.children.push(createNode('hero', { title: 'El catálogo que vende solo', subtitle: 'Fotos, precios y pedidos en un solo latido' }));
  const r = row();
  r.children.push(btn('Ver demo', 'demo'));
  r.children.push(btn('Hablar con ventas', 'sales'));
  c.children.push(r);
  c.children.push(muted('Confían en nosotros comercios de 12 provincias · sin comisión oculta'));
  return [c];
}

/* ── 2. Tienda / e-commerce ──────────────────────────── */
function storefront() {
  const c = col(12, 12);
  const top = row(10);
  top.children.push(title('Mercado Norte', 18));
  top.children.push(createNode('badge', { text: 'ENVÍO HOY' }));
  c.children.push(top);
  c.children.push(createNode('form-search', { state: 'q', placeholder: 'Buscar producto…' }));
  c.children.push(createNode('nav', { tabs: 'Todo,Alimentos,Hogar,Tech', state: 'cat' }));
  const grid = row(12);
  grid.children.push(card(title('Café 250g', 14), muted('$8.50 · stock 24'), btn('Añadir', 'add-cafe', { state: 'cart' })));
  grid.children.push(card(title('Arroz 1kg', 14), muted('$2.10 · stock 80'), btn('Añadir', 'add-arroz', { state: 'cart' })));
  grid.children.push(card(title('USB 32GB', 14), muted('$6.00 · stock 12'), btn('Añadir', 'add-usb', { state: 'cart' })));
  c.children.push(grid);
  c.children.push(metric('Carrito', '0', 'cart', 'ítems'));
  c.children.push(btn('Ir al checkout', 'checkout'));
  return [c];
}

function ecommerceCheckout() {
  const c = col(14, 12);
  c.children.push(title('Checkout', 20));
  c.children.push(muted('Revisa tu pedido antes de confirmar'));
  c.children.push(card(
    title('Resumen', 14),
    muted('3 productos · envío estándar'),
    metric('Total', '$24.90', 'total', 'USD')
  ));
  c.children.push(createNode('form-contact', { title: 'Datos de entrega' }));
  c.children.push(createNode('select', { state: 'pay', options: 'Efectivo,Transferencia,Zelle,Tarjeta' }));
  const r = row();
  r.children.push(btn('Confirmar pedido', 'confirm'));
  r.children.push(btn('Seguir comprando', 'back'));
  c.children.push(r);
  return [c];
}

function exchangeShop() {
  const c = col(12, 12);
  c.children.push(title('Casa de cambio · Vista', 18));
  c.children.push(muted('Tasas orientativas · confirma antes de operar'));
  const rates = row(10);
  rates.children.push(metric('USD→CUP', '320', 'usd', 'compra'));
  rates.children.push(metric('EUR→CUP', '345', 'eur', 'compra'));
  rates.children.push(metric('MLC', '1.00', 'mlc', 'paridad'));
  c.children.push(rates);
  c.children.push(createNode('select', { state: 'pair', options: 'USD/CUP,EUR/CUP,USD/EUR' }));
  c.children.push(createNode('input', { placeholder: 'Monto a cambiar', state: 'amount', type: 'number' }));
  c.children.push(btn('Calcular', 'calc', { state: 'quotes' }));
  c.children.push(metric('Recibes', '—', 'quotes', 'estimado'));
  c.children.push(card(muted('Horario 9:00–17:00 · ID requerido en mostrador')));
  return [c];
}

/* ── 3. Billetera / fintech ──────────────────────────── */
function wallet() {
  const root = col(0, 0);
  root.children.push(createNode('splash', { title: 'Alset Pay', subtitle: 'Tu saldo, tu ritmo', duration: 1200, animated: true }));
  const top = row(10);
  top.props.pad = 12;
  top.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  top.children.push(title('Billetera', 18));
  root.children.push(top);
  const drawer = createNode('drawer', { title: 'Cuenta', state: 'drawerOpen', side: 'left', open: false });
  drawer.children.push(btn('Inicio', 'home'));
  drawer.children.push(btn('Enviar', 'send'));
  drawer.children.push(btn('Historial', 'hist'));
  drawer.children.push(btn('KYC', 'kyc'));
  root.children.push(drawer);
  const tabs = createNode('tabs-shell', { tabs: 'Saldo,Enviar,Actividad', state: 'wTab' });
  const a = col(14, 12);
  a.children.push(metric('Disponible', '$128.40', 'bal', 'USD equivalente'));
  const actions = row();
  actions.children.push(btn('Recargar', 'topup'), btn('Retirar', 'withdraw'));
  a.children.push(actions);
  a.children.push(card(muted('Último movimiento: +$20 · hace 2 h')));
  const b = col(14, 10);
  b.children.push(createNode('input', { placeholder: 'Destino (tel o alias)', state: 'to' }));
  b.children.push(createNode('input', { placeholder: 'Monto', state: 'amt', type: 'number' }));
  b.children.push(btn('Enviar ahora', 'send-now'));
  const d = col(14, 10);
  d.children.push(title('Actividad', 15));
  d.children.push(createNode('list', { state: 'tx', empty: 'Sin movimientos aún' }));
  tabs.children.push(a, b, d);
  root.children.push(tabs);
  return [root];
}

function bankingApp() {
  const c = col(12, 12);
  c.children.push(createNode('nav', { tabs: 'Cuentas,Transferir,Tarjetas,Más', state: 'bankTab' }));
  c.children.push(title('Hola, Esteban', 18));
  const accounts = row(10);
  accounts.children.push(metric('Corriente', '$1,240.00', 'chk', 'CUP'));
  accounts.children.push(metric('Ahorro', '$8,500.00', 'sav', 'CUP'));
  c.children.push(accounts);
  c.children.push(card(
    title('Transferencia rápida', 14),
    createNode('input', { placeholder: 'Cuenta destino', state: 'dest' }),
    createNode('input', { placeholder: 'Monto', state: 'xfer', type: 'number' }),
    btn('Transferir', 'xfer')
  ));
  c.children.push(muted('Operaciones sujetas a verificación · demo Studio'));
  return [c];
}

function remittance() {
  const c = col(14, 12);
  c.children.push(createNode('hero', { title: 'Remesas seguras', subtitle: 'De la diáspora al bolsillo · rastreo por CID' }));
  c.children.push(createNode('select', { state: 'corridor', options: 'USA→Cuba,España→Cuba,México→Cuba' }));
  c.children.push(createNode('input', { placeholder: 'Monto origen (USD)', state: 'remAmt', type: 'number' }));
  c.children.push(metric('Llega estimado', '—', 'arrive', 'CUP tras tasa'));
  c.children.push(createNode('form-contact', { title: 'Beneficiario' }));
  c.children.push(btn('Iniciar envío', 'remit'));
  c.children.push(card(muted('Estado: cotización → pago → liberación · sin datos en claro en el canal')));
  return [c];
}

/* ── 4. Pedidos / delivery ───────────────────────────── */
function ordersApp() {
  const root = col(0, 0);
  const top = row(8);
  top.props.pad = 10;
  top.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  top.children.push(title('Pedidos+', 18));
  top.children.push(createNode('badge', { text: 'EN VIVO' }));
  root.children.push(top);
  const dr = createNode('drawer', {  title: 'Operación', state: 'drawerOpen', open: false });
  dr.children.push(btn('Nuevos', 'new'));
  dr.children.push(btn('En camino', 'ship'));
  dr.children.push(btn('Cerrados', 'done'));
  root.children.push(dr);
  const tabs = createNode('tabs-shell', { tabs: 'Cola,Detalle,Repartidor', state: 'ordTab' });
  const q = col(12, 10);
  q.children.push(metric('En cola', '5', 'queue', 'pedidos'));
  q.children.push(card(title('#1042 · Pizza familiar', 14), muted('Calle 12 · hace 4 min'), btn('Aceptar', 'accept')));
  q.children.push(card(title('#1041 · Farmacia', 14), muted('Reparto · 12 min'), btn('Ver ruta', 'route')));
  const d = col(12, 10);
  d.children.push(title('Pedido #1042', 16));
  d.children.push(muted('Cliente: Ana · Tel: +53 …'));
  d.children.push(metric('Total', '$18.00', 'ototal', 'a cobrar'));
  d.children.push(btn('Marcar entregado', 'delivered'));
  const r = col(12, 10);
  r.children.push(title('Repartidor', 16));
  r.children.push(muted('Luis · moto · zona este'));
  r.children.push(metric('ETA', '11 min', 'eta', 'tráfico medio'));
  tabs.children.push(q, d, r);
  root.children.push(tabs);
  return [root];
}

function restaurantMenu() {
  const c = col(12, 12);
  c.children.push(createNode('hero', { title: 'La Terraza', subtitle: 'Menú del día · pedido al local o delivery' }));
  c.children.push(createNode('nav', { tabs: 'Entrantes,Principales,Bebidas', state: 'menuTab' }));
  c.children.push(card(title('Sopa del día', 14), muted('$3.50'), btn('Pedir', 'soup', { state: 'order' })));
  c.children.push(card(title('Ropa vieja', 14), muted('$7.00'), btn('Pedir', 'ropa', { state: 'order' })));
  c.children.push(card(title('Jugo natural', 14), muted('$2.00'), btn('Pedir', 'jugo', { state: 'order' })));
  c.children.push(metric('Tu pedido', '0', 'order', 'platos'));
  c.children.push(btn('Enviar a cocina', 'kitchen'));
  return [c];
}

/* ── 5. Facturación / contratos ──────────────────────── */
function invoicing() {
  const c = col(14, 12);
  c.children.push(title('Facturación', 20));
  c.children.push(createNode('nav', { tabs: 'Nueva,Borradores,Pagadas', state: 'invTab' }));
  const invActions = row();
  invActions.children.push(btn('PDF', 'pdf'), btn('Marcar pagada', 'paid'));
  c.children.push(card(
    title('Factura INV-2026-014', 14),
    muted('Cliente: TCP Ejemplo · 2 ítems'),
    metric('Importe', '$156.00', 'inv', 'USD'),
    invActions
  ));
  c.children.push(createNode('form-contact', { title: 'Datos del cliente' }));
  c.children.push(createNode('input', { placeholder: 'Concepto', state: 'concept' }));
  c.children.push(createNode('input', { placeholder: 'Monto', state: 'amount', type: 'number' }));
  c.children.push(btn('Emitir factura', 'issue'));
  return [c];
}

function smartContractLite() {
  const c = col(14, 12);
  c.children.push(createNode('badge', { text: 'ESCROW · DEMO' }));
  c.children.push(createNode('hero', { title: 'Contrato de hito', subtitle: 'Fondos retenidos hasta cumplimiento · lógica ternaria' }));
  c.children.push(card(
    title('Partes', 14),
    muted('Pagador ↔ Proveedor ↔ Árbitro (opcional)')
  ));
  c.children.push(createNode('input', { placeholder: 'Monto en escrow', state: 'escrow', type: 'number' }));
  c.children.push(createNode('select', { state: 'phase', options: 'Borrador,Firmado,En curso,Liberado,Disputa' }));
  c.children.push(metric('Estado', 'Borrador', 'phase', 'máquina de estados'));
  const r = row();
  r.children.push(btn('Firmar', 'sign'));
  r.children.push(btn('Liberar fondos', 'release'));
  r.children.push(btn('Abrir disputa', 'dispute'));
  c.children.push(r);
  c.children.push(muted('No es un token-chain: es flujo de estados + CID de evidencia'));
  return [c];
}

function quotesApp() {
  const c = col(12, 12);
  c.children.push(title('Cotizaciones', 18));
  c.children.push(muted('Para TCP / servicios profesionales'));
  c.children.push(card(title('QT-88 · Red + hosting', 14), muted('Válida 7 días'), metric('Total', '$420', 'qt', 'USD'), btn('Enviar al cliente', 'send-qt')));
  c.children.push(createNode('form-contact', { title: 'Cliente' }));
  c.children.push(createNode('textarea', { placeholder: 'Alcance del trabajo…', state: 'scope', rows: 3 }));
  c.children.push(btn('Nueva cotización', 'new-qt'));
  return [c];
}

/* ── 6. Contenido / CV / blog ────────────────────────── */
function blogHome() {
  const c = col(14, 14);
  c.children.push(createNode('nav', { tabs: 'Inicio,Tech,Sociedad,Archivo', state: 'blogTab' }));
  c.children.push(createNode('hero', { title: 'Bitácora del nodo', subtitle: 'Notas sobre borde, CID y soberanía digital' }));
  c.children.push(card(title('Por qué offline-first importa', 15), muted('Hace 2 días · 6 min lectura'), btn('Leer', 'post1')));
  c.children.push(card(title('Gestos nativos sin SDK nativo', 15), muted('Hace 5 días · 4 min'), btn('Leer', 'post2')));
  c.children.push(createNode('form-search', { state: 'blogQ', placeholder: 'Buscar en el blog…' }));
  return [c];
}

function curriculum() {
  const c = col(16, 12);
  c.children.push(title('Yulei Esteban Charlot Poll', 22));
  c.children.push(muted('Desarrollador · PrismaTec · Guantánamo'));
  c.children.push(createNode('badge', { text: 'DISPONIBLE' }));
  c.children.push(card(
    title('Resumen', 14),
    muted('Construyo runtimes, PWA y redes de agentes. Enfoque: soberanía tecnológica y productos que funcionan sin humo.')
  ));
  c.children.push(card(
    title('Experiencia', 14),
    muted('· Alset Studio / LispAI Runtime\n· Sales Hub · ValesPlus · Streaming\n· Infraestructura de borde')
  ));
  c.children.push(card(
    title('Habilidades', 14),
    muted('Go · JS · WebRTC · Cloudflare · UX móvil · contabilidad aplicada')
  ));
  const r = row();
  r.children.push(btn('Contactar', 'contact'));
  r.children.push(btn('Descargar CV', 'pdf'));
  c.children.push(r);
  return [c];
}

function portfolio() {
  const c = col(14, 12);
  c.children.push(createNode('hero', { title: 'Studio portfolio', subtitle: 'Piezas seleccionadas · 2024–2026' }));
  c.children.push(createNode('nav', { tabs: 'Todo,Producto,Infra,Diseño', state: 'portTab' }));
  c.children.push(card(title('ValesPlus', 15), muted('PWA de vales para gestores · offline'), btn('Caso', 'vp')));
  c.children.push(card(title('Streaming Hub', 15), muted('SFU + mesh · eventos en vivo'), btn('Caso', 'sh')));
  c.children.push(card(title('Alset Mind', 15), muted('Inteligencia ternaria · no LLM'), btn('Caso', 'mind')));
  return [c];
}

/* ── 7. Productividad / CRM / SaaS ───────────────────── */
function saasDashboard() {
  const c = col(12, 14);
  c.children.push(createNode('nav', { tabs: 'Overview,Revenue,Users', state: 'tab' }));
  const r = row(12);
  r.children.push(metric('MRR', '$12.4k', 'mrr', 'observado'));
  r.children.push(metric('Active', '1.2k', 'active', 'usuarios'));
  r.children.push(metric('NPS', '62', 'nps', 'score'));
  c.children.push(r);
  c.children.push(createNode('api', { url: '/v1/health', state: 'apiData', auto: true }));
  c.children.push(card(title('Estado del runtime', 14), createNode('list', { state: 'apiData', empty: 'Sin telemetría' })));
  return [c];
}

function authFlow() {
  const c = col(16, 12);
  c.children.push(title('Bienvenido', 22));
  c.children.push(createNode('form-login', { title: 'Iniciar sesión' }));
  c.children.push(muted('¿Nuevo? Regístrate abajo'));
  c.children.push(createNode('form-register', { title: 'Crear cuenta' }));
  return [c];
}

function contactCrm() {
  const c = col(12, 12);
  c.children.push(title('CRM ligero', 18));
  c.children.push(createNode('form-contact', { title: 'Nuevo lead' }));
  c.children.push(createNode('api', { url: '/v1/data', state: 'rows', auto: true }));
  c.children.push(createNode('table', { state: 'rows', columns: 'id,email,msg' }));
  return [c];
}

function bookingApp() {
  const c = col(14, 12);
  c.children.push(createNode('hero', { title: 'Reservas', subtitle: 'Agenda turnos · recordatorios · sin WhatsApp eterno' }));
  c.children.push(createNode('select', { state: 'service', options: 'Consulta,Corte,Clase,Visita técnica' }));
  c.children.push(createNode('input', { placeholder: 'Fecha (AAAA-MM-DD)', state: 'date' }));
  c.children.push(createNode('input', { placeholder: 'Hora', state: 'time' }));
  c.children.push(createNode('form-contact', { title: 'Tus datos' }));
  c.children.push(btn('Reservar', 'book'));
  c.children.push(metric('Cupos hoy', '6', 'slots', 'libres'));
  return [c];
}

function inventory() {
  const c = col(12, 12);
  c.children.push(title('Inventario', 18));
  c.children.push(createNode('form-search', { state: 'sku', placeholder: 'SKU o nombre…' }));
  c.children.push(card(title('SKU-100 · Tornillo M6', 14), metric('Stock', '1,240', 's1', 'unidades'), btn('Ajustar', 'adj1')));
  c.children.push(card(title('SKU-220 · Cable UTP', 14), metric('Stock', '38', 's2', 'rollos'), btn('Ajustar', 'adj2')));
  c.children.push(btn('Entrada de mercancía', 'in'));
  c.children.push(btn('Salida / venta', 'out'));
  return [c];
}

/* ── 8. Motion + mobile shell ────────────────────────── */
function motionShowcase() {
  const c = col(12, 12);
  c.children.push(title('Motion Alset', 18));
  const fade = createNode('anim-fade', { duration: 500 });
  fade.children.push(card(createNode('text', { text: 'Fade in', size: 15 })));
  const slide = createNode('anim-slide', { duration: 450 });
  slide.children.push(card(createNode('text', { text: 'Slide up', size: 15 })));
  const scale = createNode('anim-scale', { duration: 400 });
  scale.children.push(card(createNode('text', { text: 'Scale', size: 15 })));
  c.children.push(fade, slide, scale);
  c.children.push(btn('Pulse CTA', 'pulse', { state: 'pulses', anim: 'scale' }));
  c.children.push(metric('Pulses', '0', 'pulses'));
  return [c];
}

function mobileApp() {
  const root = col(0, 0);
  root.children.push(createNode('splash', { title: 'Alset', subtitle: 'Mobile · offline', duration: 1200, animated: true }));
  const top = row(10);
  top.props.pad = 10;
  top.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  top.children.push(title('Feed', 18));
  root.children.push(top);
  const drawer = createNode('drawer', {  title: 'Menú', state: 'drawerOpen', side: 'left', open: false });
  drawer.children.push(btn('Inicio', 'home'));
  drawer.children.push(btn('Buscar', 'search'));
  root.children.push(drawer);
  const tabs = createNode('tabs-shell', { tabs: 'Inicio,API,Yo', state: 'tab' });
  const a = col(12, 10);
  a.children.push(createNode('hero', { title: 'Gestos nativos', subtitle: 'Swipe abre el menú en el emulador' }));
  a.children.push(btn('Pulse', 'pulse', { state: 'pulses' }));
  a.children.push(metric('Pulses', '0', 'pulses'));
  const b = col(12, 8);
  b.children.push(createNode('api', { url: '/v1/health', state: 'apiData', auto: true }));
  b.children.push(createNode('list', { state: 'apiData' }));
  const d = col(12, 8);
  d.children.push(title('Offline', 16));
  d.children.push(createNode('persist', { key: 'alset.mobile', state: 'pulses' }));
  tabs.children.push(a, b, d);
  root.children.push(tabs);
  return [root];
}

function onboarding() {
  const c = col(16, 14);
  c.children.push(createNode('splash', { title: 'Bienvenido', subtitle: '3 pasos y listo', duration: 900, animated: true }));
  c.children.push(createNode('nav', { tabs: '1 Perfil,2 Negocio,3 Listo', state: 'onb' }));
  c.children.push(createNode('input', { placeholder: 'Tu nombre', state: 'name' }));
  c.children.push(createNode('input', { placeholder: 'Nombre del negocio', state: 'biz' }));
  c.children.push(createNode('select', { state: 'vertical', options: 'Tienda,Servicios,Delivery,Finanzas' }));
  c.children.push(btn('Continuar', 'next'));
  c.children.push(muted('Puedes cambiar esto después en Ajustes'));
  return [c];
}

function supportDesk() {
  const c = col(12, 12);
  c.children.push(title('Mesa de ayuda', 18));
  c.children.push(createNode('nav', { tabs: 'Abiertos,Pendientes,Cerrados', state: 'supTab' }));
  c.children.push(card(title('#T-201 · No carga el vale', 14), muted('Prioridad media · hace 1 h'), btn('Responder', 'reply')));
  c.children.push(card(title('#T-198 · Cambio de tasa', 14), muted('Prioridad alta · hace 3 h'), btn('Escalar', 'esc')));
  c.children.push(createNode('textarea', { placeholder: 'Respuesta al cliente…', state: 'reply', rows: 3 }));
  c.children.push(btn('Enviar respuesta', 'send-reply'));
  return [c];
}

function eventsApp() {
  const c = col(12, 12);
  c.children.push(createNode('hero', { title: 'Agenda cultural', subtitle: 'Conciertos · talleres · transmisiones' }));
  c.children.push(card(title('Jazz en la terraza', 15), muted('Vie 21:00 · 40 cupos'), metric('Restan', '12', 'seats', 'entradas'), btn('Reservar', 'ev1')));
  c.children.push(card(title('Taller de PWA', 15), muted('Sáb 10:00 · online'), btn('Inscribirme', 'ev2')));
  c.children.push(btn('Crear evento', 'new-ev'));
  return [c];
}

function healthcareLite() {
  const c = col(12, 12);
  c.children.push(title('Cita médica', 18));
  c.children.push(muted('Demo · no sustituye sistemas clínicos oficiales'));
  c.children.push(createNode('select', { state: 'spec', options: 'General,Pediatría,Dental,Lab' }));
  c.children.push(createNode('input', { placeholder: 'Fecha preferida', state: 'cdate' }));
  c.children.push(createNode('form-contact', { title: 'Paciente' }));
  c.children.push(btn('Solicitar cita', 'appt'));
  c.children.push(metric('Turno estimado', '—', 'turn', 'asignación manual'));
  return [c];
}

/* ── catálogo exportado ──────────────────────────────── */


/* ── Pro: drawer profesional con estados ─────────────── */
function proDrawerApp() {
  const root = col(0, 0);
  const top = row(10);
  top.props.pad = 12;
  top.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  top.children.push(title('Nova Commerce', 17));
  top.children.push(createNode('icon', { name: 'bell', size: 18, color: 'primary' }));
  root.children.push(top);
  const dr = createNode('drawer', { title: 'Menú', state: 'drawerOpen', side: 'left', open: false });
  ['Inicio', 'Catálogo', 'Pedidos', 'Clientes', 'Ajustes'].forEach((lab, i) => {
    dr.children.push(btn(lab, 'nav-' + i));
  });
  root.children.push(dr);
  const body = col(12, 14);
  body.children.push(createNode('hero', { title: 'Panel del día', subtitle: 'Estados alset · listo para cablear API' }));
  const kpis = row(10);
  kpis.children.push(metric('Ventas', '$2.4k', 'sales', 'hoy'));
  kpis.children.push(metric('Pedidos', '18', 'orders', 'abiertos'));
  body.children.push(kpis);
  body.children.push(createNode('select', { label: 'Almacén', state: 'warehouse', options: 'Central,Este,Oeste' }));
  body.children.push(createNode('glass', { pad: 12, gap: 8 }));
  body.children[body.children.length - 1].children.push(title('Atajos', 14));
  body.children[body.children.length - 1].children.push(muted('El drawer y el select escriben en state'));
  const actions = row(8);
  actions.children.push(btn('Nuevo pedido', 'new-order'), btn('Sincronizar', 'sync'));
  body.children.push(actions);
  root.children.push(body);
  return [root];
}

function proRouterShop() {
  const root = col(0, 0);
  const r = createNode('router', { routes: 'home,shop,cart,me', state: 'route' });
  const home = col(12, 14);
  home.children.push(createNode('gradient', { from: '#0b0e14', to: '#1a1430', angle: 145, pad: 16 }));
  home.children[0].children.push(title('Hola', 20));
  home.children[0].children.push(muted('Tienda demo con router de 4 rutas'));
  home.children.push(metric('Destacados', '24', 'feat', 'en catálogo'));
  const shop = col(10, 12);
  shop.children.push(title('Catálogo', 17));
  shop.children.push(createNode('form-search', { state: 'q', placeholder: 'Buscar producto…' }));
  shop.children.push(createNode('lazy-column', { state: 'products', height: 280, pageSize: 6, itemLabel: 'Producto' }));
  const cart = col(10, 12);
  cart.children.push(title('Carrito', 17));
  cart.children.push(createNode('list', { state: 'cart', empty: 'Carrito vacío' }));
  cart.children.push(btn('Pagar', 'checkout'));
  const me = col(10, 12);
  me.children.push(title('Cuenta', 17));
  me.children.push(createNode('form-login', { title: 'Entrar' }));
  r.children.push(home, shop, cart, me);
  root.children.push(r);
  return [root];
}

function proFeedGlass() {
  const c = col(12, 12);
  c.children.push(createNode('gradient-image', {
    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=60',
    from: 'rgba(0,0,0,0)', to: 'rgba(11,14,20,0.9)', height: 150, title: 'Alset Feed',
  }));
  const glass = createNode('glass', { pad: 14, gap: 10 });
  glass.children.push(title('Timeline', 16));
  glass.children.push(createNode('lazy-column', { state: 'feed', height: 240, pageSize: 8, itemLabel: 'Post' }));
  c.children.push(glass);
  c.children.push(createNode('lazy-row', { state: 'tags', height: 52, pageSize: 8, itemLabel: 'Tag' }));
  c.children.push(createNode('fab', { text: '+', action: 'compose' }));
  return [c];
}

function proOnboard() {
  const root = col(0, 0);
  root.children.push(createNode('splash', {
    title: 'Chronos', subtitle: 'Alset Pulse · listo',
    duration: 1600, autoHide: true, state: 'splash',
    from: '#050505', to: '#1a0a20', icon: 'pulse', spinner: true, animated: true,
  }));
  const c = col(14, 16);
  c.children.push(title('Configura tu negocio', 18));
  c.children.push(createNode('input', { placeholder: 'Nombre del negocio', state: 'bizName' }));
  c.children.push(createNode('select', { label: 'Rubro', state: 'rubro', options: 'Comercio,Servicios,Alimentos,Tech' }));
  c.children.push(createNode('switch', { label: 'Recibir avisos', state: 'notify' }));
  c.children.push(btn('Continuar', 'onboard-next'));
  root.children.push(c);
  return [root];
}




/* ── Gemelas verticales: Sales Hub · La Tati · ÁbacoPhy · PrismaTec ── */
function twinSalesHub() {
  const root = col(0, 0);
  const tabs = createNode('bottom-tabs', {
    tabs: 'Inicio,Productos,Chats,Plan,Yo',
    icons: '⌂,▣,✎,★,☺',
    state: 'mainTab',
  });
  // Inicio
  const home = col(12, 12);
  home.children.push(title('Alset Sales Hub', 18));
  home.children.push(muted('Negocio · gestor · cliente'));
  const k = row(8);
  k.children.push(metric('Ventas hoy', '12', 'vHoy', 'reales'));
  k.children.push(metric('Gestores', '4', 'gest', 'activos'));
  home.children.push(k);
  home.children.push(createNode('glass', { pad: 12, gap: 6 }));
  home.children[home.children.length - 1].children.push(muted('Auditoría de chats y ranking premium en planes pagos'));
  // Productos
  const prod = col(10, 12);
  prod.children.push(title('Catálogo', 17));
  prod.children.push(createNode('form-search', { state: 'q', placeholder: 'Buscar producto…' }));
  prod.children.push(createNode('lazy-column', { state: 'salesProducts', height: 260, pageSize: 5, itemLabel: 'Producto' }));
  prod.children.push(btn('Publicar producto', 'nav-new-product'));
  // Chats
  const chats = col(10, 12);
  chats.children.push(title('Conversaciones', 17));
  chats.children.push(createNode('list', { state: 'chats', empty: 'Sin mensajes · tiempo real' }));
  // Plan
  const plan = col(10, 12);
  plan.children.push(title('Tu plan', 17));
  plan.children.push(createNode('select', { label: 'Plan', state: 'plan', options: 'Gratis,Profesional 250 CUP,Premium 500 CUP,Extra 1000 CUP' }));
  plan.children.push(btn('Solicitar cambio', 'plan-change'));
  // Yo
  const me = col(10, 12);
  me.children.push(title('Perfil', 17));
  me.children.push(createNode('form-login', { title: 'Sesión Sales Hub' }));
  tabs.children.push(home, prod, chats, plan, me);
  root.children.push(tabs);
  return [root];
}

function twinLaTati() {
  const root = col(0, 0);
  const top = row(10);
  top.props.pad = 12;
  top.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  top.children.push(title('La Tati', 18));
  top.children.push(createNode('badge', { text: 'gestora' }));
  root.children.push(top);
  const dr = createNode('drawer', { title: 'La Tati', subtitle: 'Gestión de ventas', state: 'drawerOpen', open: false });
  dr.children.push(createNode('button', { text: 'Catálogo', action: 'tab-Catálogo', icon: '▣' }));
  dr.children.push(createNode('button', { text: 'Pedidos', action: 'tab-Pedidos', icon: '✎' }));
  dr.children.push(createNode('button', { text: 'Intereses', action: 'tab-Intereses', icon: '★' }));
  dr.children.push(createNode('button', { text: 'Chat', action: 'tab-Chat', icon: '✉' }));
  root.children.push(dr);
  const shell = createNode('bottom-tabs', {
    tabs: 'Catálogo,Pedidos,Intereses,Chat',
    icons: '▣,✎,★,✉',
    state: 'mainTab',
  });
  const cat = col(10, 12);
  cat.children.push(createNode('form-search', { state: 'q', placeholder: 'Filtrar por categoría…' }));
  cat.children.push(createNode('select', { label: 'Categoría', state: 'cat', options: 'Todo,Ropa,Hogar,Comida,Tech' }));
  cat.children.push(createNode('lazy-column', { state: 'tatiProducts', height: 240, pageSize: 5, itemLabel: 'Oferta' }));
  cat.children.push(btn('Agregar al carrito', 'add-cart'));
  const ped = col(10, 12);
  ped.children.push(title('Pedidos', 16));
  ped.children.push(createNode('list', { state: 'tatiOrders', empty: 'Sin pedidos · confirma con el negocio' }));
  ped.children.push(btn('Confirmar pedido', 'confirm-order'));
  ped.children.push(btn('Cancelar pedido', 'cancel-order'));
  const int = col(10, 12);
  int.children.push(title('Intereses (sin precio)', 16));
  int.children.push(createNode('list', { state: 'tatiInterest', empty: 'Nadie marcó interés aún' }));
  const chat = col(10, 12);
  chat.children.push(title('Chat cliente', 16));
  chat.children.push(createNode('list', { state: 'tatiChat', empty: 'Escribe al cliente por el pedido' }));
  chat.children.push(createNode('input', { placeholder: 'Mensaje…', state: 'msg' }));
  chat.children.push(btn('Enviar', 'send-msg'));
  shell.children.push(cat, ped, int, chat);
  root.children.push(shell);
  return [root];
}

function twinGestionTati() {
  // Vista gestora / operaciones
  const root = col(0, 0);
  const tabs = createNode('bottom-tabs', {
    tabs: 'Hoy,Publicar,Stock,Vales',
    icons: '⌂,+,▦,✓',
    state: 'mainTab',
  });
  const hoy = col(12, 12);
  hoy.children.push(title('Gestión La Tati', 18));
  const k = row(8);
  k.children.push(metric('Pedidos', '7', 'pPend', 'por confirmar'));
  k.children.push(metric('Agotados', '2', 'agot', '24h'));
  hoy.children.push(k);
  hoy.children.push(createNode('list', { state: 'gestionQueue', empty: 'Cola vacía' }));
  const pub = col(10, 12);
  pub.children.push(title('Publicar oferta', 16));
  pub.children.push(createNode('input', { placeholder: 'Nombre del producto', state: 'pname' }));
  pub.children.push(createNode('input', { placeholder: 'Precio (opcional)', state: 'price', type: 'number' }));
  pub.children.push(createNode('select', { label: 'Moneda', state: 'cur', options: 'CUP,USD,EUR,Zelle' }));
  pub.children.push(createNode('select', { label: 'Categoría', state: 'cat', options: 'Ropa,Hogar,Comida,Tech,Otro' }));
  pub.children.push(createNode('switch', { label: 'Solo domicilio', state: 'domicilio' }));
  pub.children.push(btn('Publicar', 'publish'));
  const stock = col(10, 12);
  stock.children.push(title('Stock / agotados', 16));
  stock.children.push(createNode('lazy-column', { state: 'stockList', height: 220, pageSize: 6, itemLabel: 'SKU' }));
  stock.children.push(btn('Marcar agotado', 'mark-out'));
  const vales = col(10, 12);
  vales.children.push(title('Vales de recogida', 16));
  vales.children.push(createNode('list', { state: 'vales', empty: 'Sin vales generados' }));
  vales.children.push(btn('Escanear QR cliente', 'scan-qr'));
  tabs.children.push(hoy, pub, stock, vales);
  root.children.push(tabs);
  return [root];
}

function twinAbacoPhy() {
  const root = col(0, 0);
  const top = row(10);
  top.props.pad = 12;
  top.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  top.children.push(title('ÁbacoPhy', 17));
  top.children.push(createNode('badge', { text: 'PyME' }));
  root.children.push(top);
  const dr = createNode('drawer', { title: 'ÁbacoPhy', subtitle: 'Contabilidad', state: 'drawerOpen', open: false });
  [
    ['Dashboard', 'tab-Dashboard', '▦'],
    ['Inventario', 'tab-Inventario', '▣'],
    ['Facturas', 'tab-Facturas', '✎'],
    ['Nómina', 'tab-Nómina', '☺'],
    ['Nomencladores', 'tab-Nomencladores', '⚙'],
    ['Trazas', 'tab-Trazas', '⌕'],
  ].forEach(([lab, act, ic]) => {
    dr.children.push(createNode('button', { text: lab, action: act, icon: ic }));
  });
  root.children.push(dr);
  const tabs = createNode('bottom-tabs', {
    tabs: 'Dashboard,Inventario,Facturas,Nómina,Más',
    icons: '▦,▣,✎,☺,☰',
    state: 'mainTab',
  });
  const dash = col(10, 12);
  dash.children.push(title('Estado financiero', 16));
  const k = row(8);
  k.children.push(metric('Ingresos', '45k CUP', 'ing', 'mes'));
  k.children.push(metric('Gastos', '28k CUP', 'gas', 'mes'));
  dash.children.push(k);
  dash.children.push(createNode('glass', { pad: 12, gap: 6 }));
  dash.children[dash.children.length - 1].children.push(muted('Ecuación contable · cuentas T · CID'));
  const inv = col(10, 12);
  inv.children.push(title('Inventario', 16));
  inv.children.push(createNode('lazy-column', { state: 'abacoStock', height: 240, pageSize: 6, itemLabel: 'Producto' }));
  inv.children.push(btn('Rebaja / salida', 'stock-out'));
  const fac = col(10, 12);
  fac.children.push(title('Facturas', 16));
  fac.children.push(createNode('list', { state: 'invoices', empty: 'Sin facturas' }));
  fac.children.push(btn('Nueva factura PDF', 'inv-new'));
  const nom = col(10, 12);
  nom.children.push(title('Nómina', 16));
  nom.children.push(createNode('list', { state: 'payroll', empty: 'Sin trabajadores' }));
  nom.children.push(btn('Exportar nómina', 'nom-export'));
  const mas = col(10, 12);
  mas.children.push(title('Más módulos', 16));
  mas.children.push(createNode('select', { label: 'Rol vista', state: 'roleView', options: 'admin,vendedor,almacenero,economico' }));
  mas.children.push(muted('Master habilita módulos por negocio'));
  tabs.children.push(dash, inv, fac, nom, mas);
  root.children.push(tabs);
  return [root];
}

function twinPrismaMind() {
  const root = col(0, 0);
  const tabs = createNode('bottom-tabs', {
    tabs: 'Mind,Gen,Lisp,Red',
    icons: '⚡,◈,⌘,⌂',
    state: 'mainTab',
  });
  const mind = col(12, 12);
  mind.children.push(title('Alset Mind', 18));
  mind.children.push(muted('Órganos ternarios · memoria CID'));
  mind.children.push(createNode('textarea', { placeholder: 'Escribe al latido…', state: 'mindText', rows: 3 }));
  mind.children.push(btn('Latido /api/mind/tick', 'mind-tick'));
  mind.children.push(createNode('glass', { pad: 12, gap: 6 }));
  mind.children[mind.children.length - 1].children.push(muted('Respuesta del campo (demo Studio)'));
  const gen = col(10, 12);
  gen.children.push(title('Alset Gen', 17));
  gen.children.push(createNode('input', { placeholder: 'clave.ans', state: 'genKey' }));
  gen.children.push(btn('Crear semilla', 'gen-create'));
  gen.children.push(btn('Explorar frontera', 'gen-explore'));
  gen.children.push(createNode('list', { state: 'genFindings', empty: 'Sin hallazgos' }));
  const lisp = col(10, 12);
  lisp.children.push(title('LispAI / Zyrion', 17));
  lisp.children.push(createNode('textarea', { placeholder: '(evaluar-zyrion …)', state: 'lispCmd', rows: 4 }));
  lisp.children.push(btn('Eval /api/lispai', 'lisp-eval'));
  const red = col(10, 12);
  red.children.push(title('Nodo PrismaTec', 17));
  red.children.push(metric('Peers', '0', 'peers', 'libp2p'));
  red.children.push(metric('Agentes', '—', 'agents', 'RAM'));
  red.children.push(btn('GET /api/v2/info', 'api-info'));
  tabs.children.push(mind, gen, lisp, red);
  root.children.push(tabs);
  return [root];
}



function demoRestPulse() {
  const root = col(12, 12);
  root.children.push(title('REST + Pulse + Detalle', 18));
  root.children.push(muted('Consumer async → lazy · key · nav'));
  root.children.push(createNode('loader', { state: '_loading_apiData', text: 'Sincronizando…' }));
  root.children.push(createNode('progress', { state: 'progress', value: 25 }));
  root.children.push(
    createNode('rest-consumer', {
      method: 'GET',
      url: '/v1/data',
      bind: 'apiData',
      bindPath: 'items',
      auto: true,
      loadingKey: '_loading_apiData',
      buttonText: 'GET /v1/data',
    })
  );
  root.children.push(createNode('lazy-column', { state: 'apiData', height: 180, pageSize: 5, itemLabel: 'Ítem' }));
  root.children.push(createNode('nav-link', { text: 'Abrir detalle del foco', route: 'detail', detailState: 'selected', routeState: 'route' }));
  const car = createNode('carousel', { state: 'carouselIdx', animated: true });
  car.children.push(createNode('card', { pad: 12 }));
  car.children[0].children.push(title('Slide A', 16));
  car.children.push(createNode('card', { pad: 12 }));
  car.children[1].children.push(title('Slide B', 16));
  car.children.push(createNode('card', { pad: 12 }));
  car.children[2].children.push(title('Slide C', 16));
  root.children.push(car);
  root.children.push(createNode('image-browser', { state: 'imageData' }));
  root.children.push(createNode('pulse-consumer', { url: '/api/pulse', keys: 'home,detail', state: 'pulseData' }));
  root.children.push(createNode('mcp-agent', { url: '/mcp/tools' }));
  const va = createNode('view-agent', { key: 'home', lifecycle: 'active' });
  va.children.push(muted('Espacio direccionable key=home'));
  root.children.push(va);
  return [root];
}


/* ── Labs ecosistema completo ── */
function demoMiniNodeLab() {
  const root = col(12, 12);
  root.children.push(title('MiniNode Lab', 18));
  root.children.push(muted('Mind · Zyrion · mesh sin PrismaTec'));
  root.children.push(createNode('mind-panel', { state: 'mindText', out: 'mindVoice', local: false }));
  root.children.push(createNode('loader', { state: '_loading_mind', text: 'Latido…' }));
  root.children.push(createNode('zyrion-panel', { state: 'zyrionEnv', local: false }));
  root.children.push(createNode('mesh-peers', { name: 'lab-app', state: 'peers' }));
  root.children.push(createNode('mcp-agent', { url: '/mcp/tools' }));
  return [root];
}

function demoDecentralApp() {
  const root = col(0, 0);
  const tabs = createNode('bottom-tabs', {
    tabs: 'Feed,Pulse,Peers,Mind',
    icons: '▣,⚡,◈,☺',
    state: 'mainTab',
  });
  const feed = col(10, 12);
  feed.children.push(title('Feed descentralizado', 17));
  feed.children.push(createNode('rest-consumer', {
    method: 'GET', url: '/v1/data', bind: 'apiData', bindPath: 'items', auto: true,
    loadingKey: '_loading_apiData', buttonText: 'Sincronizar',
  }));
  feed.children.push(createNode('loader', { state: '_loading_apiData' }));
  feed.children.push(createNode('lazy-column', { state: 'apiData', height: 200, pageSize: 6, itemLabel: 'Post' }));
  const pulse = col(10, 12);
  pulse.children.push(title('Bus de pulsos', 17));
  const va = createNode('view-agent', { key: 'feed', lifecycle: 'active' });
  va.children.push(muted('key=feed · direccionable'));
  pulse.children.push(va);
  pulse.children.push(createNode('pulse-consumer', { url: '/api/pulse', keys: 'feed,detail', state: 'pulseData', auto: false }));
  const peers = col(10, 12);
  peers.children.push(title('Peers mesh', 17));
  peers.children.push(createNode('mesh-peers', { name: 'decentral-1', state: 'peers' }));
  const mind = col(10, 12);
  mind.children.push(title('Mind embebido', 17));
  mind.children.push(createNode('mind-panel', { local: true, state: 'mindText', out: 'mindVoice' }));
  tabs.children.push(feed, pulse, peers, mind);
  root.children.push(tabs);
  return [root];
}

function demoShopFull() {
  const root = col(0, 0);
  const top = row(10);
  top.props.pad = 12;
  top.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  top.children.push(title('Nova Shop', 18));
  top.children.push(createNode('badge', { text: 'PWA' }));
  root.children.push(top);
  const dr = createNode('drawer', { title: 'Nova', subtitle: 'Comercio', state: 'drawerOpen', open: false });
  [['Inicio', 'tab-Inicio', '⌂'], ['Catálogo', 'tab-Catálogo', '▣'], ['Carrito', 'tab-Carrito', '◎'], ['Cuenta', 'tab-Cuenta', '☺']].forEach(([a, b, c]) => {
    dr.children.push(createNode('button', { text: a, action: b, icon: c }));
  });
  root.children.push(dr);
  const tabs = createNode('bottom-tabs', {
    tabs: 'Inicio,Catálogo,Carrito,Cuenta',
    icons: '⌂,▣,◎,☺',
    state: 'mainTab',
  });
  const home = col(12, 12);
  home.children.push(createNode('gradient-image', {
    src: '', from: 'transparent', to: 'rgba(0,0,0,0.8)', height: 140, title: 'Ofertas de hoy',
  }));
  home.children.push(createNode('carousel', { state: 'carouselIdx', animated: true }));
  home.children[home.children.length - 1].children.push(createNode('card', { pad: 12 }));
  home.children[home.children.length - 1].children[0].children.push(title('Envío 24h', 15));
  home.children[home.children.length - 1].children.push(createNode('card', { pad: 12 }));
  home.children[home.children.length - 1].children[1].children.push(title('Pago CUP / USD', 15));
  const cat = col(10, 12);
  cat.children.push(createNode('form-search', { state: 'q', placeholder: 'Buscar…' }));
  cat.children.push(createNode('rest-consumer', {
    method: 'GET', url: '/v1/data', bind: 'products', bindPath: 'items', auto: true, buttonText: 'Cargar catálogo',
  }));
  cat.children.push(createNode('lazy-column', { state: 'products', height: 220, pageSize: 5, itemLabel: 'Producto' }));
  cat.children.push(createNode('nav-link', { text: 'Ver detalle', route: 'detail', detailState: 'selected', routeState: 'route' }));
  const cart = col(10, 12);
  cart.children.push(title('Carrito', 16));
  cart.children.push(createNode('list', { state: 'cart', empty: 'Vacío · agrega desde catálogo' }));
  cart.children.push(createNode('progress', { state: 'checkoutProg', value: 30 }));
  cart.children.push(btn('Confirmar pedido', 'checkout'));
  const acc = col(10, 12);
  acc.children.push(createNode('form-login', { title: 'Tu cuenta' }));
  acc.children.push(createNode('image-browser', { state: 'avatar' }));
  tabs.children.push(home, cat, cart, acc);
  root.children.push(tabs);
  return [root];
}

function demoCleanArch() {
  const root = col(12, 12);
  root.children.push(title('Clean Architecture UI', 18));
  root.children.push(createNode('architecture', { layer: 'presentation', pattern: 'di' }));
  const pres = createNode('glass', { pad: 12, gap: 8 });
  pres.children.push(muted('Presentation'));
  pres.children.push(createNode('button', { text: 'Acción UI', action: 'ui-action' }));
  root.children.push(pres);
  root.children.push(createNode('architecture', { layer: 'domain', pattern: 'factory' }));
  const dom = createNode('card', { pad: 12 });
  dom.children.push(muted('Domain · reglas'));
  dom.children.push(createNode('zyrion-filter', { source: 'apiData', out: 'filtered', field: 'score', mode: 1 }));
  root.children.push(dom);
  root.children.push(createNode('architecture', { layer: 'data', pattern: 'repository' }));
  const data = createNode('card', { pad: 12 });
  data.children.push(muted('Data · REST repository'));
  data.children.push(createNode('rest-consumer', {
    method: 'GET', url: '/v1/data', bind: 'apiData', bindPath: 'items', auto: true,
  }));
  data.children.push(createNode('lazy-column', { state: 'apiData', height: 160, pageSize: 4 }));
  root.children.push(data);
  return [root];
}

function demoShapesMotion() {
  const root = col(12, 12);
  root.children.push(title('Formas y motion', 18));
  const r = row(12);
  r.children.push(createNode('shape', { kind: 'circle', size: 56, from: '#f5c542', to: '#fb7185', text: 'A' }));
  r.children.push(createNode('shape', { kind: 'blob', size: 64, from: '#5b9cf5', to: '#22d3ee' }));
  r.children.push(createNode('shape', { kind: 'hex', size: 56, from: '#a3e635', to: '#2dd4bf' }));
  r.children.push(createNode('shape', { kind: 'cut', width: 72, height: 48, color: 'primary' }));
  root.children.push(r);
  root.children.push(createNode('anim-fade', { pad: 8 }));
  root.children[root.children.length - 1].children.push(createNode('glass', { pad: 12 }));
  root.children[root.children.length - 1].children[0].children.push(muted('Glass + fade'));
  root.children.push(createNode('carousel', { state: 'carouselIdx', animated: true }));
  const car = root.children[root.children.length - 1];
  for (const lab of ['Uno', 'Dos', 'Tres']) {
    const c = createNode('card', { pad: 16 });
    c.children.push(title(lab, 16));
    car.children.push(c);
  }
  return [root];
}



function demoMediaPlayer() {
  const root = col(12, 12);
  root.children.push(title('Reproductor multimedia', 18));
  root.children.push(muted('Video y audio desde URL (streaming HTTP)'));
  root.children.push(createNode('video', {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    height: 200,
    controls: true,
  }));
  root.children.push(createNode('audio', {
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    title: 'Pista demo',
    controls: true,
  }));
  root.children.push(createNode('progress', { state: 'mediaProg', value: 0 }));
  return [root];
}

function demoPulseMedia() {
  const root = col(12, 12);
  root.children.push(title('Multimedia por pulsos', 18));
  root.children.push(muted('El pulse puede traer src de video/audio en state'));
  root.children.push(createNode('view-agent', { key: 'media', lifecycle: 'active' }));
  root.children[root.children.length - 1].children.push(muted('key=media'));
  root.children.push(createNode('pulse-consumer', {
    url: '/api/pulse', keys: 'media', state: 'pulseData', auto: false,
  }));
  root.children.push(createNode('video', {
    state: 'mediaSrc',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    height: 180,
    controls: true,
  }));
  root.children.push(createNode('text', { text: 'Publica: {"key":"media","state":{"src":"https://…mp4"}}', size: 11, color: 'muted' }));
  return [root];
}

function demoMapExplore() {
  const root = col(12, 12);
  root.children.push(title('Explorar mapa', 18));
  root.children.push(muted('OpenStreetMap embebido · estilo Alset'));
  root.children.push(createNode('map', {
    lat: 23.1136, lng: -82.3666, zoom: 13, height: 220, label: 'La Habana',
  }));
  root.children.push(createNode('map', {
    lat: 20.024, lng: -75.8219, zoom: 12, height: 180, label: 'Guantánamo',
  }));
  root.children.push(createNode('glass', { pad: 12 }));
  root.children[root.children.length - 1].children.push(muted('Coords en props lat/lng · sin API key'));
  return [root];
}

function demoMediaMapShell() {
  const tabs = createNode('bottom-tabs', {
    tabs: 'Video,Audio,Mapa,Pulse',
    icons: '▶,♪,⌖,⚡',
    state: 'mainTab',
  });
  const v = col(10, 12);
  v.children.push(title('Video', 16));
  v.children.push(createNode('video', {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    height: 200, controls: true,
  }));
  const a = col(10, 12);
  a.children.push(title('Audio', 16));
  a.children.push(createNode('audio', {
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    title: 'Stream MP3', controls: true,
  }));
  const m = col(10, 12);
  m.children.push(title('Mapa', 16));
  m.children.push(createNode('map', { lat: 23.14, lng: -82.35, height: 240, zoom: 14, label: 'Habana Vieja' }));
  const p = col(10, 12);
  p.children.push(title('Pulse media', 16));
  p.children.push(createNode('pulse-consumer', { url: '/api/pulse', keys: 'media', state: 'pulseData' }));
  p.children.push(createNode('mesh-peers', { name: 'media-app', state: 'peers' }));
  tabs.children.push(v, a, m, p);
  return [tabs];
}



function demoWebRTC() {
  const root = col(12, 12);
  root.children.push(title('WebRTC local', 18));
  root.children.push(muted('Cámara del dispositivo · detener libera el track'));
  root.children.push(createNode('chip', { text: 'getUserMedia', color: 'primary' }));
  root.children.push(createNode('webrtc-camera', { height: 220, audio: false }));
  root.children.push(createNode('surface', { variant: 'elevated', pad: 12 }));
  root.children[root.children.length - 1].children.push(muted('Requiere HTTPS o localhost'));
  return [root];
}

function demoStreamHub() {
  const root = col(12, 12);
  root.children.push(title('Alset Streaming Hub', 18));
  root.children.push(muted('Ver · publicar · director (WebRTC multi-cámara)'));
  root.children.push(createNode('stream-hub', {
    hubUrl: 'https://alset-streaming-hub.lhmolam-877.workers.dev',
    matchId: 'partido-demo',
    label: 'Tribuna',
  }));
  root.children.push(createNode('divider', {}));
  root.children.push(createNode('avatar', { text: 'S', size: 48 }));
  root.children.push(createNode('text', { text: 'Genes / Studio pueden sondear /api/health y salas del hub.', size: 12, color: 'muted' }));
  return [root];
}

function demoLiveStudio() {
  const tabs = createNode('bottom-tabs', {
    tabs: 'Cámara,Hub,Mapa,Chat',
    icons: '◎,▶,⌖,✉',
    state: 'mainTab',
  });
  const cam = col(10, 12);
  cam.children.push(title('Producción', 16));
  cam.children.push(createNode('webrtc-camera', { height: 200 }));
  cam.children.push(createNode('chip', { text: 'local' }));
  const hub = col(10, 12);
  hub.children.push(title('Hub en vivo', 16));
  hub.children.push(createNode('stream-hub', { matchId: 'partido-demo', label: 'Cam-A' }));
  const map = col(10, 12);
  map.children.push(title('Venue', 16));
  map.children.push(createNode('map', { lat: 23.1136, lng: -82.3666, height: 200, label: 'Estadio' }));
  const chat = col(10, 12);
  chat.children.push(title('Pulse / mesh', 16));
  chat.children.push(createNode('pulse-consumer', { url: '/api/pulse', keys: 'live', state: 'pulseData' }));
  chat.children.push(createNode('mesh-peers', { name: 'live-studio', state: 'peers' }));
  tabs.children.push(cam, hub, map, chat);
  return [tabs];
}




/* ── Estado · eventos · CRUD · iconos (tutorial) ───────── */
function demoStateLogic() {
  const c = col(14, 12);
  c.children.push(createNode('state', { name: 'contador', value: '0' }));
  c.children.push(title('Estados + botones', 18));
  c.children.push(muted('El metric lee contador; los botones usan setState / action'));
  c.children.push(createNode('metric', { title: 'Contador', value: '0', state: 'contador', hint: 'alsetState' }));
  const r = row(8);
  r.children.push(createNode('button', { text: '+1', action: 'inc', setState: 'contador', setValue: '1' }));
  r.children.push(createNode('button', { text: 'Reset', setState: 'contador', setValue: '0' }));
  r.children.push(createNode('button', { text: 'Tab Pedidos', action: 'tab-Pedidos' }));
  c.children.push(r);
  c.children.push(createNode('input', { placeholder: 'Tu nombre', state: 'nombre' }));
  c.children.push(createNode('text', { text: 'Escribe arriba; Lisp: (get-state "nombre")', size: 12, color: 'muted' }));
  return [c];
}

function demoCrudList() {
  const c = col(14, 12);
  c.children.push(title('CRUD lista', 18));
  c.children.push(createNode('rest-consumer', {
    url: '/v1/data', method: 'GET', state: 'items', auto: true, bind: 'items',
  }));
  c.children.push(createNode('loader', { label: 'Cargando…', state: '_loading_items' }));
  c.children.push(createNode('table', { state: 'items', columns: 'id,name' }));
  c.children.push(createNode('list', { state: 'items', empty: 'Sin filas — prueba POST' }));
  const form = row(8);
  form.children.push(createNode('input', { placeholder: 'nombre', state: 'nuevoNombre' }));
  form.children.push(createNode('button', { text: 'Crear (POST)', action: 'submit' }));
  c.children.push(form);
  c.children.push(createNode('api-post', { url: '/v1/data', state: 'nuevoNombre', event: 'submit' }));
  return [c];
}

function demoNavTabs() {
  const shell = createNode('bottom-tabs', {
    tabs: 'Inicio,Lista,Yo', icons: '⌂,☰,☺', state: 'mainTab',
  });
  const a = col(12, 10);
  a.children.push(title('Inicio', 16));
  a.children.push(muted('Navegación por state mainTab'));
  a.children.push(createNode('button', { text: 'Ir a Lista', action: 'tab-Lista' }));
  const b = col(12, 10);
  b.children.push(title('Lista', 16));
  b.children.push(createNode('list', { state: 'items', empty: 'Vacío' }));
  b.children.push(createNode('button', { text: 'Volver', action: 'tab-Inicio' }));
  const d = col(12, 10);
  d.children.push(title('Perfil', 16));
  d.children.push(createNode('avatar', { text: 'U' }));
  d.children.push(createNode('role-badge', {}));
  shell.children.push(a, b, d);
  return [shell];
}

function demoIconsGallery() {
  const c = col(12, 10);
  c.children.push(title('Iconos en UI', 18));
  c.children.push(muted('También: panel Toolbox → Iconos'));
  const r = row(12);
  ['home', 'search', 'cart', 'bell', 'settings', 'heart'].forEach((name) => {
    r.children.push(createNode('icon', { name, size: 28, color: 'primary' }));
  });
  c.children.push(r);
  c.children.push(createNode('fab', { icon: 'plus', action: 'add' }));
  return [c];
}

function demoMindZyrionUI() {
  const c = col(14, 12);
  c.children.push(title('Mind · Zyrion en canvas', 18));
  c.children.push(createNode('mind-panel', { title: 'Mind lite' }));
  c.children.push(createNode('zyrion-panel', { title: 'Zyrion' }));
  c.children.push(createNode('zyrion-filter', { state: 'filtro', label: 'Filtro ternario' }));
  return [c];
}

function demoEventsKitchen() {
  const c = col(12, 10);
  c.children.push(createNode('hero', { title: 'Cocina de eventos', subtitle: 'action · setState · tabs · drawer' }));
  c.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  const dr = createNode('drawer', { title: 'Menú', state: 'drawerOpen', side: 'left' });
  dr.children.push(createNode('button', { text: 'Inicio', action: 'tab-Inicio', icon: '⌂' }));
  dr.children.push(createNode('button', { text: 'Abrir tab Datos', action: 'tab-Datos' }));
  c.children.push(dr);
  c.children.push(createNode('nav', { tabs: 'Inicio,Datos,Ajustes', state: 'tab' }));
  c.children.push(createNode('progress', { value: 45, state: 'uploadPct' }));
  c.children.push(createNode('chip', { text: 'evento' }));
  c.children.push(createNode('toast', { text: 'Listo', state: 'toast' }));
  return [c];
}


export const EXAMPLES = [
  // Marketing
  { id: 'landing', name: 'Landing moderna', blurb: 'Hero + CTA + métrica reactiva', tags: ['marketing', 'hero'], build: landing },
  { id: 'landing-saas', name: 'Landing SaaS', blurb: 'Beta badge, KPIs y propuesta de valor', tags: ['marketing', 'saas'], build: landingSaaS },
  { id: 'landing-product', name: 'Landing producto', blurb: 'Nav + hero + demo comercial', tags: ['marketing'], build: landingProduct },
  { id: 'onboarding', name: 'Onboarding 3 pasos', blurb: 'Splash + perfil de negocio', tags: ['product', 'mobile'], build: onboarding },
  // Comercio
  { id: 'store', name: 'Tienda online', blurb: 'Catálogo, búsqueda, carrito', tags: ['ecommerce', 'store'], build: storefront },
  { id: 'checkout', name: 'Checkout comercio', blurb: 'Resumen, entrega y método de pago', tags: ['ecommerce'], build: ecommerceCheckout },
  { id: 'exchange', name: 'Casa de cambio', blurb: 'Tasas, paridades y cotización', tags: ['fintech', 'fx'], build: exchangeShop },
  { id: 'inventory', name: 'Inventario / SKU', blurb: 'Stock, entradas y salidas', tags: ['ops', 'store'], build: inventory },
  { id: 'restaurant', name: 'Menú restaurante', blurb: 'Carta + pedido a cocina', tags: ['food', 'orders'], build: restaurantMenu },
  // Finanzas
  { id: 'wallet', name: 'Billetera virtual', blurb: 'Saldo, enviar, actividad, drawer', tags: ['fintech', 'wallet', 'mobile'], build: wallet },
  { id: 'banking', name: 'App bancaria lite', blurb: 'Cuentas y transferencia rápida', tags: ['fintech', 'bank'], build: bankingApp },
  { id: 'remittance', name: 'Remesas', blurb: 'Corredor, beneficiario, estado', tags: ['fintech', 'remesas'], build: remittance },
  { id: 'invoice', name: 'Facturación', blurb: 'Emitir, borradores, marcar pagada', tags: ['billing', 'tcp'], build: invoicing },
  { id: 'quotes', name: 'Cotizaciones', blurb: 'Servicios profesionales / TCP', tags: ['billing'], build: quotesApp },
  { id: 'escrow', name: 'Contrato / escrow', blurb: 'Hitos, firma, liberación, disputa', tags: ['contracts', 'fintech'], build: smartContractLite },
  // Operación
  { id: 'orders', name: 'Pedidos online', blurb: 'Cola, detalle, repartidor', tags: ['orders', 'mobile'], build: ordersApp },
  { id: 'booking', name: 'Reservas / citas', blurb: 'Agenda de turnos', tags: ['services'], build: bookingApp },
  { id: 'support', name: 'Mesa de ayuda', blurb: 'Tickets y respuestas', tags: ['support'], build: supportDesk },
  { id: 'events', name: 'Agenda eventos', blurb: 'Cupos y reservas culturales', tags: ['events'], build: eventsApp },
  { id: 'health', name: 'Cita médica lite', blurb: 'Especialidad y solicitud', tags: ['health'], build: healthcareLite },
  // Contenido
  { id: 'blog', name: 'Blog / bitácora', blurb: 'Home de artículos y búsqueda', tags: ['content', 'blog'], build: blogHome },
  { id: 'cv', name: 'Curriculum vitae', blurb: 'CV moderno con CTAs', tags: ['cv', 'personal'], build: curriculum },
  { id: 'portfolio', name: 'Portfolio', blurb: 'Casos de producto e infra', tags: ['content'], build: portfolio },
  // Core / tech
  { id: 'saas', name: 'SaaS dashboard', blurb: 'KPIs y health del runtime', tags: ['product', 'api'], build: saasDashboard },
  { id: 'auth', name: 'Auth login + registro', blurb: 'Formularios de acceso', tags: ['forms'], build: authFlow },
  { id: 'crm', name: 'CRM / leads', blurb: 'POST /v1/data + tabla', tags: ['backend', 'crud'], build: contactCrm },
  { id: 'motion', name: 'Motion UI', blurb: 'Fade · slide · scale', tags: ['motion'], build: motionShowcase },
  { id: 'mobile', name: 'App móvil first', blurb: 'Splash · drawer · tabs · gestos', tags: ['mobile', 'pwa'], build: mobileApp },
  // Pro Chronos
  { id: 'pro-drawer', name: 'Drawer profesional', blurb: 'Shell con menú, KPIs y select con state', tags: ['pro', 'drawer', 'mobile'], build: proDrawerApp },
  { id: 'pro-router', name: 'Tienda + router', blurb: '4 rutas · lazy catálogo · login', tags: ['pro', 'router', 'shop'], build: proRouterShop },
  { id: 'pro-feed', name: 'Feed glass', blurb: 'Cover degradado · lazy · FAB', tags: ['pro', 'glass', 'feed'], build: proFeedGlass },
  { id: 'pro-onboard', name: 'Onboarding Chronos', blurb: 'Splash pro · select · switch', tags: ['pro', 'onboard'], build: proOnboard },
  // Gemelas de productos reales
  { id: 'twin-sales', name: 'Alset Sales Hub', blurb: 'Gemela: negocio·gestor·cliente·planes', tags: ['twin', 'sales'], build: twinSalesHub },
  { id: 'twin-tati', name: 'La Tati', blurb: 'Gemela: catálogo·pedidos·intereses·chat', tags: ['twin', 'tati'], build: twinLaTati },
  { id: 'twin-gestion-tati', name: 'Gestión La Tati', blurb: 'Gemela gestora: publicar·stock·vales', tags: ['twin', 'tati'], build: twinGestionTati },
  { id: 'twin-abaco', name: 'ÁbacoPhy', blurb: 'Gemela contable: inventario·facturas·nómina', tags: ['twin', 'abaco'], build: twinAbacoPhy },
  { id: 'twin-prisma', name: 'PrismaTec Mind', blurb: 'Gemela: Mind·Gen·LispAI·nodo', tags: ['twin', 'prisma'], build: twinPrismaMind },
  { id: 'demo-rest-pulse', name: 'REST · Pulse · Carousel', blurb: 'API consumer, lazy bind, pulse, MCP', tags: ['pro', 'api'], build: demoRestPulse },
  { id: 'demo-mininode', name: 'MiniNode Lab', blurb: 'Mind · Zyrion · mesh · MCP', tags: ['lab', 'mind'], build: demoMiniNodeLab },
  { id: 'demo-decentral', name: 'App descentralizada', blurb: 'Feed REST + pulse + peers + mind local', tags: ['lab', 'mesh'], build: demoDecentralApp },
  { id: 'demo-shop-full', name: 'Nova Shop completa', blurb: 'Drawer · tabs · REST · carousel · avatar', tags: ['pro', 'shop'], build: demoShopFull },
  { id: 'demo-clean', name: 'Clean Architecture', blurb: 'Capas presentation·domain·data', tags: ['arch'], build: demoCleanArch },
  { id: 'demo-shapes', name: 'Formas y motion', blurb: 'Shapes · glass · carousel', tags: ['design'], build: demoShapesMotion },
  { id: 'demo-media', name: 'Reproductor multimedia', blurb: 'Video + audio real por URL', tags: ['media'], build: demoMediaPlayer },
  { id: 'demo-pulse-media', name: 'Media por pulsos', blurb: 'Pulse key=media + video', tags: ['media', 'pulse'], build: demoPulseMedia },
  { id: 'demo-map', name: 'Explorar mapa', blurb: 'OSM embebido Habana · Guantánamo', tags: ['map'], build: demoMapExplore },
  { id: 'demo-media-shell', name: 'Shell multimedia', blurb: 'Tabs video·audio·mapa·pulse', tags: ['media', 'pro'], build: demoMediaMapShell },
  { id: 'demo-webrtc', name: 'WebRTC cámara', blurb: 'getUserMedia local optimizado', tags: ['webrtc'], build: demoWebRTC },
  { id: 'demo-stream-hub', name: 'Alset Streaming Hub', blurb: 'Ver/publicar/director multi-cámara', tags: ['webrtc', 'hub'], build: demoStreamHub },
  { id: 'demo-live-studio', name: 'Live Studio', blurb: 'Cámara + Hub + mapa + pulse', tags: ['webrtc', 'pro'], build: demoLiveStudio },
  { id: 'demo-state-logic', name: 'Estados y botones', blurb: 'metric + setState + input + tab action', tags: ['logic', 'state'], build: demoStateLogic },
  { id: 'demo-crud-list', name: 'CRUD + tabla', blurb: 'rest-consumer · table · list · POST', tags: ['crud', 'api'], build: demoCrudList },
  { id: 'demo-nav-tabs', name: 'Navegación tabs', blurb: 'bottom-tabs · action tab-*', tags: ['nav', 'mobile'], build: demoNavTabs },
  { id: 'demo-icons', name: 'Galería iconos UI', blurb: 'icon · fab en canvas', tags: ['icons'], build: demoIconsGallery },
  { id: 'demo-mind-ui', name: 'Mind · Zyrion UI', blurb: 'paneles en el árbol', tags: ['mind', 'zyrion'], build: demoMindZyrionUI },
  { id: 'demo-events', name: 'Eventos · drawer · nav', blurb: 'hamburger · action · progress', tags: ['logic', 'events'], build: demoEventsKitchen },
];
