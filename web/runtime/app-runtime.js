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
    wrap.setAttribute('data-node-id', n.id || '');
    wrap.setAttribute('data-type', n.type);
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
          panel.appendChild(el('div', 'rt-drawer-title', p.title || 'Menú'));
          kids(panel);
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
    const prev = doc.getElementById('alset-rt-css');
    if (prev) prev.remove();
    const s = doc.createElement('style');
    s.id = 'alset-rt-css';
    s.setAttribute('data-v', '4');
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
