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
    { type: 'list', label: 'Lista', defaults: { state: 'items', empty: 'Sin datos', itemTitle: 'name', itemSubtitle: 'description', itemMeta: '' } },
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
    { type: 'api', label: 'REST GET', connector: true, defaults: { url: '/v1/health', state: 'apiData', auto: true, silent: true } },
    { type: 'api-post', label: 'REST POST', connector: true, defaults: { url: '/v1/data', state: 'postBody', event: 'submit', silent: true } },
    { type: 'state', label: 'Estado', connector: true, defaults: { name: 'count', value: '0', silent: true } },
    { type: 'persist', label: 'Persistencia', connector: true, defaults: { key: 'app.v1', state: 'count', silent: true } },
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
    { type: 'bottom-tabs', label: 'Bottom tabs', defaults: { tabs: 'Inicio,Buscar,Carrito,Yo', icons: '⌂,⌕,▣,☺', state: 'mainTab' }, container: true },
    { type: 'stack', label: 'Stack', defaults: { state: 'stack', animated: true }, container: true },
    { type: 'splash', label: 'Splash pro', defaults: { title: 'Alset', subtitle: 'Cargando…', duration: 1800, animated: true, autoHide: true, state: 'splash', from: '#0b0e14', to: '#1a1430', icon: 'pulse', spinner: true } },
  ]},
  { group: 'Formas', items: [
    { type: 'shape', label: 'Círculo', defaults: { kind: 'circle', size: 72, color: 'primary', text: '' } },
    { type: 'shape', label: 'Blob', defaults: { kind: 'blob', size: 88, from: '#f4b400', to: '#fb7185' } },
    { type: 'shape', label: 'Recorte', defaults: { kind: 'cut', width: 120, height: 80, from: '#5b9cf5', to: '#22d3ee' } },
    { type: 'shape', label: 'Píldora', defaults: { kind: 'pill', width: 140, height: 40, color: 'primary', text: 'Pill' } },
    { type: 'shape', label: 'Hexágono', defaults: { kind: 'hex', size: 72, from: '#a3e635', to: '#2dd4bf' } },
    { type: 'shape', label: 'Diamante', defaults: { kind: 'diamond', size: 64, color: 'secondary' } },
  ]},

  { group: 'Datos · Red · Agentes', items: [
    { type: 'carousel', label: 'Carousel', defaults: { state: 'carouselIdx', animated: true }, container: true },
    { type: 'loader', label: 'Load indicator', defaults: { state: '_loading', text: 'Cargando…' } },
    { type: 'progress', label: 'Progress bar', defaults: { state: 'progress', value: 40 } },
    { type: 'file-browser', label: 'Browser archivos', defaults: { state: 'fileData', multiple: false } },
    { type: 'image-browser', label: 'Browser imágenes', defaults: { state: 'imageData', accept: 'image/*' } },
    { type: 'rest-consumer', connector: true, label: 'API REST Consumer', defaults: { method: 'GET', url: '/v1/data', bind: 'apiData', bindPath: 'items', auto: true, buttonText: 'Cargar', silent: true } },
    { type: 'pulse-consumer', connector: true, label: 'Pulse Server Consumer', defaults: { url: '/api/pulse', keys: 'home,detail', state: 'pulseData', auto: false, silent: true } },
    { type: 'view-agent', label: 'Vista-agente', defaults: { key: 'home', lifecycle: 'mount' }, container: true },
    { type: 'nav-link', label: 'Nav detalle', defaults: { text: 'Ver detalle', route: 'detail', detailState: 'selected', routeState: 'route' } },
    { type: 'zyrion-filter', label: 'Zyrion filter', defaults: { source: 'apiData', out: 'apiFiltered', field: 'score', mode: 1 } },
    { type: 'mcp-agent', label: 'MCP agent', defaults: { url: '/mcp/tools', state: 'mcpTools' } },
    { type: 'mind-panel', label: 'Mind (mini-nodo)', defaults: { state: 'mindText', out: 'mindVoice', local: false } },
    { type: 'zyrion-panel', label: 'Zyrion panel', defaults: { state: 'zyrionEnv', local: false } },
    { type: 'mesh-peers', label: 'Mesh peers', defaults: { name: 'mi-app', state: 'peers' } },
    { type: 'architecture', label: 'Clean layer', defaults: { layer: 'domain', pattern: 'repository' } },
  ]},

  { group: 'WebRTC · Streaming Hub', items: [
    { type: 'webrtc-camera', label: 'Cámara WebRTC', defaults: { height: 220, audio: false, facing: 'environment' } },
    { type: 'stream-hub', label: 'Alset Stream Hub', defaults: { hubUrl: 'https://alset-streaming-hub.lhmolam-877.workers.dev', matchId: 'partido-demo', role: 'watch', label: 'Cam1' } },
    { type: 'chip', label: 'Chip', defaults: { text: 'en vivo', color: 'primary' } },
    { type: 'avatar', label: 'Avatar', defaults: { text: 'A', size: 44 } },
    { type: 'divider', label: 'Divisor', defaults: {} },
    { type: 'skeleton', label: 'Skeleton', defaults: { height: 56 } },
    { type: 'empty-state', label: 'Empty state', defaults: { text: 'Nada por aquí', icon: '◇' } },
    { type: 'surface', label: 'Surface', defaults: { variant: 'elevated', pad: 14 }, container: true },
  ]},
  { group: 'Alset-JS · Chronos', items: [
    { type: 'icon', label: 'Icon', defaults: { name: 'pulse', size: 24, color: 'primary' } },
    { type: 'fab', label: 'FAB flotante', defaults: { text: '+', action: 'add' } },
    { type: 'layer', label: 'Layer', defaults: {}, container: true },
    { type: 'gradient', label: 'Degradado', defaults: { from: '#0b0e14', to: '#f4b400', angle: 135, pad: 16 }, container: true },
    { type: 'gradient-image', label: 'Imagen + degradado', defaults: { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=60', from: 'transparent', to: 'rgba(0,0,0,0.75)', height: 180, title: 'Cover' }, container: true },
    { type: 'glass', label: 'Glass / blur', defaults: { pad: 16, gap: 8 }, container: true },
    { type: 'toast', label: 'Toast', defaults: { text: 'Guardado', duration: 2200 } },
    { type: 'animate', label: 'Animate', defaults: { duration: 400 }, container: true },
    { type: 'video', label: 'Video', defaults: { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', height: 200, controls: true } },
    { type: 'audio', label: 'Audio', defaults: { src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', title: 'Demo audio', controls: true } },
    { type: 'map', label: 'Mapa', defaults: { height: 200, lat: 23.1136, lng: -82.3666, zoom: 13, label: 'La Habana' } },
    { type: 'lazy-column', label: 'Lazy Column', defaults: { state: 'feed', height: 280, pageSize: 8, empty: 'Sin ítems' } },
    { type: 'lazy-row', label: 'Lazy Row', defaults: { state: 'chips', height: 56, pageSize: 6 } },
    { type: 'router', label: 'Nav Router', defaults: { routes: 'home,catalog,profile', state: 'route' }, container: true },
    { type: 'theme-chip', label: 'Theme preset', defaults: { theme: 'gold-night' } },
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
    id: 'pro-drawer',
    name: 'Shell drawer pro',
    build() {
      const root = createNode('column', { gap: 0, pad: 0 });
      const top = createNode('row', { gap: 10, pad: 12 });
      top.children.push(createNode('hamburger', { state: 'drawerOpen' }));
      top.children.push(createNode('text', { text: 'Alset Hub', size: 17, weight: 'bold', color: 'primary' }));
      top.children.push(createNode('spacer', { size: 8 }));
      top.children.push(createNode('icon', { name: 'bell', size: 20 }));
      root.children.push(top);
      const drawer = createNode('drawer', { title: 'Navegación', state: 'drawerOpen', side: 'left', open: false });
      drawer.children.push(createNode('button', { text: 'Inicio', action: 'nav-home' }));
      drawer.children.push(createNode('button', { text: 'Catálogo', action: 'nav-catalog' }));
      drawer.children.push(createNode('button', { text: 'Pedidos', action: 'nav-orders' }));
      drawer.children.push(createNode('button', { text: 'Perfil', action: 'nav-profile' }));
      drawer.children.push(createNode('button', { text: 'Ajustes', action: 'nav-settings' }));
      root.children.push(drawer);
      const body = createNode('column', { gap: 12, pad: 14 });
      body.children.push(createNode('hero', { title: 'Bienvenido', subtitle: 'Drawer · estados · router listo' }));
      body.children.push(createNode('metric', { title: 'Sesión', value: 'activa', state: 'sessionLabel', hint: 'alsetState' }));
      body.children.push(createNode('select', { label: 'Sucursal', state: 'branch', options: 'Centro,Vedado,Playa,Habana del Este' }));
      body.children.push(createNode('button', { text: 'Continuar', action: 'go' }));
      root.children.push(body);
      return [root];
    },
  },
  {
    id: 'pro-splash',
    name: 'Splash + onboarding',
    build() {
      const root = createNode('column', { gap: 0, pad: 0 });
      root.children.push(createNode('splash', {
        title: 'Alset', subtitle: 'Identidad · decisión · memoria',
        duration: 2000, animated: true, autoHide: true, state: 'splash',
        from: '#050505', to: '#1a1430', icon: 'pulse', spinner: true,
      }));
      const c = createNode('column', { gap: 14, pad: 16 });
      const g = createNode('gradient', { from: '#12171f', to: '#0b0e14', angle: 160, pad: 18 });
      g.children.push(createNode('text', { text: 'Empieza en minutos', size: 20, weight: 'bold', color: 'primary' }));
      g.children.push(createNode('text', { text: 'Plantilla con estados y tema listos', size: 13, color: 'muted' }));
      c.children.push(g);
      c.children.push(createNode('button', { text: 'Crear cuenta', action: 'register' }));
      c.children.push(createNode('button', { text: 'Ya tengo acceso', action: 'login' }));
      root.children.push(c);
      return [root];
    },
  },
  {
    id: 'pro-router',
    name: 'Router 3 rutas',
    build() {
      const root = createNode('column', { gap: 0, pad: 0 });
      const r = createNode('router', { routes: 'home,shop,me', state: 'route' });
      const home = createNode('column', { gap: 12, pad: 14 });
      home.children.push(createNode('text', { text: 'Inicio', size: 18, weight: 'bold', color: 'primary' }));
      home.children.push(createNode('metric', { title: 'Hoy', value: '12', state: 'today' }));
      const shop = createNode('column', { gap: 10, pad: 14 });
      shop.children.push(createNode('text', { text: 'Catálogo', size: 18, weight: 'bold', color: 'primary' }));
      shop.children.push(createNode('lazy-column', { state: 'products', height: 260, pageSize: 6, empty: 'Sin productos' }));
      const me = createNode('column', { gap: 10, pad: 14 });
      me.children.push(createNode('text', { text: 'Perfil', size: 18, weight: 'bold', color: 'primary' }));
      me.children.push(createNode('form-login', { title: 'Sesión' }));
      r.children.push(home, shop, me);
      root.children.push(r);
      return [root];
    },
  },
  {
    id: 'pro-glass',
    name: 'Glass + lazy feed',
    build() {
      const c = createNode('column', { gap: 12, pad: 12 });
      const g = createNode('gradient-image', {
        src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=900&q=60',
        from: 'rgba(0,0,0,0.1)', to: 'rgba(11,14,20,0.92)', height: 160, title: 'Feed vivo',
      });
      c.children.push(g);
      const glass = createNode('glass', { pad: 14, gap: 8 });
      glass.children.push(createNode('text', { text: 'Actividad', size: 16, weight: 'bold', color: 'primary' }));
      glass.children.push(createNode('lazy-column', { state: 'feed', height: 220, pageSize: 8 }));
      c.children.push(glass);
      c.children.push(createNode('fab', { text: '+', action: 'compose' }));
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
  {
    id: 'mininode-shell',
    name: 'MiniNode shell',
    build() {
      const c = createNode('column', { gap: 12, pad: 12 });
      c.children.push(createNode('hero', { title: 'MiniNode', subtitle: 'Mind · Zyrion · mesh' }));
      c.children.push(createNode('mind-panel', { state: 'mindText', out: 'mindVoice' }));
      c.children.push(createNode('zyrion-panel', { state: 'zyrionEnv' }));
      c.children.push(createNode('mesh-peers', { name: 'shell', state: 'peers' }));
      return [c];
    },
  },
  {
    id: 'rest-lazy',
    name: 'REST + Lazy list',
    build() {
      const c = createNode('column', { gap: 10, pad: 12 });
      c.children.push(createNode('text', { text: 'Datos remotos', weight: 'bold', size: 16 }));
      c.children.push(createNode('loader', { state: '_loading_apiData', text: 'Cargando…' }));
      c.children.push(createNode('rest-consumer', {
        method: 'GET', url: '/v1/data', bind: 'apiData', bindPath: 'items', auto: true, loadingKey: '_loading_apiData',
      }));
      c.children.push(createNode('lazy-column', { state: 'apiData', height: 240, pageSize: 8 }));
      return [c];
    },
  },
  {
    id: 'bottom-nav-app',
    name: 'App bottom tabs',
    build() {
      const tabs = createNode('bottom-tabs', {
        tabs: 'Inicio,Buscar,Yo', icons: '⌂,⌕,☺', state: 'mainTab',
      });
      const a = createNode('column', { gap: 8, pad: 12 });
      a.children.push(createNode('hero', { title: 'Inicio', subtitle: 'Bottom navigation' }));
      const b = createNode('column', { gap: 8, pad: 12 });
      b.children.push(createNode('form-search', { state: 'q', placeholder: 'Buscar…' }));
      const c = createNode('column', { gap: 8, pad: 12 });
      c.children.push(createNode('form-login', { title: 'Perfil' }));
      tabs.children.push(a, b, c);
      return [tabs];
    },
  },
  {
    id: 'pulse-agent',
    name: 'Vista agente + pulse',
    build() {
      const c = createNode('column', { gap: 10, pad: 12 });
      const va = createNode('view-agent', { key: 'home', lifecycle: 'active' });
      va.children.push(createNode('text', { text: 'Agente key=home', weight: 'bold' }));
      c.children.push(va);
      c.children.push(createNode('pulse-consumer', { url: '/api/pulse', keys: 'home', state: 'pulseData' }));
      c.children.push(createNode('button', { text: 'Simular nav', action: 'tab-home' }));
      return [c];
    },
  },
  {
    id: 'media-player',
    name: 'Reproductor',
    build() {
      const c = createNode('column', { gap: 10, pad: 12 });
      c.children.push(createNode('text', { text: 'Multimedia', weight: 'bold', size: 17 }));
      c.children.push(createNode('video', {
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        height: 200, controls: true,
      }));
      c.children.push(createNode('audio', {
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        title: 'Audio', controls: true,
      }));
      return [c];
    },
  },
  {
    id: 'map-shell',
    name: 'Mapa',
    build() {
      const c = createNode('column', { gap: 10, pad: 12 });
      c.children.push(createNode('text', { text: 'Ubicación', weight: 'bold', size: 17 }));
      c.children.push(createNode('map', { lat: 23.1136, lng: -82.3666, height: 260, zoom: 13, label: 'La Habana' }));
      return [c];
    },
  },
  {
    id: 'shop-shell',
    name: 'Shell tienda',
    build() {
      const root = createNode('column', { gap: 0, pad: 0 });
      const top = createNode('row', { gap: 10, pad: 12 });
      top.children.push(createNode('hamburger', { state: 'drawerOpen' }));
      top.children.push(createNode('text', { text: 'Tienda', weight: 'bold', size: 17 }));
      root.children.push(top);
      const dr = createNode('drawer', { title: 'Menú', state: 'drawerOpen', open: false });
      dr.children.push(createNode('button', { text: 'Catálogo', action: 'tab-Catálogo', icon: '▣' }));
      dr.children.push(createNode('button', { text: 'Pedidos', action: 'tab-Pedidos', icon: '✎' }));
      root.children.push(dr);
      const tabs = createNode('bottom-tabs', { tabs: 'Catálogo,Pedidos', icons: '▣,✎', state: 'mainTab' });
      const cat = createNode('column', { gap: 8, pad: 12 });
      cat.children.push(createNode('lazy-column', { state: 'products', height: 200, pageSize: 5 }));
      const ped = createNode('column', { gap: 8, pad: 12 });
      ped.children.push(createNode('list', { state: 'orders', empty: 'Sin pedidos' }));
      tabs.children.push(cat, ped);
      root.children.push(tabs);
      return [root];
    },
  },,
];

export const THEME_COLORS = {
  primary: '#f4b400',
  secondary: '#5b9cf5',
  background: '#09090b',
  surface: '#161922',
  success: '#34d399',
  danger: '#f87171',
  muted: '#a1a1aa',
  text: '#f4f4f5',
};

/** Presets de tema (Chronos + Studio) */
export const THEME_PRESETS = {
  'gold-night': {
    name: 'Gold Night',
    primary: '#f4b400', secondary: '#5b9cf5', background: '#0b0e14', surface: '#12171f',
    text: '#eef1f6', muted: '#8b93a7', success: '#34d399', danger: '#f87171',
  },
  'ocean': {
    name: 'Ocean',
    primary: '#22d3ee', secondary: '#818cf8', background: '#0a1220', surface: '#111b2e',
    text: '#e8f1ff', muted: '#7a8ba8', success: '#34d399', danger: '#fb7185',
  },
  'forest': {
    name: 'Forest',
    primary: '#a3e635', secondary: '#2dd4bf', background: '#0a120e', surface: '#121f18',
    text: '#ecfdf5', muted: '#86a396', success: '#4ade80', danger: '#f87171',
  },
  'rose': {
    name: 'Rose Ember',
    primary: '#fb7185', secondary: '#fbbf24', background: '#140a10', surface: '#1f1218',
    text: '#fff1f2', muted: '#a88b93', success: '#34d399', danger: '#f43f5e',
  },
  'chronos': {
    name: 'Chronos V6',
    primary: '#FFD700', secondary: '#8B0000', background: '#050505', surface: 'rgba(255,255,255,0.05)',
    text: '#f5f5f5', muted: '#9ca3af', success: '#34d399', danger: '#ef4444',
  },
};

export const ALSET_ICONS = {
  pulse: '⚡', cpu: '▣', gear: '⚙', home: '⌂', search: '⌕', user: '☺', cart: '🛒',
  heart: '♥', star: '★', chat: '💬', bell: '🔔', lock: '🔒', unlock: '🔓',
  send: '➤', plus: '+', check: '✓', close: '✕', menu: '☰', map: '⌖',
  image: '⧉', play: '▶', pause: '❚❚', wallet: '◈', chart: '▦',
  trash: '🗑', edit: '✎', save: '💾', folder: '📁', file: '📄', link: '🔗',
  cloud: '☁', sync: '🔄', warning: '⚠', info: 'ℹ', help: '?', settings: '⚙',
  calendar: '📅', clock: '🕒', phone: '📞', mail: '✉', camera: '📷', mic: '🎤',
  video: '🎬', music: '🎵', pin: '📍', globe: '🌐', shop: '🏪', package: '📦',
  truck: '🚚', money: '💰', card: '💳', list: '☰', grid: '▦', filter: 'ӻ',
  arrowLeft: '←', arrowRight: '→', arrowUp: '↑', arrowDown: '↓',
  chevronLeft: '‹', chevronRight: '›', external: '↗', download: '↓', upload: '↑',
  logout: '⎋', login: '⏎', key: '🔑', shield: '🛡', bolt: '⚡', fire: '🔥',
  leaf: '🍃', sun: '☀', moon: '☾', eye: '👁', eyeOff: '◌', copy: '⧉',
  tag: '🏷', bookmark: '🔖', flag: '⚑', building: '🏢', users: '👥',
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
  const container = meta?.container || ['column', 'row', 'card', 'form', 'anim-fade', 'anim-slide', 'anim-scale', 'auth-gate', 'gate', 'drawer', 'side-menu', 'tabs-shell', 'bottom-tabs', 'stack', 'gradient', 'gradient-image', 'glass', 'router', 'layer', 'animate', 'carousel', 'view-agent'].includes(type);
  return {
    id: uid(),
    type,
    connector: !!(meta && meta.connector),
    props: { ...d },
    children: container ? [] : undefined,
  };
}

/** Tipos que no se pintan en la vista (solo lógica / datos). */
export const CONNECTOR_TYPES = new Set(
  CATALOG.flatMap((g) => g.items).filter((i) => i.connector).map((i) => i.type)
    .concat(['api', 'api-post', 'state', 'persist', 'rest-consumer', 'pulse-consumer', 'pulse-server-consumer', 'ipfs', 'agent'])
);

export function isConnectorNode(n) {
  if (!n) return false;
  if (n.connector) return true;
  if (CONNECTOR_TYPES.has(n.type)) return true;
  if (n.props && (n.props.silent === true || n.props.silent === 'true')) return true;
  return false;
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

  // 0) Formas de estado: no mutan el árbol aquí (las maneja AlsetLispEngine)
  const onlyState =
    /^\(\s*(get-state|set-state|swap-state|incf-state|toggle-state|when-state|states|progn)\b/i.test(text) &&
    !/\(\s*ui\b/i.test(text) &&
    !/\(\s*set-prop\b/i.test(text) &&
    !/\(\s*column\b/i.test(text);
  if (onlyState) return 0;

  // 1) set-prop patches (string | number | bool) — puede haber varias en un progn
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
        if (node && node.id === id) {
          if (!node.props) node.props = {};
          node.props[key] = val;
          n++;
        }
        if (node && node.children) walk(node.children);
      }
    };
    walk(nodes);
  }

  // 2) Full UI tree solo si el fuente EMPIEZA como UI (evita reventar el canvas con basura)
  const isFull =
    /^\(\s*ui\b/i.test(text) ||
    /^\(\s*do\b/i.test(text) ||
    (/^\(\s*column\b/i.test(text) && !/set-prop/i.test(text));
  if (isFull) {
    try {
      const built = lispTreeToNodes(text);
      if (built && built.length) {
        // Validar nodos mínimos antes de reemplazar
        const ok = built.every((x) => x && x.type && x.id);
        if (ok) {
          nodes.length = 0;
          built.forEach((x) => nodes.push(x));
          n += built.length;
        }
      }
    } catch (e) {
      console.warn('[LispAI] full tree', e);
      throw new Error('Árbol Lisp inválido: ' + (e.message || e) + ' — usa (set-prop id key "valor") para parches seguros');
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
