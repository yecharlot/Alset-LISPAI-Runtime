/**
 * Alset App Runtime — single source of truth for preview emulator + deployed PWA.
 * Renders alset-app/v1 trees with layout, device overrides, shell chrome, gestures.
 */
(function (global) {
  const THEME = {
    primary: '#f5c542',
    secondary: '#5b9cf5',
    bg: '#0b0e14',
    card: '#12171f',
    text: '#eef1f6',
    muted: '#8b93a7',
    line: '#1e2530',
    danger: '#f87171',
    ok: '#34d399',
  };

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null && text !== '') e.textContent = String(text);
    return e;
  }

  function addClass(node, ...tokens) {
    for (const tok of tokens) {
      if (tok != null && String(tok).trim() !== '') {
        try { node.classList.add(String(tok).trim()); } catch (_) {}
      }
    }
  }


  function resolveLayout(p, deviceId) {
    const base = {
      x: p.x != null ? Number(p.x) : null,
      y: p.y != null ? Number(p.y) : null,
      width: p.width != null ? Number(p.width) : null,
      height: p.height != null ? Number(p.height) : null,
    };
    const d = (p.devices && p.devices[deviceId]) || {};
    return {
      x: d.x != null ? Number(d.x) : base.x,
      y: d.y != null ? Number(d.y) : base.y,
      width: d.width != null ? Number(d.width) : base.width,
      height: d.height != null ? Number(d.height) : base.height,
      bg: d.bg || p.bg || null,
      color: d.color || p.color || null,
      radius: d.radius != null ? d.radius : p.radius,
      opacity: d.opacity != null ? d.opacity : p.opacity,
      fontSize: d.fontSize != null ? d.fontSize : p.size || p.fontSize,
    };
  }

  function applyLayout(node, p, deviceId) {
    const L = resolveLayout(p || {}, deviceId || 'mobile');
    if (L.x != null || L.y != null) {
      node.style.position = 'relative';
      if (L.x != null) node.style.left = L.x + 'px';
      if (L.y != null) node.style.top = L.y + 'px';
    }
    if (L.width != null) node.style.width = typeof L.width === 'number' ? L.width + 'px' : L.width;
    if (L.height != null) node.style.height = typeof L.height === 'number' ? L.height + 'px' : L.height;
    if (L.bg) node.style.background = L.bg;
    if (L.color) {
      const c = THEME[L.color] || L.color;
      node.style.color = c;
    }
    if (L.radius != null) node.style.borderRadius = Number(L.radius) + 'px';
    if (L.opacity != null) node.style.opacity = String(L.opacity);
    if (L.fontSize) node.style.fontSize = Number(L.fontSize) + 'px';
    return L;
  }

  function colorToken(c) {
    if (!c) return null;
    return THEME[c] || c;
  }

  /** Interactive layer: each node moves/resizes independently (live CSS, commit on pointerup). */
  function attachInteract(host, tree, deviceId, onChange) {
    if (!host || !onChange) return;
    host.querySelectorAll('[data-node-id]').forEach((box) => {
      const id = box.getAttribute('data-node-id');
      if (!id) return;
      if (box.dataset.interactBound === '1') return;
      box.dataset.interactBound = '1';
      box.style.cursor = 'grab';
      if (getComputedStyle(box).position === 'static') box.style.position = 'relative';

      box.addEventListener('pointerdown', (ev) => {
        // Only this node: ignore if event started on a deeper node with its own id
        const deepest = ev.target.closest('[data-node-id]');
        if (deepest && deepest !== box) return;
        if (ev.target.closest('.rt-handle')) return;
        if (ev.target.closest('button, input, textarea, a, select')) return;
        if (ev.button != null && ev.button !== 0) return;
        ev.stopPropagation();
        const startX = ev.clientX;
        const startY = ev.clientY;
        const p = findProps(tree, id) || {};
        const L = resolveLayout(p, deviceId);
        const ox = L.x != null ? L.x : 0;
        const oy = L.y != null ? L.y : 0;
        box.style.cursor = 'grabbing';
        box.setPointerCapture?.(ev.pointerId);
        let last = { x: ox, y: oy };
        const move = (e) => {
          const nx = Math.round(ox + (e.clientX - startX));
          const ny = Math.round(oy + (e.clientY - startY));
          last = { x: nx, y: ny };
          box.style.left = nx + 'px';
          box.style.top = ny + 'px';
          box.style.position = 'relative';
        };
        const up = () => {
          box.style.cursor = 'grab';
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          onChange(id, deviceId, last);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      });

      let handle = box.querySelector(':scope > .rt-handle');
      if (!handle) {
        handle = el('div', 'rt-handle');
        handle.title = 'Redimensionar este nodo';
        box.appendChild(handle);
      }
      handle.onpointerdown = (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        const startX = ev.clientX;
        const startY = ev.clientY;
        const p = findProps(tree, id) || {};
        const L = resolveLayout(p, deviceId);
        const ow = L.width != null ? L.width : Math.max(box.offsetWidth, 40);
        const oh = L.height != null ? L.height : Math.max(box.offsetHeight, 24);
        let last = { width: ow, height: oh };
        const move = (e) => {
          const w = Math.max(40, Math.round(ow + (e.clientX - startX)));
          const h = Math.max(24, Math.round(oh + (e.clientY - startY)));
          last = { width: w, height: h };
          box.style.width = w + 'px';
          box.style.height = h + 'px';
        };
        const up = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          onChange(id, deviceId, last);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      };
    });
  }

  function findProps(list, id) {
    for (const n of list || []) {
      if (n.id === id) return n.props || (n.props = {});
      const c = findProps(n.children, id);
      if (c) return c;
    }
    return null;
  }

  function findNode(list, id) {
    for (const n of list || []) {
      if (n.id === id) return n;
      const c = findNode(n.children, id);
      if (c) return c;
    }
    return null;
  }

  function paintNode(parent, n, ctx, depth) {
    if (!n || depth > 32) return;
    const p = n.props || {};
    const deviceId = ctx.deviceId || 'mobile';
    const log = ctx.log;
    const interactive = !!ctx.interactive;

    const wrap = el('div', 'rt-node');
    wrap.setAttribute('data-node-id', n.id || '');
    wrap.setAttribute('data-type', n.type);
    if (ctx.selectedId && n.id === ctx.selectedId) addClass(wrap, 'rt-selected');
    applyLayout(wrap, p, deviceId);

    const kids = (host) => (n.children || []).forEach((c) => paintNode(host, c, ctx, depth + 1));

    switch (n.type) {
      case 'text': {
        wrap.textContent = p.text || '';
        wrap.style.fontWeight = p.weight === 'bold' || p.weight === '700' ? '700' : '400';
        const col = colorToken(p.color);
        if (col) wrap.style.color = col;
        if (p.size) wrap.style.fontSize = Number(p.size) + 'px';
        break;
      }
      case 'button': {
        const b = el('button', 'rt-btn', p.text || 'OK');
        b.type = 'button';
        if (p.bg) b.style.background = p.bg;
        if (p.color) b.style.color = colorToken(p.color) || p.color;
        b.onclick = () => {
          log && log('action:' + (p.action || 'click'));
          ctx.emit && ctx.emit('action', { action: p.action, id: n.id });
        };
        wrap.appendChild(b);
        break;
      }
      case 'input':
      case 'textarea':
      case 'form-search': {
        const i = document.createElement(n.type === 'textarea' ? 'textarea' : 'input');
        i.className = 'rt-input';
        i.placeholder = p.placeholder || '';
        if (n.type !== 'textarea') i.type = p.type || 'text';
        if (n.type === 'textarea') i.rows = Number(p.rows) || 3;
        i.value = ctx.state?.[p.state] ?? '';
        i.oninput = () => {
          if (p.state && ctx.setState) ctx.setState(p.state, i.value);
        };
        wrap.appendChild(i);
        break;
      }
      case 'spacer':
        wrap.style.height = (Number(p.size) || 12) + 'px';
        break;
      case 'badge': {
        const s = el('span', 'rt-badge', p.text || 'BADGE');
        wrap.appendChild(s);
        break;
      }
      case 'metric': {
        addClass(wrap, 'rt-card');
        wrap.appendChild(el('div', 'rt-muted', p.title || 'KPI'));
        const v = el('div', 'rt-metric-val', String(p.value ?? ctx.state?.[p.state] ?? '—'));
        wrap.appendChild(v);
        if (p.hint) wrap.appendChild(el('div', 'rt-muted', p.hint));
        break;
      }
      case 'hero': {
        addClass(wrap, 'rt-card', 'rt-hero');
        const t = el('div', 'rt-hero-title', p.title || 'Hero');
        wrap.appendChild(t);
        if (p.subtitle) wrap.appendChild(el('div', 'rt-muted', p.subtitle));
        break;
      }
      case 'nav': {
        addClass(wrap, 'rt-row');
        const st = p.state || 'tab';
        const cur = ctx.state?.[st] || String(p.tabs || '').split(',')[0]?.trim();
        String(p.tabs || 'A,B')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((tab) => {
            const b = el('button', 'rt-tab' + (tab === cur ? ' active' : ''), tab);
            b.type = 'button';
            b.onclick = () => {
              if (ctx.setState) ctx.setState(st, tab);
              log && log('tab:' + tab);
              ctx.remount && ctx.remount();
            };
            wrap.appendChild(b);
          });
        break;
      }
      case 'tabs':
      case 'tabs-shell': {
        // Shell with tab bar + panels as children (one visible)
        addClass(wrap, 'rt-tabs-shell');
        const st = p.state || 'tab';
        const labels = String(p.tabs || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const children = n.children || [];
        const names = labels.length ? labels : children.map((_, i) => 'Tab ' + (i + 1));
        let cur = ctx.state?.[st];
        if (cur == null || names.indexOf(cur) < 0) cur = names[0];
        const bar = el('div', 'rt-row rt-tabbar');
        names.forEach((tab, i) => {
          const b = el('button', 'rt-tab' + (tab === cur ? ' active' : ''), tab);
          b.type = 'button';
          b.onclick = () => {
            if (ctx.setState) ctx.setState(st, tab);
            ctx.remount && ctx.remount();
          };
          bar.appendChild(b);
        });
        wrap.appendChild(bar);
        const panel = el('div', 'rt-tab-panel');
        const idx = Math.max(0, names.indexOf(cur));
        if (children[idx]) paintNode(panel, children[idx], ctx, depth + 1);
        wrap.appendChild(panel);
        parent.appendChild(wrap);
        return;
      }
      case 'hamburger': {
        const openKey = p.state || 'drawerOpen';
        const b = el('button', 'rt-hamburger', '☰');
        b.type = 'button';
        b.setAttribute('aria-label', 'Menú');
        b.onclick = () => {
          const cur = !!ctx.state?.[openKey];
          if (ctx.setState) ctx.setState(openKey, !cur);
          ctx.remount && ctx.remount();
          log && log('hamburger → ' + !cur);
        };
        wrap.appendChild(b);
        break;
      }
      case 'drawer':
      case 'side-menu': {
        const openKey = p.state || 'drawerOpen';
        let open = false;
        if (ctx.state && Object.prototype.hasOwnProperty.call(ctx.state, openKey)) {
          open = !!ctx.state[openKey];
        } else {
          open = p.open === true || p.open === 'true' || p.open === 1 || p.open === '1';
        }
        const side = p.side === 'right' ? 'right' : 'left';
        addClass(wrap, 'rt-drawer', open ? 'open' : null, side);
        const panel = el('div', 'rt-drawer-panel');
        panel.appendChild(el('div', 'rt-drawer-title', p.title || 'Menú'));
        kids(panel);
        const backdrop = el('div', 'rt-drawer-backdrop');
        backdrop.onclick = () => {
          if (ctx.setState) ctx.setState(openKey, false);
          ctx.remount && ctx.remount();
        };
        if (open) wrap.appendChild(backdrop);
        wrap.appendChild(panel);
        // always in DOM for swipe target
        break;
      }
      case 'splash': {
        const ms = Number(p.duration) || 1800;
        const animated = p.animated !== false && p.animated !== 'false';
        addClass(wrap, 'rt-splash', animated ? 'anim' : null);
        wrap.appendChild(el('div', 'rt-splash-title', p.title || 'Alset'));
        if (p.subtitle) wrap.appendChild(el('div', 'rt-muted', p.subtitle));
        if (p.autoHide !== false && p.autoHide !== 'false') {
          setTimeout(() => {
            addClass(wrap, 'hide');
            if (p.state && ctx.setState) ctx.setState(p.state, 'done');
          }, ms);
        }
        break;
      }
      case 'image': {
        if (p.src) {
          const img = document.createElement('img');
          img.src = p.src;
          img.alt = p.alt || '';
          img.style.maxWidth = '100%';
          img.style.maxHeight = (p.height || 120) + 'px';
          wrap.appendChild(img);
        } else wrap.appendChild(el('div', 'rt-muted', '(imagen)'));
        break;
      }
      case 'api': {
        addClass(wrap, 'rt-card');
        wrap.appendChild(el('div', 'rt-muted', 'GET ' + (p.url || '') + ' → ' + (p.state || 'apiData')));
        if (p.auto && p.url && !ctx._apiOnce?.[n.id || p.url]) {
          ctx._apiOnce = ctx._apiOnce || {};
          ctx._apiOnce[n.id || p.url] = true;
          fetch(p.url)
            .then((r) => r.json())
            .then((j) => {
              if (p.state && ctx.setState) ctx.setState(p.state, j);
              const pre = el('pre', 'rt-pre', JSON.stringify(j, null, 2));
              wrap.appendChild(pre);
              log && log('api ok');
            })
            .catch((e) => wrap.appendChild(el('div', 'rt-muted', String(e.message || e))));
        }
        break;
      }
      case 'api-post':
        wrap.appendChild(el('div', 'rt-muted', 'POST ' + (p.url || '/v1/data')));
        break;
      case 'list': {
        const data = ctx.state?.[p.state];
        addClass(wrap, 'rt-card');
        if (Array.isArray(data)) {
          data.forEach((item) => wrap.appendChild(el('div', 'rt-list-item', typeof item === 'object' ? JSON.stringify(item) : String(item))));
        } else if (data && typeof data === 'object') {
          wrap.appendChild(el('pre', 'rt-pre', JSON.stringify(data, null, 2)));
        } else wrap.appendChild(el('div', 'rt-muted', p.empty || 'Sin datos'));
        break;
      }
      case 'table': {
        const data = ctx.state?.[p.state];
        const cols = String(p.columns || 'id,name').split(',').map((s) => s.trim());
        const table = document.createElement('table');
        table.className = 'rt-table';
        const thead = document.createElement('thead');
        const hr = document.createElement('tr');
        cols.forEach((c) => hr.appendChild(el('th', '', c)));
        thead.appendChild(hr);
        table.appendChild(thead);
        const tb = document.createElement('tbody');
        const rows = Array.isArray(data) ? data : data?.items || [];
        rows.forEach((row) => {
          const tr = document.createElement('tr');
          cols.forEach((c) => tr.appendChild(el('td', '', row?.[c] != null ? String(row[c]) : '')));
          tb.appendChild(tr);
        });
        table.appendChild(tb);
        wrap.appendChild(table);
        break;
      }
      case 'form-login':
      case 'form-register':
      case 'form-contact':
      case 'login-token': {
        addClass(wrap, 'rt-card', 'rt-col');
        wrap.appendChild(el('div', 'rt-form-title', p.title || n.type));
        const fields =
          n.type === 'form-contact'
            ? [
                ['email', 'email'],
                ['msg', 'mensaje'],
              ]
            : [
                ['user', 'usuario'],
                ['pass', 'clave'],
              ];
        const vals = {};
        fields.forEach(([name, ph]) => {
          const i = document.createElement('input');
          i.className = 'rt-input';
          i.placeholder = ph;
          if (name === 'pass') i.type = 'password';
          i.oninput = () => {
            vals[name] = i.value;
          };
          wrap.appendChild(i);
        });
        const btn = el('button', 'rt-btn', p.button || 'Enviar');
        btn.type = 'button';
        btn.onclick = async () => {
          log && log(n.type + ' submit');
          if (n.type === 'login-token' || n.type === 'form-login') {
            try {
              const r = await fetch('/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: vals.user, password: vals.pass }),
              });
              const j = await r.json();
              if (!r.ok) throw new Error(j.error || 'login failed');
              if (ctx.setState) ctx.setState('session', j);
              log && log('login ok');
            } catch (e) {
              log && log('login err ' + e.message);
            }
          }
          if (n.type === 'form-contact') {
            try {
              const r = await fetch('/v1/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: vals.email, msg: vals.msg }),
              });
              const j = await r.json();
              if (ctx.setState) ctx.setState('rows', j.items || j);
              log && log('contact ok');
              ctx.remount && ctx.remount();
            } catch (e) {
              log && log('contact err ' + e.message);
            }
          }
        };
        wrap.appendChild(btn);
        break;
      }
      case 'select':
      case 'checkbox':
      case 'switch':
        wrap.appendChild(el('div', 'rt-muted', (p.label || n.type) + ' · ' + (p.options || p.state || '')));
        break;
      case 'auth-gate':
      case 'gate': {
        addClass(wrap, 'rt-card');
        const role = p.role || 'user';
        const session = ctx.state?.session || { role: 'guest' };
        const order = ['guest', 'user', 'operator', 'admin', 'master'];
        const ok = order.indexOf(String(session.role || 'guest')) >= order.indexOf(role);
        if (!ok) {
          wrap.appendChild(el('div', 'rt-muted', p.deny || 'Requiere rol: ' + role));
        } else kids(wrap);
        break;
      }
      case 'column':
      case 'row':
      case 'card':
      case 'anim-fade':
      case 'anim-slide':
      case 'anim-scale': {
        if (n.type === 'row') addClass(wrap, 'rt-row');
        else if (n.type === 'card') addClass(wrap, 'rt-card', 'rt-col');
        else addClass(wrap, 'rt-col');
        if (n.type.startsWith('anim-') && p.animated !== false) {
          const ak = 'rt-anim-' + n.type.replace('anim-', '');
          if (ak && ak !== 'rt-anim-') addClass(wrap, ak);
        }
        if (p.gap) wrap.style.gap = Number(p.gap) + 'px';
        if (p.pad) wrap.style.padding = Number(p.pad) + 'px';
        kids(wrap);
        break;
      }
      case 'state':
      case 'persist':
      case 'ipfs':
      case 'agent':
      case 'role-badge':
        wrap.appendChild(el('div', 'rt-muted', n.type + ' ' + (p.name || p.key || p.cid || '')));
        break;
      default:
        wrap.appendChild(el('div', 'rt-muted', String(n.type)));
        kids(wrap);
    }

    parent.appendChild(wrap);
  }

  function injectStyles(doc) {
    if (doc.getElementById('alset-rt-css')) return;
    const s = doc.createElement('style');
    s.id = 'alset-rt-css';
    s.textContent = `
.rt-frame{margin:0 auto;border:1px solid ${THEME.line};border-radius:20px;background:#0a0d12;overflow:hidden;position:relative;touch-action:pan-y}
.rt-label{font-size:10px;color:${THEME.muted};padding:8px 12px;border-bottom:1px solid ${THEME.line}}
.rt-host{padding:12px;min-height:80px;color:${THEME.text};position:relative;overflow:auto}
.rt-node{box-sizing:border-box;max-width:100%}
.rt-selected{outline:2px solid ${THEME.primary}!important;outline-offset:2px}
.rt-handle{position:absolute;right:0;bottom:0;width:14px;height:14px;background:${THEME.primary};border-radius:2px 0 4px 0;cursor:nwse-resize;z-index:5}
.rt-col{display:flex;flex-direction:column;gap:8px;width:100%}
.rt-row{display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;align-items:center}
.rt-card{background:${THEME.card};border:1px solid ${THEME.line};border-radius:12px;padding:12px}
.rt-btn{appearance:none;border:0;background:${THEME.primary};color:#111;font-weight:700;padding:10px 16px;border-radius:10px;cursor:pointer}
.rt-input{width:100%;padding:10px;border-radius:8px;border:1px solid #2a3344;background:#0a0d12;color:#fff;box-sizing:border-box}
.rt-muted{font-size:12px;color:${THEME.muted}}
.rt-metric-val{font-size:22px;font-weight:700;color:${THEME.primary};margin-top:4px}
.rt-hero-title{font-size:22px;font-weight:800;color:${THEME.primary}}
.rt-form-title{font-weight:700;font-size:15px;margin-bottom:4px}
.rt-badge{display:inline-block;padding:2px 8px;border-radius:999px;background:rgba(52,211,153,.15);color:${THEME.ok};font-size:11px;font-weight:700}
.rt-tab{appearance:none;border:1px solid ${THEME.line};background:transparent;color:${THEME.muted};padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px}
.rt-tab.active{color:${THEME.primary};border-color:rgba(245,197,66,.45);background:rgba(245,197,66,.08)}
.rt-tabbar{margin-bottom:8px}
.rt-pre{font-size:10px;color:${THEME.muted};white-space:pre-wrap;margin:6px 0 0}
.rt-table{width:100%;border-collapse:collapse;font-size:12px}
.rt-table th,.rt-table td{border:1px solid ${THEME.line};padding:6px 8px;text-align:left}
.rt-hamburger{appearance:none;border:0;background:${THEME.card};color:${THEME.text};font-size:22px;width:44px;height:44px;border-radius:10px;cursor:pointer}
.rt-drawer{position:relative;min-height:0}
.rt-drawer-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:40}
.rt-drawer-panel{position:fixed;top:0;bottom:0;width:min(280px,82vw);background:#12171f;z-index:50;padding:16px;box-shadow:0 0 40px rgba(0,0,0,.5);transform:translateX(-105%);transition:transform .28s ease}
.rt-drawer.right .rt-drawer-panel{right:0;left:auto;transform:translateX(105%)}
.rt-drawer.open .rt-drawer-panel{transform:translateX(0)}
.rt-drawer-title{font-weight:700;color:${THEME.primary};margin-bottom:12px}
.rt-splash{position:absolute;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;background:${THEME.bg};transition:opacity .4s,visibility .4s}
.rt-splash.anim .rt-splash-title{animation:rtPop .6s ease}
.rt-splash.hide{opacity:0;visibility:hidden;pointer-events:none}
.rt-splash-title{font-size:28px;font-weight:800;color:${THEME.primary}}
.rt-anim-fade{animation:rtFade .4s ease}
.rt-anim-slide{animation:rtSlide .45s ease}
.rt-anim-scale{animation:rtScale .4s ease}
@keyframes rtFade{from{opacity:0}to{opacity:1}}
@keyframes rtSlide{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes rtScale{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}
@keyframes rtPop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}
.rt-gesture-hint{position:absolute;bottom:8px;left:8px;right:8px;font-size:10px;color:${THEME.muted};pointer-events:none;opacity:.7}
`;
    doc.head.appendChild(s);
  }

  function bindGestures(frame, ctx) {
    let startX = 0,
      startY = 0;
    frame.addEventListener(
      'touchstart',
      (e) => {
        const t = e.changedTouches[0];
        startX = t.clientX;
        startY = t.clientY;
      },
      { passive: true }
    );
    frame.addEventListener(
      'touchend',
      (e) => {
        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
          // swipe open/close drawer
          if (dx > 0) {
            if (ctx.setState) ctx.setState(ctx.drawerState || 'drawerOpen', true);
            ctx.log && ctx.log('gesto: swipe → abrir menú');
          } else {
            if (ctx.setState) ctx.setState(ctx.drawerState || 'drawerOpen', false);
            ctx.log && ctx.log('gesto: swipe ← cerrar menú');
          }
          ctx.remount && ctx.remount();
        }
        if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
          ctx.log && ctx.log('gesto: pull-down (refresh simulado)');
          ctx.emit && ctx.emit('pull-refresh', {});
        }
      },
      { passive: true }
    );
  }

  /**
   * Mount app into host.
   * opts: { device, tree, states, interactive, selectedId, onLayoutChange, log, showChrome }
   */
  function mount(host, opts) {
    if (!host) return null;
    injectStyles(host.ownerDocument || document);
    const device = opts.device || { id: 'mobile', label: 'Móvil', width: 390, height: 720 };
    const state = { ...(opts.states || {}) };
    const ctx = {
      deviceId: device.id || 'mobile',
      state,
      log: opts.log,
      interactive: !!opts.interactive,
      selectedId: opts.selectedId || null,
      drawerState: 'drawerOpen',
      _apiOnce: {},
      setState(k, v) {
        state[k] = v;
      },
      emit: opts.onEvent,
      remount: null,
    };

    function paint() {
      host.innerHTML = '';
      const frame = el('div', 'rt-frame');
      frame.style.width = (device.width || 390) + 'px';
      frame.style.maxWidth = '100%';
      frame.style.minHeight = Math.min(device.height || 640, 640) + 'px';
      frame.style.overflow = 'hidden';
      const label = el(
        'div',
        'rt-label',
        `${device.label || device.id} · ${device.width}px` + (opts.interactive ? ' · emulador (arrastrar · esquina = tamaño)' : ' · PWA')
      );
      const root = el('div', 'rt-host');
      root.style.minHeight = Math.min((device.height || 640) - 40, 560) + 'px';
      frame.appendChild(label);
      frame.appendChild(root);
      if (opts.interactive) {
        const hint = el('div', 'rt-gesture-hint', 'Gestos: swipe → menú · pull ↓ refresh · arrastra nodo · esquina ↘ resize');
        frame.appendChild(hint);
      }
      host.appendChild(frame);

      const tree = opts.tree || [];
      if (!tree.length) root.appendChild(el('div', 'rt-muted', 'Árbol vacío'));
      else tree.forEach((n) => paintNode(root, n, ctx, 0));

      bindGestures(frame, ctx);
      if (opts.interactive && opts.onLayoutChange) {
        attachInteract(root, tree, ctx.deviceId, opts.onLayoutChange);
      }
      return frame;
    }

    ctx.remount = () => paint();
    paint();
    return {
      getState: () => ({ ...state }),
      remount: () => paint(),
      setSelected(id) {
        ctx.selectedId = id;
        paint();
      },
    };
  }

  global.AlsetAppRuntime = { mount, THEME, resolveLayout, findNode, findProps };
})(typeof window !== 'undefined' ? window : globalThis);
