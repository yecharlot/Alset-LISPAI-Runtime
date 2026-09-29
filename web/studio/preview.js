import { THEME_COLORS } from './components.js';
import { guard, withBudget, StudioError } from './sandbox.js';

const store = new Map();
const listeners = new Set();

export function stateGet(name, fallback = '') {
  return store.has(name) ? store.get(name) : fallback;
}
export function stateSet(name, value) {
  store.set(name, value);
  // granular notify — subscribers decide what to refresh
  listeners.forEach((fn) => {
    try { fn(name, value); } catch (_) {}
  });
}
export function stateSubscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function stateDump() {
  return Object.fromEntries(store.entries());
}
export function stateLoad(obj) {
  if (!obj || typeof obj !== 'object') return;
  Object.entries(obj).forEach(([k, v]) => store.set(k, v));
}

export async function restGet(url) {
  const r = await fetch(url);
  const text = await r.text();
  try { return JSON.parse(text); } catch { return text; }
}
export async function restPost(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const text = await r.text();
  try { return JSON.parse(text); } catch { return text; }
}

function applyAnim(el, kind, duration = 400) {
  if (!el?.animate) return;
  const d = Number(duration) || 400;
  try {
    if (kind === 'slide' || kind === 'anim-slide') {
      el.animate(
        [{ transform: 'translateY(12px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
        { duration: d, fill: 'both', easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    } else if (kind === 'scale' || kind === 'anim-scale') {
      el.animate(
        [{ transform: 'scale(0.94)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
        { duration: d, fill: 'both', easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    } else {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: d, fill: 'both', easing: 'ease-out' });
    }
  } catch (_) {}
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function paintNode(parent, n, log, depth) {
  if (depth > 24) {
    throw new StudioError('Árbol demasiado profundo', {
      pattern: 'max-depth',
      fix: 'Aplana la jerarquía (máx. ~24 niveles).',
      where: 'preview',
    });
  }
  const p = n.props || {};
  let node;

  switch (n.type) {
    case 'text': {
      node = el('div', 'pv-text', p.text || '');
      node.style.fontSize = (p.size || 15) + 'px';
      node.style.fontWeight = p.weight === 'bold' ? '700' : '400';
      node.style.color = THEME_COLORS[p.color] || p.color || THEME_COLORS.text;
      break;
    }
    case 'button': {
      node = el('button', 'btn btn-gold', p.text || 'OK');
      node.type = 'button';
      node.onclick = () => {
        log?.('action:' + (p.action || 'click'));
        if (p.state) stateSet(p.state, String(Number(stateGet(p.state, 0)) + 1));
      };
      if (p.anim) applyAnim(node, p.anim, p.duration);
      break;
    }
    case 'input': {
      node = el('input', 'pv-input');
      node.type = p.type || 'text';
      node.placeholder = p.placeholder || '';
      node.value = stateGet(p.state || 'input', '');
      // escritura fluida: no re-render del árbol en cada tecla
      node.addEventListener('input', () => stateSet(p.state || 'input', node.value));
      break;
    }
    case 'textarea': {
      node = el('textarea', 'pv-input');
      node.rows = Number(p.rows) || 3;
      node.placeholder = p.placeholder || '';
      node.value = stateGet(p.state || 'notes', '');
      node.addEventListener('input', () => stateSet(p.state || 'notes', node.value));
      break;
    }
    case 'badge': {
      node = el('span', 'badge ' + (p.tone === 'ok' ? 'ok' : p.tone === 'err' ? 'err' : ''), p.text || '');
      break;
    }
    case 'metric': {
      node = el('div', 'pv-metric');
      node.appendChild(el('div', 'pv-muted', p.title || 'KPI'));
      const v = el('div', 'pv-kpi', String(stateGet(p.state, p.value || '—')));
      node.appendChild(v);
      node.appendChild(el('div', 'pv-muted', p.hint || ''));
      break;
    }
    case 'list': {
      node = el('div', 'pv-list');
      const data = stateGet(p.state || 'items', []);
      if (!Array.isArray(data) || !data.length) node.appendChild(el('div', 'pv-muted', p.empty || 'Sin datos'));
      else data.slice(0, 50).forEach((item) => {
        node.appendChild(el('div', 'pv-li', typeof item === 'string' ? item : JSON.stringify(item)));
      });
      break;
    }
    case 'table': {
      node = el('table', 'pv-table');
      const cols = String(p.columns || 'id').split(',').map((s) => s.trim());
      const head = el('tr');
      cols.forEach((c) => head.appendChild(el('th', '', c)));
      node.appendChild(head);
      let rows = stateGet(p.state || 'rows', []);
      if (rows && !Array.isArray(rows) && rows.items) rows = rows.items;
      if (!Array.isArray(rows)) rows = [];
      rows.slice(0, 40).forEach((row) => {
        const tr = el('tr');
        cols.forEach((c) => tr.appendChild(el('td', '', row?.[c] != null ? String(row[c]) : '')));
        node.appendChild(tr);
      });
      break;
    }
    case 'nav': {
      node = el('div', 'pv-row');
      String(p.tabs || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((t) => {
        const b = el('button', 'btn btn-ghost', t);
        b.type = 'button';
        b.onclick = () => stateSet(p.state || 'tab', t);
        node.appendChild(b);
      });
      break;
    }
    case 'hero': {
      node = el('div', 'pv-hero');
      node.appendChild(el('div', 'pv-hero-title', p.title || ''));
      node.appendChild(el('div', 'pv-muted', p.subtitle || ''));
      break;
    }
    case 'form-login': {
      node = el('div', 'pv-card');
      node.appendChild(el('div', 'pv-text', p.title || 'Login')).style.fontWeight = '700';
      const u = el('input', 'pv-input'); u.placeholder = 'usuario';
      u.value = stateGet(p.userState || 'user', '');
      u.oninput = () => stateSet(p.userState || 'user', u.value);
      const pw = el('input', 'pv-input'); pw.type = 'password'; pw.placeholder = 'clave';
      pw.value = stateGet(p.passState || 'pass', '');
      pw.oninput = () => stateSet(p.passState || 'pass', pw.value);
      const go = el('button', 'btn btn-gold', 'Entrar'); go.type = 'button';
      go.onclick = () => log?.('login ' + stateGet(p.userState || 'user'));
      node.appendChild(u); node.appendChild(pw); node.appendChild(go);
      break;
    }
    case 'form-register': {
      node = el('div', 'pv-card');
      node.appendChild(el('div', 'pv-text', p.title || 'Registro')).style.fontWeight = '700';
      ['email', 'nombre', 'clave'].forEach((k) => {
        const i = el('input', 'pv-input'); i.placeholder = k;
        i.oninput = () => stateSet('reg_' + k, i.value);
        node.appendChild(i);
      });
      const go = el('button', 'btn btn-gold', 'Crear'); go.type = 'button';
      go.onclick = () => log?.('register');
      node.appendChild(go);
      break;
    }
    case 'form-contact': {
      node = el('div', 'pv-card');
      node.appendChild(el('div', 'pv-text', p.title || 'Contacto')).style.fontWeight = '700';
      const email = el('input', 'pv-input'); email.placeholder = 'email';
      email.oninput = () => stateSet(p.emailState || 'email', email.value);
      const msg = el('textarea', 'pv-input'); msg.placeholder = 'mensaje'; msg.rows = 3;
      msg.oninput = () => stateSet(p.msgState || 'msg', msg.value);
      const go = el('button', 'btn btn-gold', 'Enviar'); go.type = 'button';
      go.onclick = async () => {
        const body = { email: stateGet(p.emailState || 'email'), msg: stateGet(p.msgState || 'msg') };
        try {
          const res = await restPost('/v1/data', body);
          log?.('POST /v1/data ok');
          stateSet('rows', res);
        } catch (e) {
          log?.('POST err ' + e.message);
        }
      };
      node.appendChild(email); node.appendChild(msg); node.appendChild(go);
      break;
    }
    case 'form-search': {
      node = el('div', 'pv-row');
      const i = el('input', 'pv-input'); i.placeholder = p.placeholder || 'Buscar…';
      i.value = stateGet(p.state || 'q', '');
      i.oninput = () => stateSet(p.state || 'q', i.value);
      node.appendChild(i);
      break;
    }
    case 'select': {
      node = el('select', 'pv-input');
      String(p.options || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((o) => {
        const opt = el('option', '', o); opt.value = o; node.appendChild(opt);
      });
      node.value = stateGet(p.state || 'choice', node.value);
      node.onchange = () => stateSet(p.state || 'choice', node.value);
      break;
    }
    case 'checkbox':
    case 'switch': {
      node = el('label', 'pv-row');
      const i = el('input'); i.type = 'checkbox';
      i.checked = !!stateGet(p.state || 'ok', false);
      i.onchange = () => stateSet(p.state || 'ok', i.checked);
      node.appendChild(i);
      node.appendChild(el('span', '', p.label || n.type));
      break;
    }
    case 'api': {
      node = el('div', 'pv-api');
      node.textContent = 'GET ' + (p.url || '') + ' → ' + (p.state || 'apiData');
      if (p.auto && p.url) {
        restGet(p.url).then((data) => {
          stateSet(p.state || 'apiData', data);
          log?.('api ok');
        }).catch((e) => log?.('api err ' + e.message));
      }
      break;
    }
    case 'api-post': {
      node = el('div', 'pv-api');
      node.textContent = 'POST ' + (p.url || '/v1/data');
      break;
    }
    case 'state': {
      stateSet(p.name || 'x', p.value ?? '');
      node = el('div', 'pv-muted', `state ${p.name}=${stateGet(p.name)}`);
      break;
    }
    case 'persist': {
      const key = p.key || 'app.v1';
      const st = p.state || 'count';
      try {
        const raw = localStorage.getItem(key);
        if (raw != null) stateSet(st, JSON.parse(raw));
      } catch (_) {}
      node = el('button', 'btn btn-blue', 'Guardar persistencia');
      node.type = 'button';
      node.onclick = () => {
        localStorage.setItem(key, JSON.stringify(stateGet(st)));
        log?.('persist ' + key);
      };
      break;
    }
    case 'ipfs': {
      node = el('div', 'pv-muted', `CID ${p.cid || '—'} → ${p.state || 'ipfsDoc'}`);
      if (p.cid) stateSet(p.state || 'ipfsDoc', { cid: p.cid });
      break;
    }
    case 'agent': {
      node = el('div', 'pv-badge-agent', `agent:${p.name || 'ui'} · ${p.note || ''}`);
      break;
    }
    case 'image': {
      node = el('div', 'pv-muted', p.src ? '' : '(imagen)');
      if (p.src) {
        const img = el('img');
        img.src = p.src; img.alt = p.alt || '';
        img.style.maxHeight = (p.height || 120) + 'px';
        img.style.maxWidth = '100%';
        node = img;
      }
      break;
    }
    case 'spacer': {
      node = el('div');
      node.style.height = (p.size || 12) + 'px';
      break;
    }
    case 'column':
    case 'row':
    case 'card':
    case 'anim-fade':
    case 'anim-slide':
    case 'anim-scale': {
      node = el('div', n.type === 'row' ? 'pv-row' : n.type === 'card' ? 'pv-card' : 'pv-col');
      if (n.type.startsWith('anim-')) applyAnim(node, n.type, p.duration);
      (n.children || []).forEach((c) => paintNode(node, c, log, depth + 1));
      break;
    }
    default:
      node = el('div', 'pv-muted', n.type);
  }
  if (node) parent.appendChild(node);
}

export function renderPreview(host, nodes, log, { device } = {}) {
  return withBudget('preview', () => {
    host.innerHTML = '';
    const frame = el('div', 'device-frame');
    if (device) {
      frame.style.width = device.width + 'px';
      frame.style.maxWidth = '100%';
      frame.style.minHeight = Math.min(device.height, 520) + 'px';
    }
    const label = el('div', 'device-label', device ? `${device.label} · ${device.width}px` : 'preview');
    const root = el('div', 'preview-host');
    frame.appendChild(label);
    frame.appendChild(root);
    host.appendChild(frame);
    guard('preview-paint', () => {
      (nodes || []).forEach((n) => paintNode(root, n, log, 0));
    });
  });
}
