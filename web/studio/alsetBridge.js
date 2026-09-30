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
  Image,
  Layer,
  Icon,
  VideoNode,
  AudioNode,
  MapNode,
  List,
  mod,
  Theme,
  ALSET_ICONS,
} from '../alset/AlsetPulseCore.js';
import { THEME_COLORS } from './components.js';
import { paintTree } from './domPaint.js';
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
      if (p.src) {
        Image(p.src, mod().key(key).height(Number(p.height) || 120).width('100%').radius(8));
      } else {
        Text('(imagen sin src)', mod().key(key).sizeText(12).color(colorOf('muted')));
      }
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
        const vw = window.__ALSET_VIEWPORT_WIDTH__ || 1100;
        const forceWrap = p.wrap === true || p.wrap === 'true' || p.wrap === 'wrap' || vw <= 480;
        const wrap = forceWrap ? 'wrap' : 'nowrap';
        Row(
          mod().key(key).gap(gap).padding(pad)
            .addStyle('flexWrap', wrap)
            .addStyle('alignItems', 'stretch')
            .addStyle('flexDirection', 'row')
            .addStyle('width', '100%')
            .addStyle('maxWidth', '100%'),
          kids
        );
      } else if (n.type === 'card') {
        Card(mod().key(key).padding(pad || 14).gap(gap).background(Theme.current.surface), kids);
      } else if (n.type.startsWith('anim-')) {
        animWrap(n.type, p.duration, () => Column(mod().key(key).gap(gap).padding(pad), kids));
      } else {
        Column(mod().key(key).gap(gap).padding(pad), kids);
      }
      return;
    }

    case 'hamburger': {
      const openSt = getAlsetState(p.state || 'drawerOpen', false);
      Button(p.icon || '☰', () => openSt.set(!openSt.get()), mod()
        .key(key)
        .padding('8px 12px')
        .radius(8)
        .background(Theme.current.surface)
        .addStyle('flexShrink', '0'));
      return;
    }
    case 'drawer':
    case 'side-menu': {
      // Contained inside device frame — never position:fixed to the browser viewport
      const openSt = getAlsetState(p.state || 'drawerOpen', !!p.open);
      const open = !!openSt.get();
      const side = p.side === 'right' ? 'right' : 'left';
      const panelW = Math.min(280, Math.floor((window.__ALSET_VIEWPORT_WIDTH__ || 390) * 0.82));
      Layer(mod().key(key).position('relative').width('100%').addStyle('minHeight', open ? '120px' : '0'), () => {
        if (!open) {
          Text(p.title ? `(menú cerrado · ${p.title})` : '(menú cerrado)', mod().sizeText(11).color(colorOf('muted')));
          return;
        }
        // Scrim
        Column(
          mod()
            .key(key + '-scrim')
            .position('absolute')
            .top(0).left(0).right(0).bottom(0)
            .background('rgba(0,0,0,0.45)')
            .zIndex(20)
            .clickable(() => openSt.set(false)),
          null
        );
        // Panel
        Column(
          mod()
            .key(key + '-panel')
            .position('absolute')
            .top(0)
            .addStyle(side, '0')
            .width(panelW)
            .height('100%')
            .background(Theme.current.surface)
            .padding(14)
            .gap(8)
            .zIndex(21)
            .addStyle('boxShadow', '0 8px 24px rgba(0,0,0,0.35)')
            .addStyle('maxHeight', '100%')
            .addStyle('overflow', 'auto'),
          () => {
            Row(mod().gap(8).addStyle('alignItems', 'center').addStyle('justifyContent', 'space-between'), () => {
              Text(p.title || 'Menú', mod().sizeText(15).weight('700'));
              Button('✕', () => openSt.set(false), mod().padding('4px 10px').background('#2a3344'));
            });
            (n.children || []).forEach((c) => renderNode(c, log, depth + 1));
          }
        );
      });
      return;
    }
    case 'tabs-shell': {
      const tabSt = getAlsetState(p.state || 'tab', 0);
      const labels = String(p.tabs || 'Inicio,Más').split(',').map((s) => s.trim()).filter(Boolean);
      let idx = tabSt.get();
      if (typeof idx === 'string') {
        const i = labels.indexOf(idx);
        idx = i >= 0 ? i : 0;
      }
      idx = Number(idx) || 0;
      if (idx < 0 || idx >= labels.length) idx = 0;
      Column(mod().key(key).gap(10).width('100%').addStyle('maxWidth', '100%'), () => {
        Row(
          mod()
            .gap(4)
            .addStyle('flexWrap', 'wrap')
            .addStyle('width', '100%')
            .addStyle('overflow', 'hidden'),
          () => {
            labels.forEach((lab, i) => {
              Button(lab, () => tabSt.set(i), mod()
                .padding('8px 12px')
                .radius(8)
                .background(i === idx ? Theme.current.primary : Theme.current.surface)
                .addStyle('flexShrink', '1')
                .addStyle('maxWidth', '100%'));
            });
          }
        );
        const kids = n.children || [];
        if (kids[idx]) {
          Column(mod().key(key + '-pane-' + idx).gap(8).width('100%').padding(4), () => {
            renderNode(kids[idx], log, depth + 1);
          });
        } else {
          Text('Sin contenido para esta pestaña', mod().sizeText(12).color(colorOf('muted')));
        }
      });
      return;
    }
    case 'splash': {
      const st = getAlsetState(p.state || 'splash', true);
      const show = st.get() !== false;
      if (!show) return;
      const dur = Number(p.duration) || 1600;
      if (p.autoHide !== false && !window['__alset_splash_' + key]) {
        window['__alset_splash_' + key] = true;
        setTimeout(() => st.set(false), dur);
      }
      Column(
        mod()
          .key(key)
          .position('absolute')
          .top(0).left(0).right(0).bottom(0)
          .background(Theme.current.background || '#0b0e14')
          .align('center', 'center')
          .gap(10)
          .zIndex(30)
          .addStyle('minHeight', '200px'),
        () => {
          Text(p.title || 'Alset', mod().sizeText(22).weight('800').color(colorOf('primary')));
          Text(p.subtitle || 'Cargando…', mod().sizeText(13).color(colorOf('muted')));
        }
      );
      return;
    }
    case 'icon': {
      const name = p.name || p.icon || 'home';
      try {
        Icon(name, mod().key(key).size(Number(p.size) || 24).color(colorOf(p.color || 'primary')));
      } catch (_) {
        Text('◇ ' + name, mod().key(key).sizeText(14));
      }
      return;
    }
    case 'floating-button':
    case 'fab': {
      // Contained FAB (never position:fixed to the browser — stays in device frame)
      Button(
        p.text || '+',
        () => log && log('fab ' + (p.action || 'click')),
        mod()
          .key(key)
          .size(52, 52)
          .radius('50%')
          .background(Theme.current.primary)
          .align('center', 'center')
          .addStyle('alignSelf', 'flex-end')
          .addStyle('margin', '8px')
      );
      return;
    }
    case 'toast': {
      Text(p.text || 'Toast', mod().key(key).sizeText(12).padding(8).background(Theme.current.surface).radius(8));
      return;
    }
    case 'layer': {
      Layer(mod().key(key).position('relative').width('100%'), () => {
        (n.children || []).forEach((c) => renderNode(c, log, depth + 1));
      });
      return;
    }
    case 'gradient': {
      const from = p.from || '#1a1f2e';
      const to = p.to || Theme.current.primary;
      Column(
        mod()
          .key(key)
          .padding(Number(p.pad) || 12)
          .radius(12)
          .width('100%')
          .gap(8)
          .addStyle('backgroundImage', `linear-gradient(135deg, ${from}, ${to})`),
        () => {
          (n.children || []).forEach((c) => renderNode(c, log, depth + 1));
        }
      );
      return;
    }
    case 'video': {
      try {
        VideoNode(mod().key(key).width('100%').height(Number(p.height) || 160).radius(8));
      } catch (_) {
        Text('[video]', mod().key(key).sizeText(12).color(colorOf('muted')));
      }
      return;
    }
    case 'audio': {
      try {
        AudioNode(mod().key(key).width('100%'));
      } catch (_) {
        Text('[audio]', mod().key(key).sizeText(12).color(colorOf('muted')));
      }
      return;
    }
    case 'map': {
      try {
        MapNode(mod().key(key).width('100%').height(Number(p.height) || 180).radius(8), {
          lat: Number(p.lat) || 0,
          lng: Number(p.lng) || 0,
        });
      } catch (_) {
        Text('[mapa]', mod().key(key).sizeText(12).color(colorOf('muted')));
      }
      return;
    }
    case 'list-stream': {
      List(mod().key(key).width('100%').height(Number(p.height) || 160), () => {
        const st = getAlsetState(p.state || 'items', []);
        const data = Array.isArray(st.get()) ? st.get() : [];
        data.slice(0, 20).forEach((item, i) => {
          Text(typeof item === 'string' ? item : JSON.stringify(item), mod().key(key + '-s' + i).sizeText(12));
        });
      });
      return;
    }
    case 'animate': {
      Animate(
        () => {
          (n.children || []).forEach((c) => renderNode(c, log, depth + 1));
        },
        { duration: Number(p.duration) || 400 }
      );
      return;
    }

    case 'gate':
    case 'auth-gate': {
      const role = String(p.role || p.minRole || 'user');
      const session = getAlsetState('session', { role: 'guest', token: null });
      const s = session.get() || { role: 'guest' };
      const order = ['guest', 'user', 'operator', 'admin', 'master'];
      const ok = order.indexOf(String(s.role || 'guest')) >= order.indexOf(role);
      if (!ok) {
        Text(p.deny || ('Requiere rol: ' + role), mod().key(key).sizeText(13).color(colorOf('danger')));
        return;
      }
      Column(mod().key(key).gap(8), () => {
        (n.children || []).forEach((c) => renderNode(c, log, depth + 1));
      });
      return;
    }
    case 'login-token': {
      const userSt = getAlsetState(p.userState || 'user', '');
      const passSt = getAlsetState(p.passState || 'pass', '');
      const session = getAlsetState('session', { role: 'guest', token: null });
      Card(mod().key(key).padding(14).gap(8).background(Theme.current.surface), () => {
        Text(p.title || 'Acceso', mod().sizeText(16).weight('700'));
        Input(userSt, mod().padding(10).width('100%'), { placeholder: 'usuario' });
        Input(passSt, mod().padding(10).width('100%'), { placeholder: 'clave', type: 'password' });
        Button(p.button || 'Entrar', async () => {
          try {
            const r = await fetch('/v1/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: userSt.get(), password: passSt.get() }),
            });
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || 'login failed');
            session.set({ role: j.role || 'user', token: j.token, username: j.username });
            log && log('login ok · rol ' + (j.role || 'user'));
          } catch (e) {
            log && log('login error: ' + (e.message || e));
          }
        }, mod().background(Theme.current.primary));
      });
      return;
    }
    case 'role-badge': {
      const session = getAlsetState('session', { role: 'guest' });
      const s = session.get() || {};
      Text('Rol: ' + (s.role || 'guest'), mod().key(key).sizeText(12).color(colorOf('muted')));
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
    // Reset one-shot API flags so auto components re-fetch on each full paint
    Object.keys(window).forEach((k) => {
      if (k.startsWith('__alset_api_') || k.startsWith('__alset_persisted_')) {
        try { delete window[k]; } catch (_) { window[k] = false; }
      }
    });

    host.innerHTML = '';
    const frame = document.createElement('div');
    frame.className = 'device-frame';
    if (device) {
      frame.style.width = device.width + 'px';
      frame.style.maxWidth = '100%';
      frame.style.height = Math.min(device.height, 640) + 'px';
      frame.style.minHeight = Math.min(device.height, 640) + 'px';
      frame.style.overflow = 'hidden';
      frame.style.position = 'relative';
      window.__ALSET_VIEWPORT_WIDTH__ = device.width;
      frame.dataset.device = device.id || '';
    } else {
      window.__ALSET_VIEWPORT_WIDTH__ = undefined;
      frame.style.position = 'relative';
      frame.style.overflow = 'hidden';
    }
    const label = document.createElement('div');
    label.className = 'device-label';
    label.textContent = device
      ? `${device.label} · ${device.width}px · Alset-JS`
      : 'Alset-JS preview';
    const root = document.createElement('div');
    root.id = 'alset-preview-root';
    root.className = 'preview-host';
    root.style.minHeight = '80px';
    root.style.height = '100%';
    root.style.overflow = 'auto';
    root.style.position = 'relative';
    root.style.color = '#f4f4f5';
    root.style.boxSizing = 'border-box';
    frame.appendChild(label);
    frame.appendChild(root);
    host.appendChild(frame);

    applyThemeTokens(theme || THEME_COLORS);

    let mounted = false;
    try {
      guard('alset-mount', () => {
        // Clear any leftover children
        while (root.firstChild) root.removeChild(root.firstChild);
        alsetMount(root, () => {
          Column(mod().key('studio-preview-root').gap(10).padding(4).width('100%'), () => {
            const list = nodes || [];
            if (!list.length) {
              Text('Canvas vacío — arrastra componentes o carga un ejemplo', mod().sizeText(13).color(colorOf('muted')));
              return;
            }
            list.forEach((n) => renderNode(n, log, 0));
          });
        });
      });
      mounted = root.childNodes.length > 0;
    } catch (e) {
      reportError(e, 'alset-preview');
      mounted = false;
    }

    // Reliable fallback: full DOM painter (same component catalog)
    if (!mounted) {
      while (root.firstChild) root.removeChild(root.firstChild);
      label.textContent = (device ? `${device.label} · ${device.width}px · ` : '') + 'DOM preview';
      paintTree(root, nodes || [], log, 0);
      log && log('preview · modo DOM (fallback)');
    }

    // After microtask, if still empty, force DOM paint
    queueMicrotask(() => {
      if (!root.isConnected) return;
      if (!root.childNodes.length && (nodes || []).length) {
        paintTree(root, nodes, log, 0);
        label.textContent = (device ? `${device.label} · ${device.width}px · ` : '') + 'DOM preview';
        log && log('preview · relleno DOM post-mount');
      }
    });
  });
}
