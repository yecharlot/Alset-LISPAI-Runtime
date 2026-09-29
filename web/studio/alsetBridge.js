/**
 * Full Alset-JS bridge: native alsetState + primitives.
 * Tree format remains alset-app/v1 (unchanged).
 */
import {
  alsetState,
  alsetMount,
  Column,
  Row,
  Text,
  Card,
  Button,
  Input,
  Spacer,
  Animate,
  mod,
  Theme,
} from '../alset/AlsetPulseCore.js';
import { THEME_COLORS } from './components.js';
import { guard, withBudget, reportError, StudioError } from './sandbox.js';

/** Shared native alsetState registry — granular subscribers inside Alset core */
const registry = new Map();

export function getAlsetState(name, initial = '') {
  const key = String(name || 'anon');
  if (!registry.has(key)) {
    registry.set(key, alsetState(initial));
  }
  return registry.get(key);
}

export function stateDump() {
  const out = {};
  for (const [k, st] of registry.entries()) {
    try {
      out[k] = st.get();
    } catch {
      out[k] = null;
    }
  }
  return out;
}

export function stateLoad(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    getAlsetState(k, v).set(v);
  }
}

export function stateSet(name, value) {
  getAlsetState(name).set(value);
}

export function clearAlsetStates() {
  registry.clear();
}

function colorOf(c) {
  if (!c) return THEME_COLORS.text;
  return THEME_COLORS[c] || c;
}

function applyThemeTokens(theme = {}) {
  Theme.set({
    primary: theme.primary || THEME_COLORS.primary || '#f5c542',
    secondary: theme.secondary || THEME_COLORS.secondary || '#5b9cf5',
    background: theme.background || THEME_COLORS.background || '#09090b',
    surface: theme.surface || THEME_COLORS.surface || '#161922',
    radius: 14,
  });
}

function animWrap(kind, duration, block) {
  const d = Number(duration) || 400;
  if (kind === 'slide' || kind === 'anim-slide') {
    return Animate(block, {
      from: { opacity: 0, transform: 'translateY(12px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      duration: d,
    });
  }
  if (kind === 'scale' || kind === 'anim-scale') {
    return Animate(block, {
      from: { opacity: 0, transform: 'scale(0.94)' },
      to: { opacity: 1, transform: 'scale(1)' },
      duration: d,
    });
  }
  // fade default
  return Animate(block, {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: d,
  });
}

async function restGet(url) {
  const r = await fetch(url);
  const t = await r.text();
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}

async function restPost(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const t = await r.text();
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}

/**
 * Render one studio node with Alset primitives.
 * Reads alsetState via .get() so Alset tracks deps → granular recompose.
 */
function renderNode(n, log, depth = 0) {
  if (!n || depth > 24) {
    if (depth > 24) {
      throw new StudioError('Árbol demasiado profundo para Alset', {
        pattern: 'max-depth',
        fix: 'Reduce anidación',
        where: 'alset-bridge',
      });
    }
    return;
  }
  const p = n.props || {};
  const key = n.id || undefined;

  switch (n.type) {
    case 'text': {
      Text(
        p.text || '',
        mod()
          .key(key)
          .sizeText(Number(p.size) || 15)
          .color(colorOf(p.color))
          .weight(p.weight === 'bold' ? '700' : '400')
      );
      return;
    }
    case 'button': {
      const handler = () => {
        log?.('action:' + (p.action || 'click'));
        if (p.state) {
          const st = getAlsetState(p.state, 0);
          const cur = Number(st.get()) || 0;
          st.set(cur + 1);
        }
      };
      const body = () =>
        Button(
          p.text || 'OK',
          handler,
          mod().key(key).padding('12px 18px').radius(12).background(Theme.current.primary)
        );
      if (p.anim) animWrap(p.anim, p.duration, body);
      else body();
      return;
    }
    case 'input': {
      const st = getAlsetState(p.state || 'input', '');
      Input(st, mod().key(key).padding(10).radius(8).background('#0a0d12').width('100%'), {
        placeholder: p.placeholder || '',
        type: p.type || 'text',
      });
      return;
    }
    case 'textarea': {
      // Alset Input is single-line; approximate with controlled note via state + Text helper
      const st = getAlsetState(p.state || 'notes', '');
      Input(st, mod().key(key).padding(10).radius(8).background('#0a0d12').width('100%'), {
        placeholder: p.placeholder || '',
        type: 'text',
      });
      return;
    }
    case 'spacer': {
      Spacer(Number(p.size) || 12);
      return;
    }
    case 'badge': {
      Text(p.text || 'BADGE', mod().key(key).sizeText(11).weight('700').color(colorOf(p.tone === 'ok' ? 'success' : p.tone === 'err' ? 'danger' : 'muted')));
      return;
    }
    case 'metric': {
      const st = p.state ? getAlsetState(p.state, p.value || '—') : null;
      Card(mod().key(key).padding(12).gap(4).background(Theme.current.surface), () => {
        Text(p.title || 'KPI', mod().sizeText(11).color(colorOf('muted')));
        Text(String(st ? st.get() : p.value || '—'), mod().sizeText(22).weight('800').color(colorOf('primary')));
        Text(p.hint || '', mod().sizeText(11).color(colorOf('muted')));
      });
      return;
    }
    case 'list': {
      const st = getAlsetState(p.state || 'items', []);
      const data = st.get();
      Column(mod().key(key).gap(4), () => {
        if (!Array.isArray(data) || !data.length) {
          Text(p.empty || 'Sin datos', mod().sizeText(12).color(colorOf('muted')));
        } else {
          data.slice(0, 40).forEach((item, i) => {
            Text(typeof item === 'string' ? item : JSON.stringify(item), mod().key(key + '-i' + i).sizeText(12));
          });
        }
      });
      return;
    }
    case 'table': {
      const st = getAlsetState(p.state || 'rows', []);
      let rows = st.get();
      if (rows && !Array.isArray(rows) && rows.items) rows = rows.items;
      if (!Array.isArray(rows)) rows = [];
      const cols = String(p.columns || 'id').split(',').map((s) => s.trim());
      Column(mod().key(key).gap(4), () => {
        Text(cols.join(' | '), mod().sizeText(11).weight('700').color(colorOf('muted')));
        rows.slice(0, 30).forEach((row, i) => {
          Text(cols.map((c) => (row?.[c] != null ? String(row[c]) : '')).join(' | '), mod().key(key + '-r' + i).sizeText(12));
        });
      });
      return;
    }
    case 'nav': {
      const st = getAlsetState(p.state || 'tab', '');
      Row(mod().key(key).gap(6).addStyle('flexWrap', 'wrap'), () => {
        String(p.tabs || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((t) => {
            Button(t, () => st.set(t), mod().padding(8).radius(8).background(st.get() === t ? Theme.current.primary : Theme.current.surface));
          });
      });
      return;
    }
    case 'hero': {
      Column(mod().key(key).gap(6).padding(8), () => {
        Text(p.title || '', mod().sizeText(22).weight('800').color(colorOf('primary')));
        Text(p.subtitle || '', mod().sizeText(13).color(colorOf('muted')));
      });
      return;
    }
    case 'form-login': {
      const user = getAlsetState(p.userState || 'user', '');
      const pass = getAlsetState(p.passState || 'pass', '');
      Card(mod().key(key).padding(14).gap(8), () => {
        Text(p.title || 'Login', mod().sizeText(16).weight('700'));
        Input(user, mod().padding(10).width('100%'), { placeholder: 'usuario' });
        Input(pass, mod().padding(10).width('100%'), { placeholder: 'clave', type: 'password' });
        Button('Entrar', () => log?.('login ' + user.get()), mod().padding(10).background(Theme.current.primary));
      });
      return;
    }
    case 'form-register': {
      const email = getAlsetState('reg_email', '');
      const name = getAlsetState('reg_nombre', '');
      Card(mod().key(key).padding(14).gap(8), () => {
        Text(p.title || 'Registro', mod().sizeText(16).weight('700'));
        Input(email, mod().padding(10).width('100%'), { placeholder: 'email' });
        Input(name, mod().padding(10).width('100%'), { placeholder: 'nombre' });
        Button('Crear', () => log?.('register'), mod().padding(10).background(Theme.current.primary));
      });
      return;
    }
    case 'form-contact': {
      const email = getAlsetState(p.emailState || 'email', '');
      const msg = getAlsetState(p.msgState || 'msg', '');
      Card(mod().key(key).padding(14).gap(8), () => {
        Text(p.title || 'Contacto', mod().sizeText(16).weight('700'));
        Input(email, mod().padding(10).width('100%'), { placeholder: 'email' });
        Input(msg, mod().padding(10).width('100%'), { placeholder: 'mensaje' });
        Button('Enviar', async () => {
          try {
            const res = await restPost('/v1/data', { email: email.get(), msg: msg.get() });
            getAlsetState('rows', []).set(res);
            log?.('POST /v1/data ok');
          } catch (e) {
            log?.('POST err ' + e.message);
          }
        }, mod().padding(10).background(Theme.current.primary));
      });
      return;
    }
    case 'form-search': {
      const st = getAlsetState(p.state || 'q', '');
      Input(st, mod().key(key).padding(10).width('100%'), { placeholder: p.placeholder || 'Buscar…' });
      return;
    }
    case 'select':
    case 'checkbox':
    case 'switch': {
      const st = getAlsetState(p.state || 'choice', p.options?.split?.(',')?.[0] || false);
      Row(mod().key(key).gap(8).align('center'), () => {
        Text((p.label || n.type) + ': ' + String(st.get()), mod().sizeText(13));
        Button('toggle', () => {
          if (n.type === 'checkbox' || n.type === 'switch') st.set(!st.get());
          else {
            const opts = String(p.options || 'A,B').split(',').map((s) => s.trim());
            const i = Math.max(0, opts.indexOf(String(st.get())));
            st.set(opts[(i + 1) % opts.length]);
          }
        }, mod().padding(8));
      });
      return;
    }
    case 'api': {
      Text('GET ' + (p.url || '') + ' → ' + (p.state || 'apiData'), mod().key(key).sizeText(11).color(colorOf('secondary')));
      if (p.auto && p.url) {
        // fire once per mount generation
        const flag = '__alset_api_' + (n.id || p.url);
        if (!window[flag]) {
          window[flag] = true;
          restGet(p.url)
            .then((data) => {
              getAlsetState(p.state || 'apiData', null).set(data);
              log?.('api ok');
            })
            .catch((e) => log?.('api err ' + e.message));
        }
      }
      return;
    }
    case 'api-post': {
      Text('POST ' + (p.url || '/v1/data'), mod().key(key).sizeText(11).color(colorOf('secondary')));
      return;
    }
    case 'state': {
      const st = getAlsetState(p.name || 'x', p.value ?? '');
      // ensure initial
      if (st.get() === '' || st.get() === undefined) st.set(p.value ?? '');
      Text(`state ${p.name}=${st.get()}`, mod().key(key).sizeText(11).color(colorOf('secondary')));
      return;
    }
    case 'persist': {
      const keyName = p.key || 'app.v1';
      const st = getAlsetState(p.state || 'count', 0);
      try {
        const raw = localStorage.getItem(keyName);
        if (raw != null && !window['__alset_persisted_' + keyName]) {
          window['__alset_persisted_' + keyName] = true;
          st.set(JSON.parse(raw));
        }
      } catch (_) {}
      Button('Guardar persistencia', () => {
        localStorage.setItem(keyName, JSON.stringify(st.get()));
        log?.('persist ' + keyName);
      }, mod().key(key).padding(10));
      return;
    }
    case 'ipfs': {
      if (p.cid) getAlsetState(p.state || 'ipfsDoc', null).set({ cid: p.cid });
      Text(`CID ${p.cid || '—'}`, mod().key(key).sizeText(12).color(colorOf('muted')));
      return;
    }
    case 'agent': {
      Text(`agent:${p.name || 'ui'} · ${p.note || ''}`, mod().key(key).sizeText(11).color(colorOf('success')));
      return;
    }
    case 'image': {
      Text(p.src ? `[img ${p.alt || ''}]` : '(imagen)', mod().key(key).sizeText(12).color(colorOf('muted')));
      return;
    }
    case 'column':
    case 'row':
    case 'card':
    case 'anim-fade':
    case 'anim-slide':
    case 'anim-scale': {
      const kids = () => {
        (n.children || []).forEach((c) => renderNode(c, log, depth + 1));
      };
      const gap = Number(p.gap) || 8;
      const pad = Number(p.pad) || 0;
      if (n.type === 'row') {
        Row(mod().key(key).gap(gap).padding(pad).addStyle('flexWrap', 'wrap'), kids);
      } else if (n.type === 'card') {
        Card(mod().key(key).padding(pad || 14).gap(gap).background(Theme.current.surface), kids);
      } else if (n.type.startsWith('anim-')) {
        animWrap(n.type, p.duration, () => Column(mod().key(key).gap(gap).padding(pad), kids));
      } else {
        Column(mod().key(key).gap(gap).padding(pad), kids);
      }
      return;
    }
    default:
      Text(String(n.type), mod().key(key).sizeText(12).color(colorOf('muted')));
  }
}

/**
 * Mount Alset-native preview into host element.
 * format tree unchanged.
 */
export function renderAlsetPreview(host, nodes, log, { device, theme } = {}) {
  return withBudget('alset-preview', () => {
    if (!host) return;
    // clear previous DOM + allow API flags to re-fire on full remount
    host.innerHTML = '';
    const frame = document.createElement('div');
    frame.className = 'device-frame';
    if (device) {
      frame.style.width = device.width + 'px';
      frame.style.maxWidth = '100%';
      frame.style.minHeight = Math.min(device.height, 480) + 'px';
    }
    const label = document.createElement('div');
    label.className = 'device-label';
    label.textContent = device
      ? `${device.label} · ${device.width}px · Alset-JS alsetState`
      : 'Alset-JS preview';
    const root = document.createElement('div');
    root.className = 'preview-host';
    root.style.minHeight = '80px';
    frame.appendChild(label);
    frame.appendChild(root);
    host.appendChild(frame);

    applyThemeTokens(theme || THEME_COLORS);

    guard('alset-mount', () => {
      alsetMount(root, () => {
        Column(mod().key('studio-preview-root').gap(10).padding(4), () => {
          (nodes || []).forEach((n) => renderNode(n, log, 0));
        });
      });
    });
  });
}
