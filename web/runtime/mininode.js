/**
 * Alset MiniNode (browser) — Mind · Zyrion · mesh lite sin PrismaTec.
 * Se puede cargar en apps desplegadas: <script src="mininode.js">
 */
(function (global) {
  const facts = {};
  const episodes = [];
  const peers = new Map();
  const peerId = 'web-' + Math.random().toString(36).slice(2, 10);

  function ternary(f) {
    if (f === 0 || f === 1 || f === 2) return f | 0;
    if (f < 0.33) return 0;
    if (f < 0.66) return 1;
    return 2;
  }

  function evalZyrion(env, labels) {
    labels = labels || { 0: 'SEGUIR', 1: 'MATIZAR', 2: 'SUMIDERO' };
    let maxT = 0;
    for (const k of Object.keys(env || {})) {
      const t = ternary(Number(env[k]));
      if (t === 2) {
        maxT = 2;
        break;
      }
      if (t > maxT) maxT = t;
    }
    return { ok: true, ternary: maxT, label: labels[String(maxT)] || String(maxT), env };
  }

  function mindTick(text) {
    const t = String(text || '').toLowerCase().trim();
    const org = { dialog: 0, act: 0, mem: 0, self: 0, ethics: 0, curiosity: 0, humor: 0 };
    let voice = 'Te escucho.';
    let effect = 0;
    if (/borra|contraseña|password|reset/.test(t)) {
      org.ethics = 2;
      voice = 'No. Ethics 2: no ejecuto borrados ni secretos.';
    } else if (/^hola|^hey|^buenas/.test(t)) {
      voice = 'Hola. Mind lite en el navegador.';
    } else if (/qui[eé]n eres/.test(t)) {
      org.self = 2;
      voice = 'Alset Mind mini (JS). Órganos ternarios y memoria local.';
    } else if (/me llamo\s+(.+)/.test(t)) {
      const m = t.match(/me llamo\s+(.+)/);
      facts.nombre = m[1].trim();
      org.mem = 2;
      voice = 'Te llamas ' + facts.nombre + '.';
    } else if (/c[oó]mo me llamo/.test(t)) {
      org.mem = 2;
      voice = facts.nombre ? 'Te llamas ' + facts.nombre + '.' : 'Aún no me dijiste el nombre.';
    } else if (t) {
      org.dialog = 1;
      facts.ultimo = text;
      voice = 'Queda en memoria local de esta sesión.';
    }
    episodes.push({ text, org, ts: new Date().toISOString() });
    if (episodes.length > 64) episodes.shift();
    return { ok: true, voice, effect, organs: org };
  }

  const localState = Object.create(null);

  function lispEval(cmd) {
    cmd = String(cmd || '').trim();
    if (typeof globalThis.AlsetLispEngine !== 'undefined') {
      const host = {
        getState: (k) => {
          if (globalThis.__alsetStateGet) return globalThis.__alsetStateGet(k);
          return localState[k];
        },
        setState: (k, v) => {
          localState[k] = v;
          if (globalThis.__alsetStateSet) globalThis.__alsetStateSet(k, v);
        },
        dump: () => {
          if (globalThis.__alsetStateDump) return globalThis.__alsetStateDump();
          return { ...localState };
        },
      };
      return globalThis.AlsetLispEngine.eval(cmd, host);
    }
    if (cmd.startsWith('(+')) {
      const parts = cmd.replace(/[()]/g, ' ').trim().split(/\s+/).slice(1);
      const sum = parts.reduce((a, b) => a + (Number(b) || 0), 0);
      return { resultado: sum };
    }
    return { resultado: cmd, note: 'LispAI mini JS' };
  }

  // Gossip via BroadcastChannel + optional HTTP mesh
  let bc;
  try {
    bc = new BroadcastChannel('alset-mesh');
    bc.onmessage = (ev) => {
      const m = ev.data || {};
      if (m.id) peers.set(m.id, { ...m, seen: Date.now() });
    };
  } catch (_) {}

  function announce(name, payload) {
    const msg = { id: peerId, name: name || peerId, payload: payload || '', at: Date.now() };
    peers.set(peerId, msg);
    if (bc) bc.postMessage(msg);
    // optional rendezvous
    try {
      fetch('/api/mesh/announce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: peerId, name: msg.name, payload: String(payload || '') }),
      }).catch(() => {});
    } catch (_) {}
    return msg;
  }

  async function listPeers() {
    try {
      const r = await fetch('/api/mesh/peers');
      const j = await r.json();
      (j.peers || []).forEach((p) => peers.set(p.id || p.ID, p));
    } catch (_) {}
    return Array.from(peers.values());
  }

  const api = {
    peerId,
    mindTick,
    evalZyrion,
    lispEval,
    announce,
    listPeers,
    facts,
    episodes,
    info: () => ({
      ok: true,
      name: 'Alset MiniNode JS',
      peer_id: peerId,
      capabilities: ['mind', 'zyrion', 'lispai', 'mesh'],
    }),
  };

  global.AlsetMiniNode = api;
})(typeof window !== 'undefined' ? window : globalThis);
