/**
 * Pre-built examples: load, run (preview), deploy.
 */
import { createNode } from './components.js';

function landing() {
  const c = createNode('column', { gap: 16, pad: 16 });
  c.children.push(createNode('hero', { title: 'Alset', subtitle: 'Interfaces de próxima generación · nativas alsetState' }));
  const row = createNode('row', { gap: 10 });
  row.children.push(createNode('button', { text: 'Comenzar', action: 'start', state: 'cta', anim: 'fade' }));
  row.children.push(createNode('button', { text: 'Ver docs', action: 'docs' }));
  c.children.push(row);
  c.children.push(createNode('metric', { title: 'Señales', value: '0', state: 'cta', hint: 'clicks (alsetState)' }));
  return [c];
}

function saasDashboard() {
  const c = createNode('column', { gap: 14, pad: 12 });
  c.children.push(createNode('nav', { tabs: 'Overview,Revenue,Users', state: 'tab' }));
  const row = createNode('row', { gap: 12 });
  row.children.push(createNode('metric', { title: 'MRR', value: '$12.4k', state: 'mrr', hint: 'observado' }));
  row.children.push(createNode('metric', { title: 'Active', value: '1.2k', state: 'active', hint: 'usuarios' }));
  row.children.push(createNode('metric', { title: 'NPS', value: '62', state: 'nps', hint: 'score' }));
  c.children.push(row);
  c.children.push(createNode('api', { url: '/v1/health', state: 'apiData', auto: true }));
  c.children.push(createNode('card', { pad: 14, gap: 8 }));
  c.children[3].children.push(createNode('text', { text: 'Estado del runtime', size: 14, weight: 'bold', color: 'primary' }));
  c.children[3].children.push(createNode('list', { state: 'apiData', empty: 'Sin telemetría' }));
  return [c];
}

function authFlow() {
  const c = createNode('column', { gap: 12, pad: 16 });
  c.children.push(createNode('text', { text: 'Bienvenido', size: 22, weight: 'bold', color: 'primary' }));
  c.children.push(createNode('form-login', { title: 'Iniciar sesión' }));
  c.children.push(createNode('text', { text: '¿Nuevo? Regístrate abajo', size: 12, color: 'muted' }));
  c.children.push(createNode('form-register', { title: 'Crear cuenta' }));
  return [c];
}

function contactCrm() {
  const c = createNode('column', { gap: 12, pad: 12 });
  c.children.push(createNode('text', { text: 'CRM ligero', size: 18, weight: 'bold', color: 'primary' }));
  c.children.push(createNode('form-contact', { title: 'Nuevo lead' }));
  c.children.push(createNode('api', { url: '/v1/data', state: 'rows', auto: true }));
  c.children.push(createNode('table', { state: 'rows', columns: 'id,email,msg' }));
  return [c];
}

function motionShowcase() {
  const c = createNode('column', { gap: 12, pad: 12 });
  c.children.push(createNode('text', { text: 'Motion Alset', size: 18, weight: 'bold', color: 'primary' }));
  const fade = createNode('anim-fade', { duration: 500 });
  fade.children.push(createNode('card', { pad: 16 }));
  fade.children[0].children.push(createNode('text', { text: 'Fade in', size: 15 }));
  const slide = createNode('anim-slide', { duration: 450 });
  slide.children.push(createNode('card', { pad: 16 }));
  slide.children[0].children.push(createNode('text', { text: 'Slide up', size: 15 }));
  const scale = createNode('anim-scale', { duration: 400 });
  scale.children.push(createNode('card', { pad: 16 }));
  scale.children[0].children.push(createNode('text', { text: 'Scale', size: 15 }));
  c.children.push(fade, slide, scale);
  c.children.push(createNode('button', { text: 'Pulse CTA', action: 'pulse', state: 'pulses', anim: 'scale' }));
  c.children.push(createNode('metric', { title: 'Pulses', state: 'pulses', value: '0' }));
  return [c];
}

function mobileApp() {
  const root = createNode('column', { gap: 0, pad: 0 });
  root.children.push(createNode('splash', { title: 'Alset', subtitle: 'Mobile · offline', duration: 1200, animated: true }));
  const top = createNode('row', { gap: 10, pad: 10 });
  top.children.push(createNode('hamburger', { state: 'drawerOpen' }));
  top.children.push(createNode('text', { text: 'Feed', size: 18, weight: 'bold', color: 'primary' }));
  root.children.push(top);
  const drawer = createNode('drawer', { title: 'Menú', state: 'drawerOpen', side: 'left' });
  drawer.children.push(createNode('button', { text: 'Inicio', action: 'home' }));
  drawer.children.push(createNode('button', { text: 'Buscar', action: 'search' }));
  root.children.push(drawer);
  const tabs = createNode('tabs-shell', { tabs: 'Inicio,API,Yo', state: 'tab' });
  const a = createNode('column', { gap: 10, pad: 12 });
  a.children.push(createNode('hero', { title: 'Gestos nativos', subtitle: 'Swipe abre el menú en el emulador' }));
  a.children.push(createNode('button', { text: 'Pulse', action: 'pulse', state: 'pulses' }));
  a.children.push(createNode('metric', { title: 'Pulses', state: 'pulses', value: '0' }));
  const b = createNode('column', { gap: 8, pad: 12 });
  b.children.push(createNode('api', { url: '/v1/health', state: 'apiData', auto: true }));
  b.children.push(createNode('list', { state: 'apiData' }));
  const c = createNode('column', { gap: 8, pad: 12 });
  c.children.push(createNode('text', { text: 'Offline', size: 16, weight: 'bold' }));
  c.children.push(createNode('persist', { key: 'alset.mobile', state: 'pulses' }));
  tabs.children.push(a, b, c);
  root.children.push(tabs);
  return [root];
}

export const EXAMPLES = [
  {
    id: 'landing',
    name: 'Landing moderna',
    blurb: 'Hero + CTA + métrica reactiva alsetState',
    tags: ['marketing', 'hero'],
    build: landing,
  },
  {
    id: 'saas',
    name: 'SaaS dashboard',
    blurb: 'Tabs, KPIs y health del runtime',
    tags: ['product', 'api'],
    build: saasDashboard,
  },
  {
    id: 'auth',
    name: 'Auth (login + registro)',
    blurb: 'Formularios con estado nativo Input',
    tags: ['forms'],
    build: authFlow,
  },
  {
    id: 'crm',
    name: 'CRM / leads fullstack',
    blurb: 'POST /v1/data + tabla en vivo',
    tags: ['backend', 'crud'],
    build: contactCrm,
  },
  {
    id: 'motion',
    name: 'Motion fade · slide · scale',
    blurb: 'Tres animaciones Alset-JS Animate',
    tags: ['motion'],
    build: motionShowcase,
  },
  {
    id: 'mobile',
    name: 'App móvil first',
    blurb: 'Splash · hamburguesa · drawer · tabs · gestos · offline',
    tags: ['mobile', 'pwa', 'gestures'],
    build: mobileApp,
  },
];
