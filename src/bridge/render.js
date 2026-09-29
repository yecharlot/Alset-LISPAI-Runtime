/**
 * Render LispAI UI tree → Alset-JS primitives (no full DOM recomposition model).
 */
import {
  Column, Row, Text, mod, Theme
} from '../vendor/AlsetPulseCore.js';

const COLORS = {
  primary: '#E8C547',
  secondary: '#5B8DEF',
  background: '#0B0E14',
  surface: '#151B26',
  muted: '#8B93A7',
  success: '#3DDC97',
  danger: '#F07178',
  text: '#EEF1F6'
};

export function applyTheme(t = {}) {
  Theme.set({
    primary: t.primary || COLORS.primary,
    secondary: t.secondary || COLORS.secondary,
    background: t.background || COLORS.background,
    surface: t.surface || COLORS.surface,
    radius: t.radius ?? 14
  });
}

function colorOf(c) {
  if (!c) return COLORS.text;
  if (c && typeof c === 'object' && c.sym) c = c.sym;
  return COLORS[c] || c;
}

function buildMod(props = {}) {
  let m = mod();
  if (props.pad != null) m = m.padding(Number(props.pad));
  if (props.padding != null) m = m.padding(Number(props.padding));
  if (props.gap != null) m = m.gap(Number(props.gap));
  if (props.margin != null) m = m.margin(String(props.margin));
  if (props.bg || props.background) {
    m = m.addStyle('background', colorOf(props.bg || props.background));
  }
  if (props.radius != null) m = m.addStyle('borderRadius', props.radius + 'px');
  if (props.width) m = m.addStyle('width', typeof props.width === 'number' ? props.width + 'px' : props.width);
  if (props.flex) m = m.addStyle('flex', String(props.flex));
  if (props.wrap) m = m.addStyle('flexWrap', 'wrap');
  if (props.center) m = m.align('center', 'center');
  if (props.border) m = m.addStyle('border', props.border === true ? '1px solid rgba(232,197,71,0.15)' : String(props.border));
  return m;
}

export function renderNode(node, ctx = {}) {
  if (node == null) return;
  if (typeof node === 'string' || typeof node === 'number') {
    Text(String(node), mod().sizeText(14).color(COLORS.text));
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((n) => renderNode(n, ctx));
    return;
  }
  if (node.type === 'theme') {
    applyTheme(node.value);
    return;
  }
  if (node.type === 'ui' || node.type === 'page') {
    (node.children || []).forEach((c) => renderNode(c, ctx));
    return;
  }

  const props = node.props || {};
  const children = node.children || [];

  if (node.type === 'text') {
    let m = mod().sizeText(Number(props.size) || 15).color(colorOf(props.color));
    if (props.weight === 'bold' || props.weight === 700) m = m.weight('700');
    if (props.weight) m = m.weight(String(props.weight));
    if (props.muted) m = m.color(COLORS.muted);
    Text(String(props.label ?? props.text ?? ''), m);
    return;
  }

  if (node.type === 'button') {
    const m = buildMod({ ...props, pad: props.pad ?? 12, radius: props.radius ?? 12, bg: props.bg || 'primary' })
      .addStyle('cursor', 'pointer')
      .clickable(() => {
        if (typeof props['on-click'] === 'function') props['on-click']();
        else if (props['on-click']) ctx.onAction?.(props['on-click']);
        ctx.log?.('click', props.label);
      });
    Column(m, () => {
      Text(String(props.label || 'Button'), mod().sizeText(13).weight('700').color('#111'));
    });
    return;
  }

  if (node.type === 'card') {
    Column(
      buildMod({
        pad: props.pad ?? 16,
        gap: props.gap ?? 8,
        bg: props.bg || 'surface',
        radius: props.radius ?? 14,
        border: true,
        ...props
      }),
      () => children.forEach((c) => renderNode(c, ctx))
    );
    return;
  }

  if (node.type === 'spacer') {
    Column(mod().height(Number(props.size) || 12), () => {});
    return;
  }

  if (node.type === 'row') {
    Row(
      buildMod({ gap: props.gap ?? 8, ...props }).addStyle('flexWrap', props.wrap === false ? 'nowrap' : 'wrap'),
      () => children.forEach((c) => renderNode(c, ctx))
    );
    return;
  }

  // default column
  Column(
    buildMod({ gap: props.gap ?? 8, pad: props.pad, ...props }),
    () => children.forEach((c) => renderNode(c, ctx))
  );
}
