/** Runtime preview: tree + alsetState-like store + REST */
const store = new Map();
const listeners = new Set();

export function stateGet(name, fallback = '') {
  return store.has(name) ? store.get(name) : fallback;
}
export function stateSet(name, value) {
  store.set(name, value);
  listeners.forEach((fn) => fn(name, value));
}
export function stateSubscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function stateDump() {
  return Object.fromEntries(store.entries());
}

export async function restGet(url) {
  const r = await fetch(url);
  const text = await r.text();
  try { return JSON.parse(text); } catch { return text; }
}

export function renderPreview(host, nodes, log) {
  host.innerHTML = '';
  const root = document.createElement('div');
  root.className = 'preview-host';
  host.appendChild(root);

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function paint(parent, list) {
    for (const n of list || []) {
      const p = n.props || {};
      if (n.type === 'text') {
        const t = el('div', '', p.text || '');
        t.style.fontSize = (p.size || 15) + 'px';
        t.style.fontWeight = p.weight === 'bold' ? '700' : '400';
        t.style.color = p.color === 'primary' ? '#e8c547' : p.color === 'muted' ? '#8b93a7' : '#eef1f6';
        parent.appendChild(t);
      } else if (n.type === 'button') {
        const b = el('button', 'btn btn-gold', p.text || 'OK');
        b.onclick = () => {
          log?.('action:' + (p.action || 'click'));
          if (p.state) stateSet(p.state, String(Number(stateGet(p.state, 0)) + 1));
        };
        parent.appendChild(b);
      } else if (n.type === 'input') {
        const i = el('input');
        i.placeholder = p.placeholder || '';
        i.value = stateGet(p.state || 'input', '');
        i.oninput = () => stateSet(p.state || 'input', i.value);
        parent.appendChild(i);
      } else if (n.type === 'metric') {
        const box = el('div');
        box.style.cssText = 'padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:10px;margin-bottom:8px;';
        box.appendChild(el('div', '', p.title || 'KPI')).style.color = '#8b93a7';
        const v = el('div', '', stateGet(p.state, p.value || '—'));
        v.style.cssText = 'font-size:22px;font-weight:800;color:#e8c547;';
        box.appendChild(v);
        box.appendChild(el('div', '', p.hint || '')).style.cssText = 'font-size:11px;color:#8b93a7';
        parent.appendChild(box);
      } else if (n.type === 'list') {
        const data = stateGet(p.state || 'items', []);
        const box = el('div');
        if (!Array.isArray(data) || !data.length) box.appendChild(el('div', '', p.empty || 'Sin datos'));
        else data.forEach((item) => box.appendChild(el('div', '', typeof item === 'string' ? item : JSON.stringify(item))));
        parent.appendChild(box);
      } else if (n.type === 'api') {
        const box = el('div');
        box.style.cssText = 'font-size:12px;color:#8b93a7;padding:8px;border:1px dashed rgba(110,168,254,.35);border-radius:8px;';
        box.textContent = 'REST → ' + (p.url || '') + ' → state:' + (p.state || 'apiData');
        parent.appendChild(box);
        if (p.auto && p.url) {
          restGet(p.url).then((data) => {
            stateSet(p.state || 'apiData', data);
            log?.('api ok ' + p.url);
          }).catch((e) => log?.('api err ' + e.message));
        }
      } else if (n.type === 'state') {
        stateSet(p.name || 'x', p.value ?? '');
        parent.appendChild(el('div', '', `state ${p.name}=${stateGet(p.name)}`)).style.cssText = 'font-size:11px;color:#6ea8fe';
      } else if (n.type === 'ipfs') {
        parent.appendChild(el('div', '', `IPFS/CID ${p.cid || '(vacío)'} → ${p.state || 'ipfsDoc'}`)).style.cssText = 'font-size:12px;color:#8b93a7';
        if (p.cid) stateSet(p.state || 'ipfsDoc', { cid: p.cid, note: p.note || '' });
      } else if (n.type === 'spacer') {
        parent.appendChild(el('div')).style.height = (p.size || 12) + 'px';
      } else if (n.type === 'nav') {
        const tabs = String(p.tabs || '').split(',').map((s) => s.trim()).filter(Boolean);
        const row = el('div');
        row.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;';
        tabs.forEach((t) => {
          const b = el('button', 'btn btn-ghost', t);
          b.onclick = () => stateSet(p.state || 'tab', t);
          row.appendChild(b);
        });
        parent.appendChild(row);
      } else if (['column', 'row', 'card', 'form'].includes(n.type)) {
        const box = el('div');
        if (n.type === 'row') box.style.cssText = 'display:flex;flex-wrap:wrap;gap:' + (p.gap || 8) + 'px;';
        else box.style.cssText = 'display:flex;flex-direction:column;gap:' + (p.gap || 8) + 'px;padding:' + (p.pad || 0) + 'px;';
        if (n.type === 'card') box.style.cssText += 'background:#161b24;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;';
        paint(box, n.children || []);
        parent.appendChild(box);
      } else {
        parent.appendChild(el('div', '', n.type));
      }
    }
  }
  paint(root, nodes);
}
