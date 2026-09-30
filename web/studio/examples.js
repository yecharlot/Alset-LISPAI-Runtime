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
];
