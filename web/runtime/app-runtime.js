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

  
const CONNECTOR_TYPES = new Set(['api','api-post','state','persist','rest-consumer','pulse-consumer','pulse-server-consumer','ipfs','agent','mcp-agent']);
function isConnectorType(type, props) {
  if (CONNECTOR_TYPES.has(type)) return true;
  if (props && (props.silent === true || props.silent === 'true')) return true;
  return false;
}
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


  function numOrNull(v) {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return n;
  }

  function resolveLayout(p, deviceId) {
    p = p || {};
    const d = (p.devices && p.devices[deviceId]) || {};
    // Prefer device override; treat "" / NaN / missing as unset (never force 0x0 boxes)
    const pick = (key) => {
      if (Object.prototype.hasOwnProperty.call(d, key) && d[key] !== '' && d[key] != null) {
        return numOrNull(d[key]);
      }
      if (Object.prototype.hasOwnProperty.call(p, key) && p[key] !== '' && p[key] != null) {
        return numOrNull(p[key]);
      }
      return null;
    };
    return {
      x: pick('x'),
      y: pick('y'),
      width: pick('width'),
      height: pick('height'),
      bg: d.bg || p.bg || null,
      color: d.color || p.color || null,
      radius: pick('radius'),
      opacity: pick('opacity'),
      fontSize: pick('fontSize') != null ? pick('fontSize') : (p.size != null ? numOrNull(p.size) : null),
    };
  }

  function applyLayout(node, p, deviceId, maxW) {
    const L = resolveLayout(p || {}, deviceId || 'mobile');
    if (L.x != null || L.y != null) {
      node.style.position = 'relative';
      if (L.x != null) node.style.left = L.x + 'px';
      if (L.y != null) node.style.top = L.y + 'px';
    }
    if (L.width != null && L.width > 0) {
      let w = L.width;
      if (typeof w === 'number' && maxW && w > maxW) w = maxW - 8;
      node.style.width = typeof w === 'number' ? w + 'px' : w;
      node.style.maxWidth = '100%';
    }
    if (L.height != null && L.height > 0) {
      node.style.height = typeof L.height === 'number' ? L.height + 'px' : L.height;
    }
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
        let moved = false;
        const move2 = (e) => {
          moved = true;
          move(e);
        };
        const up = () => {
          box.style.cursor = 'grab';
          window.removeEventListener('pointermove', move2);
          window.removeEventListener('pointerup', up);
          if (moved) onChange(id, deviceId, last);
        };
        window.addEventListener('pointermove', move2);
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

        if (isConnectorType(n.type, n.props || {})) {
          wrap.classList.add('rt-connector');
          wrap.dataset.connector = '1';
          wrap.style.cssText = 'display:none!important;height:0;width:0;margin:0;padding:0;overflow:hidden;border:0;position:absolute;pointer-events:none';
        }
    wrap.setAttribute('data-node-id', n.id || '');
    wrap.setAttribute('data-type', n.type);
    const nodeKey = p.key || p.agentKey || n.id || '';
    if (nodeKey) {
      wrap.setAttribute('data-key', String(nodeKey));
      ctx.keyIndex = ctx.keyIndex || {};
      ctx.keyIndex[String(nodeKey)] = { id: n.id, type: n.type, props: p };
    }
    if (ctx.selectedId && n.id === ctx.selectedId) addClass(wrap, 'rt-selected');
    applyLayout(wrap, p, deviceId, ctx.deviceWidth);

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
        const variant = p.variant || (p.drawerItem ? 'drawer' : 'default');
        const b = el('button', variant === 'drawer' ? 'rt-drawer-item' : 'rt-btn', p.text || 'OK');
        b.type = 'button';
        if (p.icon) {
          b.textContent = '';
          const ic = el('span', 'rt-drawer-item-icon', p.icon);
          b.appendChild(ic);
          b.appendChild(document.createTextNode(' ' + (p.text || 'OK')));
        }
        if (p.bg) b.style.background = p.bg;
        if (p.color) b.style.color = colorToken(p.color) || p.color;
        b.onclick = () => {
          const action = String(p.action || 'click');
          log && log('action:' + action);
          // Cerrar drawers abiertos
          if (ctx.setState && ctx.state) {
            Object.keys(ctx.state).forEach((k) => {
              if (/drawer/i.test(k) && ctx.state[k] === true) ctx.setState(k, false);
            });
          }
          // Navegación: nav-home / route-shop / tab-Pedidos
          if (/^(nav|route|tab)-/i.test(action)) {
            const val = action.replace(/^(nav|route|tab)-/i, '');
            if (ctx.setState) {
              ctx.setState(p.routeState || 'route', val);
              ctx.setState(p.tabState || 'mainTab', val);
              if (p.state) ctx.setState(p.state, val);
            }
          }
          // setState explícito: setState + setValue
          if (p.setState != null && ctx.setState) {
            const op = String(p.setOp || p.op || '').toLowerCase();
            let v = p.setValue;
            if (v === 'true') v = true;
            else if (v === 'false') v = false;
            else if (v != null && v !== '' && !Number.isNaN(Number(v)) && typeof v !== 'boolean') v = Number(v);
            if (op === 'incf' || op === 'inc' || op === '+') {
              const cur = Number(ctx.state?.[p.setState]) || 0;
              const d = (v != null && v !== '') ? Number(v) || 1 : 1;
              ctx.setState(p.setState, cur + d);
            } else if (op === 'decf' || op === 'dec' || op === '-') {
              const cur = Number(ctx.state?.[p.setState]) || 0;
              const d = (v != null && v !== '') ? Number(v) || 1 : 1;
              ctx.setState(p.setState, cur - d);
            } else if (op === 'toggle') {
              ctx.setState(p.setState, !ctx.state?.[p.setState]);
            } else if (op === 'push' && Array.isArray(ctx.state?.[p.setState])) {
              const arr = (ctx.state[p.setState] || []).slice();
              arr.push(v);
              ctx.setState(p.setState, arr);
            } else {
              ctx.setState(p.setState, v);
            }
          }
          // Lisp inline: action comienza con lisp:  o prop lisp
          const lispCmd = p.lisp || (String(p.action || '').startsWith('lisp:') ? String(p.action).slice(5) : '');
          if (lispCmd && typeof window !== 'undefined' && window.AlsetLispEngine) {
            try {
              window.AlsetLispEngine.eval(lispCmd, {
                getState: (k) => ctx.state?.[k],
                setState: (k, val) => ctx.setState && ctx.setState(k, val),
                dump: () => ({ ...(ctx.state || {}) }),
                remount: () => ctx.remount && ctx.remount(),
              });
            } catch (e) { log && log('lisp action err ' + e); }
          }
          ctx.emit && ctx.emit('action', { action, id: n.id, text: p.text });
          ctx.remount && ctx.remount();
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
        // Placeholder in tree flow (no layout impact); real UI is portaled into frame
        addClass(wrap, 'rt-drawer');
        wrap.style.height = '0';
        wrap.style.minHeight = '0';
        wrap.style.margin = '0';
        wrap.style.padding = '0';
        wrap.style.overflow = 'visible';
        if (open && ctx.overlayRoot) {
          const layer = el('div', 'rt-drawer-layer open' + (side === 'right' ? ' right' : ''));
          const backdrop = el('div', 'rt-drawer-backdrop');
          backdrop.onclick = () => {
            if (ctx.setState) ctx.setState(openKey, false);
            ctx.remount && ctx.remount();
          };
          const panel = el('div', 'rt-drawer-panel');
          const head = el('div', 'rt-drawer-head');
          head.appendChild(el('div', 'rt-drawer-avatar', (p.title || 'A').slice(0, 1).toUpperCase()));
          const headTxt = el('div', 'rt-drawer-head-text');
          headTxt.appendChild(el('div', 'rt-drawer-title', p.title || 'Menú'));
          headTxt.appendChild(el('div', 'rt-muted', p.subtitle || 'Navegación'));
          head.appendChild(headTxt);
          panel.appendChild(head);
          const nav = el('div', 'rt-drawer-nav');
          // Render children as drawer items when they are buttons
          (n.children || []).forEach((c) => {
            if (c && c.type === 'button') {
              const cp = Object.assign({}, c.props || {}, { drawerItem: true, variant: 'drawer' });
              paintNode(nav, Object.assign({}, c, { props: cp }), ctx, depth + 1);
            } else {
              paintNode(nav, c, ctx, depth + 1);
            }
          });
          panel.appendChild(nav);
          layer.appendChild(backdrop);
          layer.appendChild(panel);
          ctx.overlayRoot.appendChild(layer);
        }
        break;
      }
      case 'splash': {
        const ms = Number(p.duration) || 1800;
        const animated = p.animated !== false && p.animated !== 'false';
        const doneKey = p.state || 'splash';
        if (ctx.state && ctx.state[doneKey] === 'done') {
          wrap.style.display = 'none';
          break;
        }
        wrap.style.display = 'none';
        const target = ctx.overlayRoot || ctx.frame || wrap;
        const layer = el('div', 'rt-splash' + (animated ? ' anim' : ''));
        const from = p.from || THEME.bg;
        const to = p.to || '#1a1430';
        layer.style.backgroundImage = `linear-gradient(160deg, ${from}, ${to})`;
        if (p.icon) {
          const icons = { pulse:'⚡', cpu:'▣', gear:'⚙', star:'★' };
          layer.appendChild(el('div', 'rt-splash-icon', icons[p.icon] || '⚡'));
        }
        layer.appendChild(el('div', 'rt-splash-title', p.title || 'Alset'));
        if (p.subtitle) layer.appendChild(el('div', 'rt-muted', p.subtitle));
        if (p.spinner !== false && p.spinner !== 'false') {
          layer.appendChild(el('div', 'rt-spinner'));
        }
        target.appendChild(layer);
        if (p.autoHide !== false && p.autoHide !== 'false') {
          setTimeout(() => {
            addClass(layer, 'hide');
            if (ctx.setState) ctx.setState(doneKey, 'done');
            setTimeout(() => { try { layer.remove(); } catch (_) {} }, 450);
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
      case 'api':
      case 'api-post':
      case 'rest-consumer':
      case 'api-rest': {
        const method = String(p.method || (n.type === 'api-post' ? 'POST' : 'GET')).toUpperCase();
        const urlBase = p.url || '/v1/data';
        const bind = p.bind || p.state || 'apiData';
        const path = p.bindPath || p.path || '';
        const showRaw = p.showRaw !== false;
        addClass(wrap, 'rt-card', 'rt-rest');
        wrap.appendChild(el('div', 'rt-muted', method + ' ' + urlBase + (path ? ' → ' + bind + '.' + path : ' → ' + bind)));
        const run = () => {
          if (ctx.setState) ctx.setState(p.loadingKey || '_loading_' + bind, true);
          let url = urlBase;
          // Query params from state object or prop
          const q = p.queryState && ctx.state?.[p.queryState];
          if (q && typeof q === 'object') {
            const qs = new URLSearchParams();
            Object.keys(q).forEach((k) => { if (q[k] != null && q[k] !== '') qs.set(k, String(q[k])); });
            const s = qs.toString();
            if (s) url += (url.includes('?') ? '&' : '?') + s;
          } else if (p.query) {
            url += (url.includes('?') ? '&' : '?') + String(p.query);
          }
          const opts = { method, headers: { Accept: 'application/json' } };
          if (p.tokenState && ctx.state?.[p.tokenState]) {
            opts.headers.Authorization = 'Bearer ' + ctx.state[p.tokenState];
          } else if (p.token) opts.headers.Authorization = 'Bearer ' + p.token;
          if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
            let body = p.body != null ? p.body : (p.bodyState ? ctx.state?.[p.bodyState] : null);
            if (typeof body === 'string') {
              try { body = JSON.parse(body); } catch (_) {}
            }
            if (body != null && method !== 'GET') {
              opts.headers['Content-Type'] = 'application/json';
              opts.body = typeof body === 'string' ? body : JSON.stringify(body);
            }
          }
          fetch(url, opts)
            .then(async (r) => {
              const text = await r.text();
              let j;
              try { j = JSON.parse(text); } catch (_) { j = { raw: text, status: r.status }; }
              let data = j;
              if (path) {
                path.split('.').forEach((k) => { if (data && typeof data === 'object') data = data[k]; });
              }
              if (p.bindPath === 'items' && j && Array.isArray(j.items)) data = j.items;
              if (ctx.setState) {
                ctx.setState(bind, data);
                ctx.setState(p.loadingKey || '_loading_' + bind, false);
                if (p.statusState) ctx.setState(p.statusState, r.status);
              }
              log && log('rest ' + method + ' ' + r.status);
              ctx.remount && ctx.remount();
            })
            .catch((e) => {
              if (ctx.setState) ctx.setState(p.loadingKey || '_loading_' + bind, false);
              wrap.appendChild(el('div', 'rt-muted', String(e.message || e)));
              log && log('rest err ' + e);
            });
        };
        const b = el('button', 'rt-btn', p.buttonText || (method === 'GET' ? 'Cargar' : 'Enviar'));
        b.type = 'button';
        b.onclick = () => run();
        wrap.appendChild(b);
        const autoKey = n.id || urlBase + method;
        if (p.auto && !ctx._apiOnce?.[autoKey]) {
          ctx._apiOnce = ctx._apiOnce || {};
          ctx._apiOnce[autoKey] = true;
          setTimeout(run, 30);
        }
        if (showRaw && ctx.state?.[bind] != null) {
          const val = ctx.state[bind];
          if (Array.isArray(val)) wrap.appendChild(el('div', 'rt-muted', val.length + ' ítems en «' + bind + '»'));
          else wrap.appendChild(el('pre', 'rt-pre', JSON.stringify(val, null, 2).slice(0, 800)));
        }
        break;
      }
      case 'list': {
        let data = ctx.state?.[p.state];
        if (data && typeof data === 'object' && !Array.isArray(data) && Array.isArray(data.items)) data = data.items;
        addClass(wrap, 'rt-card');
        const titleF = p.itemTitle || p.titleField || 'name';
        const subF = p.itemSubtitle || p.subtitleField || 'description';
        const metaF = p.itemMeta || p.metaField || '';
        if (Array.isArray(data)) {
          if (!data.length) wrap.appendChild(el('div', 'rt-muted', p.empty || 'Sin datos'));
          data.forEach((item, idx) => {
            const row = el('div', 'rt-list-item');
            row.style.cssText = 'padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer';
            if (item != null && typeof item === 'object') {
              const title = item[titleF] ?? item.title ?? item.name ?? item.id ?? ('#' + idx);
              const sub = subF ? (item[subF] ?? item.description ?? item.subtitle ?? '') : '';
              const meta = metaF ? (item[metaF] ?? '') : '';
              const tEl = el('div', '', String(title));
              tEl.style.cssText = 'font-weight:600;color:#f4f4f5';
              row.appendChild(tEl);
              if (sub !== '' && sub != null) {
                const sEl = el('div', 'rt-muted', String(sub));
                sEl.style.fontSize = '12px';
                row.appendChild(sEl);
              }
              if (meta !== '' && meta != null) {
                const mEl = el('div', '', String(meta));
                mEl.style.cssText = 'font-size:12px;color:#f5c542;margin-top:2px';
                row.appendChild(mEl);
              }
            } else {
              row.textContent = String(item);
            }
            row.onclick = () => {
              if (p.selectState && ctx.setState) {
                ctx.setState(p.selectState, item);
                ctx.remount && ctx.remount();
              }
              ctx.emit && ctx.emit('action', { action: p.itemAction || 'select-item', item, index: idx });
            };
            wrap.appendChild(row);
          });
        } else if (data && typeof data === 'object') {
          wrap.appendChild(el('pre', 'rt-pre', JSON.stringify(data, null, 2).slice(0, 1200)));
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
      case 'select': {
        if (p.label) wrap.appendChild(el('div', 'rt-muted', p.label));
        const sel = document.createElement('select');
        sel.className = 'rt-select';
        const opts = String(p.options || 'A,B,C').split(',').map((s) => s.trim()).filter(Boolean);
        const stKey = p.state || 'choice';
        let cur = ctx.state?.[stKey];
        if (cur == null || cur === '') cur = opts[0] || '';
        opts.forEach((o) => {
          const opt = document.createElement('option');
          opt.value = o;
          opt.textContent = o;
          if (o === String(cur)) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.onchange = () => {
          if (ctx.setState) ctx.setState(stKey, sel.value);
          ctx.emit && ctx.emit('change', { state: stKey, value: sel.value });
          log && log('select ' + stKey + '=' + sel.value);
        };
        wrap.appendChild(sel);
        break;
      }
      case 'checkbox':
      case 'switch': {
        const stKey = p.state || 'flag';
        const row = el('div', 'rt-row');
        row.style.gap = '10px';
        const lab = el('label', 'rt-muted', p.label || n.type);
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!ctx.state?.[stKey];
        input.onchange = () => {
          if (ctx.setState) ctx.setState(stKey, input.checked);
          ctx.remount && ctx.remount();
        };
        row.appendChild(input);
        row.appendChild(lab);
        wrap.appendChild(row);
        break;
      }
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
      case 'icon': {
        const name = p.name || 'pulse';
        const icons = { pulse:'⚡', cpu:'▣', gear:'⚙', home:'⌂', search:'⌕', user:'☺', bell:'🔔', send:'➤', plus:'+', check:'✓', wallet:'◈', chart:'▦', star:'★', lock:'🔒', menu:'☰' };
        const ic = el('span', 'rt-icon', icons[name] || '◇');
        ic.style.fontSize = (Number(p.size) || 22) + 'px';
        if (p.color) ic.style.color = colorToken(p.color) || p.color;
        wrap.appendChild(ic);
        break;
      }
      case 'gradient': {
        const from = p.from || '#12171f';
        const to = p.to || THEME.primary;
        const angle = Number(p.angle) || 135;
        addClass(wrap, 'rt-gradient');
        wrap.style.backgroundImage = `linear-gradient(${angle}deg, ${from}, ${to})`;
        wrap.style.padding = (Number(p.pad) || 14) + 'px';
        wrap.style.borderRadius = '14px';
        wrap.style.gap = '8px';
        wrap.style.display = 'flex';
        wrap.style.flexDirection = 'column';
        kids(wrap);
        break;
      }
      case 'gradient-image': {
        addClass(wrap, 'rt-grad-img');
        wrap.style.position = 'relative';
        wrap.style.height = (Number(p.height) || 160) + 'px';
        wrap.style.borderRadius = '14px';
        wrap.style.overflow = 'hidden';
        if (p.src) {
          const img = document.createElement('img');
          img.src = p.src;
          img.alt = p.title || '';
          img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
          wrap.appendChild(img);
        }
        const overlay = el('div', 'rt-grad-img-overlay');
        const from = p.from || 'transparent';
        const to = p.to || 'rgba(0,0,0,0.8)';
        overlay.style.backgroundImage = `linear-gradient(to top, ${to}, ${from})`;
        if (p.title) {
          const tit = el('div', 'rt-hero-title', p.title);
          tit.style.position = 'relative';
          tit.style.zIndex = '1';
          overlay.appendChild(tit);
        }
        kids(overlay);
        wrap.appendChild(overlay);
        break;
      }
      case 'glass': {
        addClass(wrap, 'rt-glass', 'rt-col');
        if (p.pad) wrap.style.padding = Number(p.pad) + 'px';
        if (p.gap) wrap.style.gap = Number(p.gap) + 'px';
        kids(wrap);
        break;
      }
      case 'fab':
      case 'floating-button': {
        const b = el('button', 'rt-fab', p.text || '+');
        b.type = 'button';
        b.onclick = () => {
          log && log('fab:' + (p.action || 'click'));
          ctx.emit && ctx.emit('action', { action: p.action });
        };
        wrap.appendChild(b);
        wrap.style.display = 'flex';
        wrap.style.justifyContent = 'flex-end';
        break;
      }
      case 'lazy-column':
      case 'lazy-row': {
        const stKey = p.state || 'items';
        let items = ctx.state?.[stKey];
        if (!Array.isArray(items) || !items.length) {
          // seed demo data for studio
          const n = Number(p.pageSize) || 8;
          items = Array.from({ length: n }, (_, i) => ({
            id: i + 1,
            title: (p.itemLabel || 'Ítem') + ' ' + (i + 1),
            subtitle: 'alsetState · página demo',
          }));
          if (ctx.setState) ctx.setState(stKey, items);
        }
        const isRow = n.type === 'lazy-row';
        addClass(wrap, isRow ? 'rt-lazy-row' : 'rt-lazy-col');
        wrap.style.height = (Number(p.height) || (isRow ? 56 : 240)) + 'px';
        wrap.style.overflow = 'auto';
        wrap.style.display = 'flex';
        wrap.style.flexDirection = isRow ? 'row' : 'column';
        wrap.style.gap = '8px';
        if (!items.length) {
          wrap.appendChild(el('div', 'rt-muted', p.empty || 'Sin ítems'));
        } else {
          items.forEach((it, i) => {
            const card = el('div', isRow ? 'rt-chip' : 'rt-card');
            if (typeof it === 'string') card.textContent = it;
            else {
              card.appendChild(el('div', '', it.title || it.name || ('#' + (it.id || i))));
              if (it.subtitle) card.appendChild(el('div', 'rt-muted', it.subtitle));
            }
            wrap.appendChild(card);
          });
        }
        wrap.onscroll = () => {
          const nearEnd = isRow
            ? wrap.scrollLeft + wrap.clientWidth >= wrap.scrollWidth - 40
            : wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 40;
          if (nearEnd && ctx.setState) {
            const more = Array.from({ length: Number(p.pageSize) || 4 }, (_, i) => ({
              id: items.length + i + 1,
              title: (p.itemLabel || 'Ítem') + ' ' + (items.length + i + 1),
              subtitle: 'cargado al scroll',
            }));
            const next = items.concat(more);
            ctx.setState(stKey, next);
            ctx.remount && ctx.remount();
            log && log('lazy load +' + more.length);
          }
        };
        break;
      }
      case 'router': {
        const stKey = p.state || 'route';
        const routes = String(p.routes || 'home,shop,me').split(',').map((s) => s.trim()).filter(Boolean);
        let cur = ctx.state?.[stKey] || routes[0];
        if (!routes.includes(cur)) cur = routes[0];
        addClass(wrap, 'rt-col');
        wrap.style.gap = '10px';
        const bar = el('div', 'rt-row rt-tabbar');
        routes.forEach((r, i) => {
          const b = el('button', 'rt-tab' + (r === cur ? ' active' : ''), r);
          b.type = 'button';
          b.onclick = () => {
            if (ctx.setState) ctx.setState(stKey, r);
            ctx.remount && ctx.remount();
            log && log('route:' + r);
          };
          bar.appendChild(b);
        });
        wrap.appendChild(bar);
        const idx = Math.max(0, routes.indexOf(cur));
        const child = (n.children || [])[idx];
        const pane = el('div', 'rt-col');
        if (child) paintNode(pane, child, ctx, depth + 1);
        else pane.appendChild(el('div', 'rt-muted', 'Ruta vacía: ' + cur));
        wrap.appendChild(pane);
        break;
      }
      case 'toast': {
        const b = el('button', 'rt-btn', 'Mostrar toast');
        b.type = 'button';
        b.onclick = () => {
          const toast = el('div', 'rt-toast');
          toast.textContent = p.text || 'Listo';
          const host = ctx.overlayRoot || ctx.frame || wrap;
          host.appendChild(toast);
          setTimeout(() => { try { toast.remove(); } catch (_) {} }, Number(p.duration) || 2200);
        };
        wrap.appendChild(b);
        break;
      }
      case 'theme-chip': {
        const name = p.theme || 'gold-night';
        wrap.appendChild(el('div', 'rt-badge', 'theme · ' + name));
        break;
      }

      case 'bottom-tabs': {
        // Mobile bottom navigation — panes as children
        const st = p.state || 'mainTab';
        const labels = String(p.tabs || 'Inicio,Buscar,Carrito,Yo')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const icons = String(p.icons || '⌂,⌕,▣,☺')
          .split(',')
          .map((s) => s.trim());
        const children = n.children || [];
        let cur = ctx.state?.[st];
        if (cur == null || labels.indexOf(cur) < 0) cur = labels[0];
        addClass(wrap, 'rt-bottom-shell');
        const content = el('div', 'rt-bottom-content');
        const idx = Math.max(0, labels.indexOf(cur));
        if (children[idx]) paintNode(content, children[idx], ctx, depth + 1);
        else content.appendChild(el('div', 'rt-muted', 'Vista: ' + cur));
        wrap.appendChild(content);
        const bar = el('div', 'rt-bottom-bar');
        labels.forEach((lab, i) => {
          const item = el('button', 'rt-bottom-item' + (lab === cur ? ' active' : ''));
          item.type = 'button';
          item.appendChild(el('span', 'rt-bottom-icon', icons[i] || '•'));
          item.appendChild(el('span', 'rt-bottom-label', lab));
          item.onclick = () => {
            if (ctx.setState) ctx.setState(st, lab);
            ctx.remount && ctx.remount();
            log && log('bottom-tab:' + lab);
          };
          bar.appendChild(item);
        });
        wrap.appendChild(bar);
        break;
      }
      case 'stack': {
        // Show one child by index/name in state
        const st = p.state || 'stack';
        const children = n.children || [];
        let cur = ctx.state?.[st];
        if (typeof cur === 'string') {
          const found = children.findIndex((c) => (c.props && (c.props.name === cur || c.props.title === cur)));
          cur = found >= 0 ? found : 0;
        }
        cur = Number(cur) || 0;
        if (cur < 0 || cur >= children.length) cur = 0;
        addClass(wrap, 'rt-stack');
        if (p.animated !== false) addClass(wrap, 'rt-stack-anim');
        if (children[cur]) paintNode(wrap, children[cur], ctx, depth + 1);
        break;
      }
      case 'shape': {
        const kind = p.kind || p.variant || 'rounded';
        addClass(wrap, 'rt-shape', 'rt-shape-' + kind);
        if (p.size) {
          const s = Number(p.size) || 64;
          wrap.style.width = s + 'px';
          wrap.style.height = s + 'px';
        }
        if (p.width) wrap.style.width = (typeof p.width === 'number' ? p.width + 'px' : p.width);
        if (p.height) wrap.style.height = (typeof p.height === 'number' ? p.height + 'px' : p.height);
        if (p.color) wrap.style.background = colorToken(p.color) || p.color;
        else if (p.from && p.to) wrap.style.backgroundImage = `linear-gradient(135deg, ${p.from}, ${p.to})`;
        else wrap.style.background = THEME.primary;
        if (p.text) {
          wrap.style.display = 'flex';
          wrap.style.alignItems = 'center';
          wrap.style.justifyContent = 'center';
          wrap.appendChild(el('span', '', p.text));
        }
        kids(wrap);
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

      case 'carousel': {
        const children = n.children || [];
        let idx = Number(ctx.state?.[p.state || 'carouselIdx'] || 0) || 0;
        if (idx < 0) idx = 0;
        if (idx >= children.length) idx = Math.max(0, children.length - 1);
        addClass(wrap, 'rt-carousel');
        if (p.animated !== false) addClass(wrap, 'rt-carousel-anim');
        const stage = el('div', 'rt-carousel-stage');
        if (children[idx]) paintNode(stage, children[idx], ctx, depth + 1);
        else stage.appendChild(el('div', 'rt-muted', 'Sin diapositivas'));
        wrap.appendChild(stage);
        const ctrl = el('div', 'rt-carousel-ctrl');
        const prev = el('button', 'rt-btn', '‹');
        prev.type = 'button';
        prev.onclick = () => {
          const next = (idx - 1 + Math.max(children.length, 1)) % Math.max(children.length, 1);
          if (ctx.setState) ctx.setState(p.state || 'carouselIdx', next);
          ctx.remount && ctx.remount();
        };
        const next = el('button', 'rt-btn', '›');
        next.type = 'button';
        next.onclick = () => {
          const nidx = (idx + 1) % Math.max(children.length, 1);
          if (ctx.setState) ctx.setState(p.state || 'carouselIdx', nidx);
          ctx.remount && ctx.remount();
        };
        ctrl.appendChild(prev);
        ctrl.appendChild(el('span', 'rt-muted', (idx + 1) + ' / ' + Math.max(children.length, 1)));
        ctrl.appendChild(next);
        wrap.appendChild(ctrl);
        // autoplay
        if (p.autoplay && children.length > 1 && !ctx._carouselTimer?.[n.id]) {
          ctx._carouselTimer = ctx._carouselTimer || {};
          ctx._carouselTimer[n.id] = true;
          // one-shot schedule via remount cycle is enough for demo; avoid infinite timers in paint
        }
        break;
      }
      case 'loader':
      case 'loading':
      case 'load-indicator': {
        const lk = p.state || p.loadingKey || '_loading';
        const busy = !!ctx.state?.[lk] || p.active === true || p.active === 'true';
        addClass(wrap, 'rt-loader-wrap');
        if (busy) {
          wrap.appendChild(el('div', 'rt-spinner', ''));
          wrap.appendChild(el('div', 'rt-muted', p.text || 'Cargando…'));
        } else if (p.showIdle) {
          wrap.appendChild(el('div', 'rt-muted', p.idleText || 'Listo'));
        }
        break;
      }
      case 'progress':
      case 'progress-bar': {
        let v = Number(ctx.state?.[p.state] ?? p.value ?? 0);
        if (Number.isNaN(v)) v = 0;
        v = Math.max(0, Math.min(100, v));
        addClass(wrap, 'rt-progress-wrap');
        const bar = el('div', 'rt-progress-bar');
        const fill = el('div', 'rt-progress-fill');
        fill.style.width = v + '%';
        bar.appendChild(fill);
        wrap.appendChild(bar);
        if (p.label !== false) wrap.appendChild(el('div', 'rt-muted', Math.round(v) + '%'));
        break;
      }
      case 'file-browser':
      case 'image-browser':
      case 'file-picker': {
        const isImg = n.type === 'image-browser' || p.accept === 'image/*' || p.images;
        const input = document.createElement('input');
        input.type = 'file';
        input.className = 'rt-file';
        if (isImg) input.accept = p.accept || 'image/*';
        else if (p.accept) input.accept = p.accept;
        if (p.multiple) input.multiple = true;
        const preview = el('div', 'rt-file-preview');
        const st = p.state || 'fileData';
        input.onchange = () => {
          const files = Array.from(input.files || []);
          if (!files.length) return;
          if (ctx.setState) ctx.setState(p.loadingKey || '_loading_file', true);
          const readers = files.map(
            (f) =>
              new Promise((res) => {
                const r = new FileReader();
                r.onload = () => res({ name: f.name, type: f.type, size: f.size, dataUrl: r.result });
                if (isImg || (f.type || '').startsWith('image/')) r.readAsDataURL(f);
                else r.readAsText(f);
              })
          );
          Promise.all(readers).then((arr) => {
            if (ctx.setState) {
              ctx.setState(st, p.multiple ? arr : arr[0]);
              ctx.setState(p.loadingKey || '_loading_file', false);
            }
            preview.innerHTML = '';
            arr.forEach((item) => {
              if (item.dataUrl && String(item.dataUrl).startsWith('data:image')) {
                const img = document.createElement('img');
                img.src = item.dataUrl;
                img.className = 'rt-file-img';
                preview.appendChild(img);
              } else {
                preview.appendChild(el('div', 'rt-muted', item.name + ' (' + item.size + ' B)'));
              }
            });
            log && log('file loaded ' + arr.length);
            ctx.remount && ctx.remount();
          });
        };
        wrap.appendChild(input);
        wrap.appendChild(preview);
        const existing = ctx.state?.[st];
        if (existing && existing.dataUrl && String(existing.dataUrl).startsWith('data:image')) {
          const img = document.createElement('img');
          img.src = existing.dataUrl;
          img.className = 'rt-file-img';
          preview.appendChild(img);
        }
        break;
      }
      case 'pulse-consumer':
      case 'pulse-server-consumer': {
        const pulseUrl = p.url || p.pulseUrl || '/api/pulse';
        const keys = String(p.keys || p.views || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const bind = p.state || 'pulseData';
        addClass(wrap, 'rt-card', 'rt-pulse');
        wrap.appendChild(el('div', 'rt-muted', 'Pulse → ' + pulseUrl + (keys.length ? ' keys: ' + keys.join(',') : '')));
        const status = el('div', 'rt-muted', ctx.state?.[p.statusState || '_pulseStatus'] || 'idle');
        wrap.appendChild(status);
        const connect = () => {
          if (ctx._pulseEs?.[n.id || pulseUrl]) return;
          ctx._pulseEs = ctx._pulseEs || {};
          try {
            if (typeof EventSource !== 'undefined') {
              const es = new EventSource(pulseUrl);
              ctx._pulseEs[n.id || pulseUrl] = es;
              if (ctx.setState) ctx.setState(p.statusState || '_pulseStatus', 'connected');
              es.onmessage = (ev) => {
                try {
                  const msg = JSON.parse(ev.data);
                  const k = msg.key || msg.view || msg.target;
                  if (keys.length && k && keys.indexOf(String(k)) < 0) return;
                  if (ctx.setState) {
                    ctx.setState(bind, msg);
                    if (k && msg.state) ctx.setState('view:' + k, msg.state);
                  }
                  log && log('pulse ' + (k || 'msg'));
                  ctx.remount && ctx.remount();
                } catch (e) {
                  log && log('pulse parse');
                }
              };
              es.onerror = () => {
                if (ctx.setState) ctx.setState(p.statusState || '_pulseStatus', 'error/retry');
              };
            } else {
              // poll fallback
              const tick = () => {
                fetch(pulseUrl)
                  .then((r) => r.json())
                  .then((j) => {
                    if (ctx.setState) ctx.setState(bind, j);
                    ctx.remount && ctx.remount();
                  })
                  .catch(() => {});
              };
              tick();
              ctx._pulseEs[n.id || pulseUrl] = setInterval(tick, Number(p.interval) || 5000);
            }
          } catch (e) {
            wrap.appendChild(el('div', 'rt-muted', String(e.message || e)));
          }
        };
        const b = el('button', 'rt-btn', p.buttonText || 'Conectar pulse');
        b.type = 'button';
        b.onclick = () => connect();
        wrap.appendChild(b);
        if (p.auto) setTimeout(connect, 40);
        if (ctx.state?.[bind]) {
          wrap.appendChild(el('pre', 'rt-pre', JSON.stringify(ctx.state[bind], null, 2).slice(0, 600)));
        }
        break;
      }
      case 'view-agent': {
        // Vista como agente: key, lifecycle, state bag, optional rootCID
        const key = p.key || p.name || n.id || 'view';
        addClass(wrap, 'rt-card', 'rt-view-agent');
        const bag = ctx.state?.['agent:' + key] || {};
        wrap.appendChild(el('div', 'rt-muted', 'Agente-vista «' + key + '»'));
        if (p.rootCid || bag.rootCid) wrap.appendChild(el('div', 'rt-muted', 'RootCID ' + (p.rootCid || bag.rootCid)));
        if (p.lifecycle) wrap.appendChild(el('div', 'rt-muted', 'ciclo: ' + p.lifecycle));
        kids(wrap);
        // register in agent registry
        ctx.agents = ctx.agents || {};
        ctx.agents[key] = { key, type: 'view', props: p, state: bag };
        break;
      }
      case 'zyrion-filter': {
        // Filtro ternario simple sobre lista en state
        const src = p.source || p.state || 'apiData';
        const out = p.out || p.bind || src + 'Filtered';
        const field = p.field || 'score';
        const mode = Number(p.mode ?? 1); // 0 follow, 1 matizar, 2 sink high
        addClass(wrap, 'rt-card');
        wrap.appendChild(el('div', 'rt-muted', 'Zyrion filter → ' + out + ' (modo ' + mode + ')'));
        const run = () => {
          const list = ctx.state?.[src];
          if (!Array.isArray(list)) return;
          const scored = list.map((item) => {
            let s = 0;
            if (item && typeof item === 'object') {
              s = Number(item[field] ?? item.priority ?? 0) || 0;
            }
            // ternary: 0 low, 1 mid, 2 high absorb
            let t = 0;
            if (s >= 0.66) t = 2;
            else if (s >= 0.33) t = 1;
            return { item, t, s };
          });
          let result;
          if (mode === 2) result = scored.filter((x) => x.t === 2).map((x) => x.item);
          else if (mode === 0) result = scored.filter((x) => x.t === 0).map((x) => x.item);
          else result = scored.filter((x) => x.t >= 1).map((x) => x.item);
          if (ctx.setState) ctx.setState(out, result);
          log && log('zyrion ' + result.length);
          ctx.remount && ctx.remount();
        };
        const b = el('button', 'rt-btn', p.buttonText || 'Aplicar filtro');
        b.type = 'button';
        b.onclick = () => run();
        wrap.appendChild(b);
        if (p.auto && Array.isArray(ctx.state?.[src])) setTimeout(run, 20);
        break;
      }
      case 'mcp-agent': {
        addClass(wrap, 'rt-card');
        wrap.appendChild(el('div', 'rt-muted', 'MCP agent → ' + (p.url || '/mcp/tools')));
        wrap.appendChild(el('div', 'rt-muted', p.description || 'Expone herramientas de la app a modelos externos'));
        const b = el('button', 'rt-btn', 'Listar tools');
        b.type = 'button';
        b.onclick = () => {
          fetch(p.url || '/mcp/tools')
            .then((r) => r.json())
            .then((j) => {
              if (ctx.setState) ctx.setState(p.state || 'mcpTools', j);
              ctx.remount && ctx.remount();
            })
            .catch((e) => log && log(String(e)));
        };
        wrap.appendChild(b);
        if (ctx.state?.[p.state || 'mcpTools']) {
          wrap.appendChild(el('pre', 'rt-pre', JSON.stringify(ctx.state[p.state || 'mcpTools'], null, 2).slice(0, 500)));
        }
        break;
      }
      case 'nav-link': {
        // Navegación interna list→detail usando key
        const b = el('button', 'rt-btn', p.text || 'Ver detalle');
        b.type = 'button';
        b.onclick = () => {
          const item = p.itemState ? ctx.state?.[p.itemState] : p.item;
          if (ctx.setState) {
            if (p.detailState) ctx.setState(p.detailState, item != null ? item : p.value);
            if (p.routeState || p.route) ctx.setState(p.routeState || 'route', p.route || 'detail');
            if (p.key) ctx.setState('focusKey', p.key);
          }
          ctx.remount && ctx.remount();
        };
        wrap.appendChild(b);
        break;
      }
      case 'architecture': {
        addClass(wrap, 'rt-muted');
        wrap.textContent = 'Clean: ' + (p.layer || 'presentation') + (p.pattern ? ' · ' + p.pattern : '');
        break;
      }

      case 'mind-panel':
      case 'mind-tick': {
        addClass(wrap, 'rt-card');
        wrap.appendChild(el('div', 'rt-muted', 'MiniNode Mind'));
        const area = document.createElement('textarea');
        area.className = 'rt-input';
        area.rows = 2;
        area.placeholder = 'Mensaje al latido…';
        area.value = ctx.state?.[p.state || 'mindText'] || '';
        area.oninput = () => { if (ctx.setState) ctx.setState(p.state || 'mindText', area.value); };
        wrap.appendChild(area);
        const out = el('div', 'rt-muted', ctx.state?.[p.out || 'mindVoice'] || '');
        const b = el('button', 'rt-btn', 'Latido');
        b.type = 'button';
        b.onclick = async () => {
          const text = area.value || ctx.state?.[p.state || 'mindText'] || '';
          if (ctx.setState) ctx.setState(p.loadingKey || '_loading_mind', true);
          try {
            let voice;
            if (p.local && window.AlsetMiniNode) {
              voice = window.AlsetMiniNode.mindTick(text).voice;
            } else {
              const r = await fetch(p.url || '/api/mind/tick', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
              });
              const j = await r.json();
              voice = j.voice || j.error || JSON.stringify(j);
            }
            if (ctx.setState) {
              ctx.setState(p.out || 'mindVoice', voice);
              ctx.setState(p.loadingKey || '_loading_mind', false);
            }
            out.textContent = voice;
            ctx.remount && ctx.remount();
          } catch (e) {
            out.textContent = String(e.message || e);
            if (ctx.setState) ctx.setState(p.loadingKey || '_loading_mind', false);
          }
        };
        wrap.appendChild(b);
        wrap.appendChild(out);
        break;
      }
      case 'zyrion-panel': {
        addClass(wrap, 'rt-card');
        wrap.appendChild(el('div', 'rt-muted', 'Zyrion (env JSON)'));
        const area = document.createElement('textarea');
        area.className = 'rt-input';
        area.rows = 3;
        area.placeholder = '{"p53":0.2,"MDM2":0.8}';
        area.value = ctx.state?.[p.state || 'zyrionEnv'] || '{"a":0.2,"b":0.8}';
        wrap.appendChild(area);
        const out = el('div', 'rt-muted', '');
        const b = el('button', 'rt-btn', 'Evaluar');
        b.type = 'button';
        b.onclick = async () => {
          let env = {};
          try { env = JSON.parse(area.value); } catch (_) {}
          const labels = { 0: 'SEGUIR', 1: 'MATIZAR', 2: 'SUMIDERO' };
          let j;
          if (p.local && window.AlsetMiniNode) j = window.AlsetMiniNode.evalZyrion(env, labels);
          else {
            const r = await fetch(p.url || '/api/zyrion', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ env, labels }),
            });
            j = await r.json();
          }
          out.textContent = (j.label || '') + ' (t=' + j.ternary + ')';
          if (ctx.setState) ctx.setState(p.out || 'zyrionResult', j);
        };
        wrap.appendChild(b);
        wrap.appendChild(out);
        break;
      }
      case 'mesh-peers': {
        addClass(wrap, 'rt-card');
        wrap.appendChild(el('div', 'rt-muted', 'Mesh / gossip lite'));
        const b = el('button', 'rt-btn', 'Anunciar + listar');
        b.type = 'button';
        b.onclick = async () => {
          const name = p.name || ctx.state?.appName || 'app';
          if (window.AlsetMiniNode) window.AlsetMiniNode.announce(name, p.payload || '');
          await fetch('/api/mesh/announce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: p.id || name, name, payload: p.payload || '' }),
          }).catch(() => {});
          const r = await fetch('/api/mesh/peers');
          const j = await r.json();
          if (ctx.setState) ctx.setState(p.state || 'peers', j.peers || []);
          ctx.remount && ctx.remount();
        };
        wrap.appendChild(b);
        const list = ctx.state?.[p.state || 'peers'];
        if (Array.isArray(list)) {
          list.forEach((peer) => {
            wrap.appendChild(el('div', 'rt-list-item', (peer.name || peer.id || JSON.stringify(peer))));
          });
        }
        break;
      }

      case 'video': {
        const src = (p.state && ctx.state?.[p.state]) || p.src || p.url || '';
        const v = document.createElement('video');
        v.className = 'rt-video';
        v.controls = p.controls !== false && p.controls !== 'false';
        v.preload = p.preload || 'metadata'; // ligero: no descarga el archivo entero
        v.playsInline = true;
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', '');
        if (p.autoplay === true || p.autoplay === 'true') {
          v.autoplay = true;
          v.muted = true;
        }
        if (p.muted === true || p.muted === 'true') v.muted = true;
        if (p.loop === true || p.loop === 'true') v.loop = true;
        if (p.poster) v.poster = p.poster;
        const maxH = p.height != null ? (typeof p.height === 'number' ? p.height + 'px' : p.height) : '240px';
        v.style.cssText = 'width:100%;max-height:' + maxH + ';border-radius:12px;background:#000;display:block';
        if (src) {
          // Lazy: solo asignar src cuando el nodo es visible
          const apply = () => { if (!v.src) v.src = src; };
          if (typeof IntersectionObserver !== 'undefined') {
            const io = new IntersectionObserver((ents) => {
              if (ents.some((e) => e.isIntersecting)) { apply(); io.disconnect(); }
            }, { rootMargin: '80px' });
            setTimeout(() => io.observe(v), 0);
          } else apply();
        } else wrap.appendChild(el('div', 'rt-muted', 'Video: indica src o url'));
        wrap.appendChild(v);
        break;
      }
      case 'audio': {
        const src = (p.state && ctx.state?.[p.state]) || p.src || p.url || '';
        const a = document.createElement('audio');
        a.className = 'rt-audio';
        a.controls = p.controls !== false && p.controls !== 'false';
        if (p.autoplay === true || p.autoplay === 'true') a.autoplay = true;
        if (p.loop === true || p.loop === 'true') a.loop = true;
        a.style.width = '100%';
        if (src) a.src = src;
        else wrap.appendChild(el('div', 'rt-muted', 'Audio: indica src o url'));
        if (p.title) wrap.appendChild(el('div', 'rt-muted', p.title));
        wrap.appendChild(a);
        break;
      }
      case 'map': {
        const lat = Number(p.lat ?? ctx.state?.[p.latState] ?? 23.1136);
        const lng = Number(p.lng ?? ctx.state?.[p.lngState] ?? -82.3666);
        const zoom = Number(p.zoom || 13);
        const h = Number(p.height || 200);
        addClass(wrap, 'rt-map');
        wrap.style.height = h + 'px';
        wrap.style.borderRadius = '12px';
        wrap.style.overflow = 'hidden';
        wrap.style.border = '1px solid ' + THEME.line;
        // OpenStreetMap embed (sin API key) al estilo Alset
        const delta = 0.08 / Math.max(zoom / 10, 1);
        const bbox = [lng - delta, lat - delta * 0.7, lng + delta, lat + delta * 0.7].join('%2C');
        const iframe = document.createElement('iframe');
        iframe.title = p.title || 'Mapa';
        iframe.width = '100%';
        iframe.height = String(h);
        iframe.style.border = '0';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.style.cssText = 'width:100%;height:' + h + 'px;border:0;background:#111';
        const mapUrl =
          'https://www.openstreetmap.org/export/embed.html?bbox=' +
          bbox +
          '&layer=mapnik&marker=' +
          lat +
          '%2C' +
          lng;
        // No cargar OSM hasta que el mapa entre en viewport (evita congelar al abrir la app)
        const bootMap = () => { if (!iframe.src) iframe.src = mapUrl; };
        if (typeof IntersectionObserver !== 'undefined') {
          const io = new IntersectionObserver((ents) => {
            if (ents.some((e) => e.isIntersecting)) { bootMap(); io.disconnect(); }
          }, { rootMargin: '100px' });
          setTimeout(() => io.observe(wrap), 0);
        } else bootMap();
        wrap.appendChild(iframe);
        const link = document.createElement('a');
        link.className = 'rt-muted';
        link.href = 'https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lng + '#map=' + zoom + '/' + lat + '/' + lng;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = (p.label || 'Abrir en OSM') + ' · ' + lat.toFixed(4) + ', ' + lng.toFixed(4);
        link.style.display = 'block';
        link.style.padding = '6px 4px';
        link.style.fontSize = '11px';
        wrap.appendChild(link);
        break;
      }

      case 'webrtc-camera':
      case 'camera': {
        addClass(wrap, 'rt-card', 'rt-webrtc');
        const v = document.createElement('video');
        v.className = 'rt-video';
        v.muted = true;
        v.playsInline = true;
        v.autoplay = true;
        v.style.cssText = 'width:100%;max-height:' + (p.height || 220) + 'px;border-radius:12px;background:#000';
        wrap.appendChild(v);
        const st = el('div', 'rt-muted', 'Cámara local (WebRTC getUserMedia)');
        wrap.appendChild(st);
        const start = el('button', 'rt-btn', p.buttonText || 'Activar cámara');
        start.type = 'button';
        let stream = null;
        start.onclick = async () => {
          try {
            if (stream) {
              stream.getTracks().forEach((t) => t.stop());
              stream = null;
              v.srcObject = null;
              st.textContent = 'Cámara detenida';
              start.textContent = p.buttonText || 'Activar cámara';
              return;
            }
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
              st.textContent = 'getUserMedia no disponible (HTTPS o localhost)';
              return;
            }
            stream = await navigator.mediaDevices.getUserMedia({
              video: p.facing === 'user' ? { facingMode: 'user' } : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
              audio: p.audio === true || p.audio === 'true',
            });
            v.srcObject = stream;
            st.textContent = 'En vivo · toca de nuevo para detener';
            start.textContent = 'Detener';
            log && log('webrtc camera on');
          } catch (e) {
            st.textContent = String(e.message || e);
          }
        };
        wrap.appendChild(start);
        if (p.auto === true || p.auto === 'true') setTimeout(() => start.click(), 100);
        break;
      }
      case 'stream-hub':
      case 'alset-stream': {
        // Integración Alset Streaming Hub (publish / watch / health)
        const base = (p.hubUrl || p.url || 'https://alset-streaming-hub.lhmolam-877.workers.dev').replace(/\/$/, '');
        const matchId = p.matchId || p.match || 'partido-demo';
        const role = p.role || 'watch'; // watch | publish | director
        addClass(wrap, 'rt-card', 'rt-stream-hub');
        wrap.appendChild(el('div', 'rt-muted', 'Alset Streaming Hub · ' + matchId));
        const row = el('div', 'rt-row');
        const open = (path) => {
          const u = base + path;
          window.open(u, '_blank', 'noopener');
        };
        const b1 = el('button', 'rt-btn', 'Ver');
        b1.type = 'button';
        b1.onclick = () => open('/watch.html?match=' + encodeURIComponent(matchId) + (p.ticket ? '&ticket=' + encodeURIComponent(p.ticket) : ''));
        const b2 = el('button', 'rt-btn', 'Publicar');
        b2.type = 'button';
        b2.style.background = '#22d3ee';
        b2.onclick = () => open('/publish.html?match=' + encodeURIComponent(matchId) + '&label=' + encodeURIComponent(p.label || 'Cam1'));
        const b3 = el('button', 'rt-btn', 'Director');
        b3.type = 'button';
        b3.style.background = '#a3e635';
        b3.style.color = '#111';
        b3.onclick = () => open('/director.html?match=' + encodeURIComponent(matchId));
        row.appendChild(b1);
        row.appendChild(b2);
        row.appendChild(b3);
        wrap.appendChild(row);
        const health = el('div', 'rt-muted', '…');
        wrap.appendChild(health);
        fetch(base + '/api/health').then((r) => r.json()).then((j) => {
          health.textContent = j.ok ? 'Hub OK' : JSON.stringify(j);
          if (ctx.setState) ctx.setState(p.state || 'streamHub', j);
        }).catch((e) => { health.textContent = 'Hub: ' + (e.message || 'sin red'); });
        if (p.embed === true || p.embed === 'true') {
          const ifr = document.createElement('iframe');
          ifr.title = 'stream-hub';
          ifr.style.cssText = 'width:100%;height:' + (p.height || 280) + 'px;border:0;border-radius:12px;margin-top:8px;background:#000';
          ifr.loading = 'lazy';
          ifr.allow = 'camera;microphone;autoplay;fullscreen';
          ifr.src = base + '/watch.html?match=' + encodeURIComponent(matchId);
          wrap.appendChild(ifr);
        }
        break;
      }
      case 'chip': {
        const s = el('span', 'rt-chip', p.text || 'chip');
        if (p.color) s.style.borderColor = colorToken(p.color) || p.color;
        wrap.appendChild(s);
        break;
      }
      case 'avatar': {
        const a = el('div', 'rt-avatar', (p.text || p.name || 'A').slice(0, 1).toUpperCase());
        if (p.src) {
          a.textContent = '';
          const img = document.createElement('img');
          img.src = p.src;
          img.alt = '';
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit';
          a.appendChild(img);
        }
        if (p.size) {
          a.style.width = a.style.height = Number(p.size) + 'px';
          a.style.fontSize = Math.floor(Number(p.size) / 2.4) + 'px';
        }
        wrap.appendChild(a);
        break;
      }
      case 'divider': {
        const d = el('div', 'rt-divider', '');
        wrap.appendChild(d);
        break;
      }
      case 'skeleton': {
        const sk = el('div', 'rt-skeleton', '');
        sk.style.height = (p.height || 48) + 'px';
        wrap.appendChild(sk);
        break;
      }
      case 'empty-state': {
        addClass(wrap, 'rt-empty');
        wrap.appendChild(el('div', 'rt-empty-icon', p.icon || '◇'));
        wrap.appendChild(el('div', 'rt-muted', p.text || 'Sin contenido'));
        if (p.action) {
          const b = el('button', 'rt-btn', p.actionText || 'Acción');
          b.type = 'button';
          b.onclick = () => { ctx.emit && ctx.emit('action', { action: p.action }); };
          wrap.appendChild(b);
        }
        break;
      }
      case 'surface': {
        addClass(wrap, 'rt-surface');
        if (p.variant === 'elevated') addClass(wrap, 'rt-surface-elevated');
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
    const prev = doc.getElementById('alset-rt-css');
    if (prev) prev.remove();
    const s = doc.createElement('style');
    s.id = 'alset-rt-css';
    s.setAttribute('data-v', '9');
    s.textContent = `
.rt-frame{margin:0 auto;border:1px solid ${THEME.line};border-radius:20px;background:#0a0d12;overflow:hidden;position:relative;touch-action:pan-y;isolation:isolate;contain:layout style paint}
.rt-label{font-size:10px;color:${THEME.muted};padding:8px 12px;border-bottom:1px solid ${THEME.line};flex-shrink:0}
.rt-host{padding:12px;min-height:80px;color:${THEME.text};position:relative;overflow:auto;flex:1;box-sizing:border-box}
.rt-node{box-sizing:border-box;max-width:100%}
.rt-selected{outline:2px solid ${THEME.primary}!important;outline-offset:2px}
.rt-handle{position:absolute;right:0;bottom:0;width:14px;height:14px;background:${THEME.primary};border-radius:2px 0 4px 0;cursor:nwse-resize;z-index:5}
.rt-col{display:flex;flex-direction:column;gap:8px;width:100%;min-width:0}
.rt-row{display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;align-items:center}
.rt-card{background:${THEME.card};border:1px solid ${THEME.line};border-radius:12px;padding:12px}
.rt-btn{appearance:none;border:0;background:${THEME.primary};color:#111;font-weight:700;padding:10px 16px;border-radius:10px;cursor:pointer}
.rt-input{width:100%;padding:10px;border-radius:8px;border:1px solid #2a3344;background:#0a0d12;color:#fff;box-sizing:border-box}
.rt-muted{font-size:12px;color:${THEME.muted}}
.rt-metric-val{font-size:22px;font-weight:700;color:${THEME.primary};margin-top:4px}
.rt-hero-title{font-size:22px;font-weight:800;color:${THEME.primary}}
.rt-form-title{font-weight:700;font-size:15px;margin-bottom:4px}
.rt-badge{display:inline-block;padding:2px 8px;border-radius:999px;background:rgba(52,211,153,.15);color:${THEME.ok};font-size:11px;font-weight:700}
.rt-tab{appearance:none;border:1px solid ${THEME.line};background:transparent;color:${THEME.muted};padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;flex:0 0 auto;white-space:nowrap}
.rt-tab.active{color:${THEME.primary};border-color:rgba(245,197,66,.45);background:rgba(245,197,66,.08)}
.rt-tabbar{margin-bottom:8px}
.rt-pre{font-size:10px;color:${THEME.muted};white-space:pre-wrap;margin:6px 0 0}
.rt-table{width:100%;border-collapse:collapse;font-size:12px}
.rt-table th,.rt-table td{border:1px solid ${THEME.line};padding:6px 8px;text-align:left}
.rt-hamburger{appearance:none;border:0;background:${THEME.card};color:${THEME.text};font-size:22px;width:44px;height:44px;border-radius:10px;cursor:pointer}
.rt-frame.rt-pwa{width:100%!important;max-width:100%!important;height:100%!important;min-height:100%!important;border:none!important;border-radius:0!important;margin:0!important}
.rt-overlay-root{position:absolute;inset:0;z-index:40;pointer-events:none;overflow:hidden}
.rt-overlay-root > *{pointer-events:auto}
.rt-drawer{position:relative;min-height:0;height:0;overflow:visible;margin:0;padding:0;border:0}
.rt-drawer-layer{position:absolute;inset:0;z-index:50;pointer-events:auto}
.rt-drawer-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.45);z-index:1}
.rt-drawer-panel{position:absolute;top:0;bottom:0;left:0;width:min(280px,82%);max-width:100%;background:#12171f;z-index:2;padding:16px;box-shadow:0 0 40px rgba(0,0,0,.5);transform:translateX(-105%);transition:transform .28s ease;overflow:auto;box-sizing:border-box}
.rt-drawer-layer.right .rt-drawer-panel{right:0;left:auto;transform:translateX(105%)}
.rt-drawer-layer.open .rt-drawer-panel{transform:translateX(0)}
.rt-drawer-title{font-weight:700;color:${THEME.primary};margin-bottom:12px}
.rt-splash{position:absolute;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;background:${THEME.bg};transition:opacity .4s,visibility .4s;box-sizing:border-box;padding:16px;text-align:center}
.rt-host,.rt-node,.rt-col,.rt-row,.rt-card{max-width:100%;box-sizing:border-box}
.rt-row{width:100%}
.rt-frame[data-device="mobile"] .rt-row > .rt-node[data-type="metric"],
.rt-frame[data-device="mobile"] .rt-row > .rt-card{flex:1 1 100%;min-width:0}
.rt-frame[data-device="mobile"] .rt-tabbar,.rt-frame[data-device="mobile"] .rt-row[data-type="nav"]{flex-wrap:wrap}
.rt-btn{max-width:100%;white-space:nowrap}
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

.rt-select{width:100%;padding:10px 12px;border-radius:10px;border:1px solid #2a3344;background:#0a0d12;color:#eef1f6;font-size:14px;box-sizing:border-box}
.rt-icon{display:inline-flex;align-items:center;justify-content:center;line-height:1}
.rt-glass{background:rgba(18,23,31,0.55);backdrop-filter:blur(18px) saturate(160%);-webkit-backdrop-filter:blur(18px) saturate(160%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;box-shadow:0 8px 28px rgba(0,0,0,0.35)}
.rt-gradient{color:#eef1f6}
.rt-grad-img{position:relative}
.rt-grad-img-overlay{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:14px;box-sizing:border-box}
.rt-fab{appearance:none;border:0;width:52px;height:52px;border-radius:50%;background:${THEME.primary};color:#111;font-size:24px;font-weight:800;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,0.4)}
.rt-lazy-col,.rt-lazy-row{border:1px solid ${THEME.line};border-radius:12px;padding:8px;background:#0a0d12}
.rt-chip{flex:0 0 auto;padding:10px 14px;border-radius:999px;background:${THEME.card};border:1px solid ${THEME.line};font-size:13px;white-space:nowrap}
.rt-toast{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);background:${THEME.card};border:1px solid ${THEME.line};color:${THEME.text};padding:12px 18px;border-radius:999px;z-index:80;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.4);white-space:nowrap}
.rt-splash-icon{font-size:40px;margin-bottom:8px}
.rt-spinner{width:28px;height:28px;border:3px solid rgba(255,255,255,0.15);border-top-color:${THEME.primary};border-radius:50%;margin-top:16px;animation:rtSpin .7s linear infinite}
@keyframes rtSpin{to{transform:rotate(360deg)}}


.rt-drawer-panel{display:flex;flex-direction:column;padding:0!important}
.rt-drawer-head{display:flex;align-items:center;gap:12px;padding:20px 16px 16px;border-bottom:1px solid ${THEME.line};background:linear-gradient(135deg,rgba(245,197,66,0.12),transparent)}
.rt-drawer-avatar{width:44px;height:44px;border-radius:14px;background:${THEME.primary};color:#111;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.rt-drawer-head-text{min-width:0}
.rt-drawer-nav{display:flex;flex-direction:column;gap:4px;padding:12px;flex:1;overflow:auto}
.rt-drawer-item{appearance:none;border:0;background:transparent;color:${THEME.text};text-align:left;padding:12px 14px;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;width:100%;display:flex;align-items:center;gap:10px}
.rt-drawer-item:hover,.rt-drawer-item:active{background:rgba(245,197,66,0.12);color:${THEME.primary}}
.rt-drawer-item-icon{opacity:0.85;width:1.25em;text-align:center}
.rt-bottom-shell{display:flex;flex-direction:column;min-height:320px;height:100%;max-height:100%}
.rt-bottom-content{flex:1;overflow:auto;padding:8px 4px 4px;min-height:0}
.rt-bottom-bar{display:flex;flex-direction:row;border-top:1px solid ${THEME.line};background:rgba(12,15,20,0.92);backdrop-filter:blur(12px);padding:6px 4px calc(6px + env(safe-area-inset-bottom,0px));flex-shrink:0;gap:2px}
.rt-bottom-item{flex:1;appearance:none;border:0;background:transparent;color:${THEME.muted};display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;border-radius:10px;cursor:pointer;font-size:10px}
.rt-bottom-item.active{color:${THEME.primary}}
.rt-bottom-icon{font-size:18px;line-height:1}
.rt-bottom-label{font-weight:600;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.rt-stack{position:relative;width:100%}
.rt-stack-anim{animation:rtSlide .35s ease}
.rt-shape{display:block;flex-shrink:0}
.rt-shape-circle{border-radius:50%}
.rt-shape-blob{border-radius:40% 60% 55% 45% / 45% 40% 60% 55%}
.rt-shape-rounded{border-radius:20px}
.rt-shape-cut{clip-path:polygon(12% 0,100% 0,100% 88%,88% 100%,0 100%,0 12%)}
.rt-shape-pill{border-radius:999px}
.rt-shape-diamond{clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%)}
.rt-shape-hex{clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)}


.rt-carousel{display:flex;flex-direction:column;gap:8px;width:100%}
.rt-carousel-stage{min-height:80px;border:1px solid ${THEME.line};border-radius:12px;padding:8px;overflow:hidden}
.rt-carousel-anim .rt-carousel-stage{animation:rtSlide .35s ease}
.rt-carousel-ctrl{display:flex;align-items:center;justify-content:space-between;gap:8px}
.rt-loader-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px}
.rt-spinner{width:28px;height:28px;border:3px solid ${THEME.line};border-top-color:${THEME.primary};border-radius:50%;animation:rtSpin .7s linear infinite}
@keyframes rtSpin{to{transform:rotate(360deg)}}
.rt-progress-wrap{width:100%}
.rt-progress-bar{height:8px;background:${THEME.line};border-radius:99px;overflow:hidden}
.rt-progress-fill{height:100%;background:${THEME.primary};border-radius:99px;transition:width .25s ease}
.rt-file{width:100%;font-size:12px;color:${THEME.muted}}
.rt-file-img{max-width:100%;max-height:160px;border-radius:10px;margin-top:8px;display:block}
.rt-rest .rt-btn,.rt-pulse .rt-btn{margin-top:8px}
.rt-view-agent{border-left:3px solid ${THEME.primary}}

.rt-video{display:block;width:100%;background:#000}
.rt-audio{display:block;width:100%;margin-top:6px}
.rt-map iframe{display:block}
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
      const isPwa = opts.mode === 'pwa' || opts.interactive === false;
      const frame = el('div', 'rt-frame' + (isPwa ? ' rt-pwa' : ''));
      frame.setAttribute('data-device', device.id || 'mobile');
      if (isPwa) {
        frame.style.width = '100%';
        frame.style.maxWidth = '100%';
        frame.style.height = '100%';
        frame.style.minHeight = '100%';
        frame.style.overflow = 'hidden';
      } else {
        const h = Math.min(device.height || 720, 720);
        frame.style.width = (device.width || 390) + 'px';
        frame.style.maxWidth = '100%';
        frame.style.height = h + 'px';
        frame.style.minHeight = h + 'px';
        frame.style.overflow = 'hidden';
      }
      if (!isPwa) {
        const label = el(
          'div',
          'rt-label',
          `${device.label || device.id} · ${device.width}px · emulador`
        );
        frame.appendChild(label);
      }
      const root = el('div', 'rt-host');
      root.style.height = isPwa ? '100%' : 'calc(100% - 28px)';
      root.style.overflow = 'auto';
      root.style.position = 'relative';
      frame.appendChild(root);
      // Overlay layer for drawer/splash — always clipped to frame
      const overlay = el('div', 'rt-overlay-root');
      frame.appendChild(overlay);
      ctx.frame = frame;
      ctx.overlayRoot = overlay;
      ctx.deviceWidth = device.width || (isPwa ? (host.clientWidth || 390) : 390);
      if (opts.interactive && !isPwa) {
        const hint = el('div', 'rt-gesture-hint', 'Gestos: swipe → menú · pull ↓ refresh');
        frame.appendChild(hint);
      }
      host.appendChild(frame);

      // Scale emulator to fit the preview pane without changing layout width
      if (!isPwa && host.clientWidth > 40) {
        const logical = device.width || 390;
        const avail = Math.max(120, host.clientWidth - 24);
        const scale = Math.min(1, avail / logical);
        if (scale < 0.999) {
          frame.style.transform = 'scale(' + scale + ')';
          frame.style.transformOrigin = 'top center';
          // Reserve vertical space so parent scroll height is correct
          const h = Math.min(device.height || 720, 720);
          host.style.minHeight = Math.ceil(h * scale + 16) + 'px';
        }
      }

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
