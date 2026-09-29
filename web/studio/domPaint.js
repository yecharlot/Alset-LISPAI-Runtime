/**
 * DOM painter for all studio component types.
 * Used as reliable preview/deploy fallback when Alset-JS mount fails or is empty.
 */
export function paintTree(parent, nodes, log, depth = 0) {
  if (!parent) return;
  (nodes || []).forEach((n) => paintNode(parent, n, log, depth));
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null && text !== '') e.textContent = String(text);
  return e;
}

function paintNode(parent, n, log, depth) {
  if (!n || depth > 30) return;
  const p = n.props || {};
  let node;

  const kids = (host) => {
    (n.children || []).forEach((c) => paintNode(host, c, log, depth + 1));
  };

  switch (n.type) {
    case 'text':
      node = el('div', 'pv-text', p.text || '');
      if (p.size) node.style.fontSize = (Number(p.size) || 15) + 'px';
      if (p.weight === 'bold' || p.weight === '700') node.style.fontWeight = '700';
      if (p.color === 'primary') node.style.color = '#f5c542';
      else if (p.color === 'muted') node.style.color = '#a1a1aa';
      else if (p.color === 'secondary') node.style.color = '#5b9cf5';
      else if (p.color === 'danger') node.style.color = '#f87171';
      break;

    case 'button':
      node = el('button', 'btn btn-gold', p.text || 'OK');
      node.type = 'button';
      node.onclick = () => log?.('action:' + (p.action || 'click'));
      break;

    case 'input':
    case 'textarea': {
      node = document.createElement(n.type === 'textarea' ? 'textarea' : 'input');
      node.placeholder = p.placeholder || '';
      if (n.type === 'input') node.type = p.type || 'text';
      if (n.type === 'textarea') node.rows = Number(p.rows) || 3;
      node.style.cssText =
        'width:100%;padding:10px;border-radius:8px;border:1px solid #2a3344;background:#0a0d12;color:#f4f4f5;box-sizing:border-box';
      break;
    }

    case 'spacer':
      node = el('div');
      node.style.height = (Number(p.size) || 12) + 'px';
      break;

    case 'badge':
      node = el('span', 'pv-badge', p.text || 'BADGE');
      node.style.cssText =
        'display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;background:rgba(52,211,153,0.15);color:#34d399';
      break;

    case 'metric':
      node = el('div', 'pv-card');
      node.style.cssText =
        'padding:12px;border-radius:12px;background:#161922;border:1px solid rgba(255,255,255,0.07);min-width:100px';
      node.appendChild(el('div', '', p.title || 'KPI')).style.cssText = 'font-size:11px;color:#a1a1aa';
      const mv = el('div', '', String(p.value ?? '—'));
      mv.style.cssText = 'font-size:22px;font-weight:700;color:#f5c542;margin-top:4px';
      node.appendChild(mv);
      if (p.hint) {
        const h = el('div', '', p.hint);
        h.style.cssText = 'font-size:10px;color:#a1a1aa;margin-top:4px';
        node.appendChild(h);
      }
      break;

    case 'hero':
      node = el('div', 'pv-card');
      node.style.cssText = 'padding:20px;border-radius:16px;background:linear-gradient(135deg,#161922,#1c2030);border:1px solid rgba(245,197,66,0.2)';
      const ht = el('div', '', p.title || 'Hero');
      ht.style.cssText = 'font-size:24px;font-weight:800;color:#f5c542';
      node.appendChild(ht);
      if (p.subtitle) {
        const s = el('div', '', p.subtitle);
        s.style.cssText = 'font-size:13px;color:#a1a1aa;margin-top:8px';
        node.appendChild(s);
      }
      break;

    case 'nav': {
      node = el('div', 'pv-row');
      node.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;padding:4px 0';
      String(p.tabs || 'A,B')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => {
          const b = el('button', 'btn btn-ghost', t);
          b.type = 'button';
          b.onclick = () => log?.('tab:' + t);
          node.appendChild(b);
        });
      break;
    }

    case 'list':
      node = el('div', 'pv-muted', p.empty || 'Lista · state:' + (p.state || '—'));
      node.style.cssText = 'padding:8px;font-size:12px;color:#a1a1aa;border:1px dashed #2a3344;border-radius:8px';
      break;

    case 'table':
      node = el('div', 'pv-muted', 'Tabla · cols ' + (p.columns || '—') + ' · state:' + (p.state || '—'));
      node.style.cssText = 'padding:8px;font-size:12px;color:#a1a1aa;border:1px dashed #2a3344;border-radius:8px';
      break;

    case 'image':
      if (p.src) {
        node = document.createElement('img');
        node.src = p.src;
        node.alt = p.alt || '';
        node.style.maxWidth = '100%';
        node.style.maxHeight = (p.height || 120) + 'px';
      } else {
        node = el('div', 'pv-muted', '(imagen sin src)');
      }
      break;

    case 'api':
      node = el('div', 'pv-api', 'GET ' + (p.url || '') + ' → ' + (p.state || 'apiData'));
      node.style.cssText =
        'font-size:11px;color:#5b9cf5;padding:6px 8px;border-radius:8px;background:rgba(91,156,245,0.08)';
      if (p.auto && p.url) {
        fetch(p.url)
          .then((r) => r.json())
          .then((j) => {
            const pre = el('pre', '', JSON.stringify(j, null, 2));
            pre.style.cssText = 'font-size:10px;color:#a1a1aa;margin:6px 0 0;white-space:pre-wrap';
            node.appendChild(pre);
            log?.('api ok ' + p.url);
          })
          .catch((e) => log?.('api err ' + e.message));
      }
      break;

    case 'api-post':
      node = el('div', 'pv-api', 'POST ' + (p.url || '/v1/data'));
      node.style.cssText = 'font-size:11px;color:#5b9cf5;padding:6px 8px';
      break;

    case 'form-login':
    case 'form-register':
    case 'form-contact': {
      node = el('div', 'pv-card');
      node.style.cssText = 'padding:14px;border-radius:12px;background:#161922;border:1px solid rgba(255,255,255,0.07);display:flex;flex-direction:column;gap:8px';
      node.appendChild(el('div', '', p.title || n.type)).style.cssText = 'font-weight:700;font-size:15px';
      const fields =
        n.type === 'form-contact'
          ? [
              ['email', 'email'],
              ['msg', 'mensaje'],
            ]
          : n.type === 'form-register'
            ? [
                ['user', 'usuario'],
                ['pass', 'clave'],
                ['email', 'email'],
              ]
            : [
                ['user', 'usuario'],
                ['pass', 'clave'],
              ];
      fields.forEach(([name, ph]) => {
        const i = document.createElement('input');
        i.placeholder = ph;
        i.type = name === 'pass' ? 'password' : 'text';
        i.style.cssText =
          'width:100%;padding:10px;border-radius:8px;border:1px solid #2a3344;background:#0a0d12;color:#fff;box-sizing:border-box';
        node.appendChild(i);
      });
      const btn = el('button', 'btn btn-gold', n.type === 'form-login' ? 'Entrar' : n.type === 'form-register' ? 'Registrar' : 'Enviar');
      btn.type = 'button';
      btn.onclick = () => log?.(n.type + ' submit');
      node.appendChild(btn);
      break;
    }

    case 'form-search': {
      node = document.createElement('input');
      node.placeholder = p.placeholder || 'Buscar…';
      node.style.cssText =
        'width:100%;padding:10px;border-radius:8px;border:1px solid #2a3344;background:#0a0d12;color:#fff;box-sizing:border-box';
      break;
    }

    case 'select':
    case 'checkbox':
    case 'switch':
      node = el('div', 'pv-row', (p.label || n.type) + ' · ' + (p.options || p.state || ''));
      node.style.cssText = 'font-size:13px;color:#a1a1aa';
      break;

    case 'login-token': {
      node = el('div', 'pv-card');
      node.style.cssText = 'padding:14px;border-radius:12px;background:#161922;display:flex;flex-direction:column;gap:8px';
      node.appendChild(el('div', '', p.title || 'Acceso')).style.fontWeight = '700';
      ['usuario', 'clave'].forEach((ph, i) => {
        const inp = document.createElement('input');
        inp.placeholder = ph;
        if (i) inp.type = 'password';
        inp.style.cssText =
          'width:100%;padding:10px;border-radius:8px;border:1px solid #2a3344;background:#0a0d12;color:#fff;box-sizing:border-box';
        node.appendChild(inp);
      });
      const b = el('button', 'btn btn-gold', p.button || 'Entrar');
      b.type = 'button';
      b.onclick = () => log?.('login-token');
      node.appendChild(b);
      break;
    }

    case 'role-badge':
      node = el('div', 'pv-muted', 'Rol: guest');
      break;

    case 'auth-gate':
    case 'gate':
      node = el('div', 'pv-card');
      node.style.cssText = 'padding:10px;border:1px dashed rgba(245,197,66,0.3);border-radius:10px';
      node.appendChild(el('div', '', 'auth-gate · ' + (p.role || 'user'))).style.cssText =
        'font-size:11px;color:#f5c542;margin-bottom:8px';
      kids(node);
      parent.appendChild(node);
      return;

    case 'state':
      node = el('div', 'pv-muted', `state ${p.name}=${p.value ?? ''}`);
      break;

    case 'persist':
      node = el('button', 'btn btn-blue', 'Guardar persistencia');
      node.type = 'button';
      break;

    case 'ipfs':
      node = el('div', 'pv-muted', `CID ${p.cid || '—'}`);
      break;

    case 'agent':
      node = el('div', 'pv-muted', `agent:${p.name || 'ui'}`);
      break;

    case 'column':
    case 'row':
    case 'card':
    case 'anim-fade':
    case 'anim-slide':
    case 'anim-scale': {
      node = el('div', n.type === 'row' ? 'pv-row' : n.type === 'card' ? 'pv-card' : 'pv-col');
      if (n.type === 'row') {
        node.style.cssText = 'display:flex;flex-direction:row;flex-wrap:wrap;gap:' + (p.gap || 8) + 'px;align-items:center';
      } else {
        node.style.cssText =
          'display:flex;flex-direction:column;gap:' +
          (p.gap || 8) +
          'px;padding:' +
          (p.pad || (n.type === 'card' ? 14 : 0)) +
          'px';
        if (n.type === 'card') {
          node.style.background = '#161922';
          node.style.borderRadius = '12px';
          node.style.border = '1px solid rgba(255,255,255,0.07)';
        }
      }
      kids(node);
      parent.appendChild(node);
      return;
    }

    default:
      node = el('div', 'pv-muted', String(n.type));
      node.style.cssText = 'font-size:11px;color:#71717a;padding:4px';
      if (n.children?.length) {
        kids(node);
      }
  }

  if (node) parent.appendChild(node);
}

export function paintPreviewHost(host, nodes, log, device) {
  if (!host) return;
  host.innerHTML = '';
  const frame = el('div', 'device-frame');
  if (device) {
    frame.style.width = device.width + 'px';
    frame.style.maxWidth = '100%';
    frame.style.minHeight = Math.min(device.height, 520) + 'px';
    frame.style.overflow = 'auto';
  }
  const label = el('div', 'device-label', device ? `${device.label} · ${device.width}px · DOM` : 'preview');
  const root = el('div', 'preview-host');
  root.style.minHeight = '80px';
  frame.appendChild(label);
  frame.appendChild(root);
  host.appendChild(frame);
  paintTree(root, nodes, log, 0);
  return root;
}
