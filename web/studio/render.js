/** Project LispAI UI tree onto Alset-JS primitives. */
import { Column, Row, Text, mod, Theme } from '../alset/AlsetPulseCore.js';

const C = {
  primary: '#e8c547', secondary: '#6ea8fe', background: '#0c0f14',
  surface: '#161b24', muted: '#9aa3b5', text: '#eef1f6', danger: '#f07178'
};

export function applyTheme(t = {}) {
  Theme.set({
    primary: t.primary || C.primary,
    secondary: t.secondary || C.secondary,
    background: t.background || C.background,
    surface: t.surface || C.surface,
    radius: Number(t.radius) || 12
  });
}

function col(x) {
  if (!x) return C.text;
  return C[x] || x;
}

function mprops(p = {}) {
  let m = mod();
  if (p.pad != null) m = m.padding(Number(p.pad));
  if (p.gap != null) m = m.gap(Number(p.gap));
  if (p.bg) m = m.addStyle('background', col(p.bg));
  if (p.radius != null) m = m.addStyle('borderRadius', p.radius + 'px');
  if (p.border) m = m.addStyle('border', '1px solid rgba(232,197,71,0.14)');
  if (p.wrap) m = m.addStyle('flexWrap', 'wrap');
  return m;
}

export function renderTree(node, ctx = {}) {
  if (node == null) return;
  if (typeof node === 'string' || typeof node === 'number') {
    Text(String(node), mod().sizeText(14).color(C.text));
    return;
  }
  if (Array.isArray(node)) { node.forEach((n) => renderTree(n, ctx)); return; }
  if (node.kind === 'theme') { applyTheme(node.theme); return; }
  if (node.kind === 'ui') { (node.children || []).forEach((c) => renderTree(c, ctx)); return; }

  const p = node.props || {};
  const ch = node.children || [];

  if (node.kind === 'text') {
    let m = mod().sizeText(Number(p.size) || 15).color(col(p.color));
    if (p.weight === 'bold' || p.weight === 700) m = m.weight('700');
    Text(String(p.label ?? ''), m);
    return;
  }
  if (node.kind === 'button') {
    Column(
      mprops({ pad: p.pad ?? 12, radius: 10, bg: p.bg || 'primary' })
        .addStyle('cursor', 'pointer')
        .clickable(() => ctx.onClick?.(p['on-click'] || p.label)),
      () => Text(String(p.label || 'OK'), mod().sizeText(13).weight('700').color('#111'))
    );
    return;
  }
  if (node.kind === 'card') {
    Column(mprops({ pad: p.pad ?? 16, gap: p.gap ?? 8, bg: 'surface', border: true, radius: 12, ...p }),
      () => ch.forEach((c) => renderTree(c, ctx)));
    return;
  }
  if (node.kind === 'row') {
    Row(mprops({ gap: p.gap ?? 8, wrap: true, ...p }), () => ch.forEach((c) => renderTree(c, ctx)));
    return;
  }
  Column(mprops({ gap: p.gap ?? 8, pad: p.pad, ...p }), () => ch.forEach((c) => renderTree(c, ctx)));
}
