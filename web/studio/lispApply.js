/**
 * Apply LispAI source to the studio tree.
 * Supports:
 *  - Full (ui …) / (column …) trees (replaces canvas)
 *  - (set-prop id key "value") patches
 *  - (set-state name value) → returned for caller to apply alsetState
 *  - (do …) sequences
 */
import { parse } from '../lispai/parse.js';
import { uid } from './components.js';

const isSym = (x) => x && typeof x === 'object' && 's' in x;
const sym = (x) => (isSym(x) ? x.s : typeof x === 'string' ? x : null);

const UI_TYPES = new Set([
  'ui', 'column', 'row', 'text', 'button', 'card', 'input', 'textarea', 'spacer',
  'badge', 'metric', 'list', 'table', 'nav', 'hero', 'form-login', 'form-register',
  'form-contact', 'form-search', 'select', 'checkbox', 'switch', 'api', 'api-post',
  'state', 'persist', 'ipfs', 'agent', 'image', 'anim-fade', 'anim-slide', 'anim-scale',
]);

function toVal(x) {
  if (isSym(x)) return x.s;
  return x;
}

function widgetFromList(list) {
  if (!Array.isArray(list) || !list.length) return null;
  const op = sym(list[0]) || list[0];
  if (typeof op !== 'string') return null;

  if (op === 'ui') {
    const children = [];
    for (let i = 1; i < list.length; i++) {
      const c = widgetFromList(list[i]);
      if (c) children.push(c);
    }
    // unwrap single column if present
    return children;
  }

  if (op === 'do') {
    const out = [];
    for (let i = 1; i < list.length; i++) {
      const c = widgetFromList(list[i]);
      if (Array.isArray(c)) out.push(...c);
      else if (c) out.push(c);
    }
    return out;
  }

  if (!UI_TYPES.has(op) && op !== 'set-prop' && op !== 'set-state') return null;
  if (op === 'set-prop' || op === 'set-state') return null;

  const props = {};
  const children = [];
  for (let i = 1; i < list.length; i++) {
    const item = list[i];
    if (Array.isArray(item) && item.length >= 1) {
      const k = sym(item[0]);
      if (k && UI_TYPES.has(k)) {
        const child = widgetFromList(item);
        if (child) {
          if (Array.isArray(child)) children.push(...child);
          else children.push(child);
        }
      } else if (k) {
        props[k] = item.length === 2 ? toVal(item[1]) : item.slice(1).map(toVal);
      }
    } else if (typeof item === 'string' || typeof item === 'number') {
      if (op === 'text' || op === 'button') props.text = String(item);
      else if (op === 'text' || op === 'button') props.label = String(item);
    }
  }
  // normalize text/button label
  if ((op === 'text' || op === 'button') && props.label && !props.text) props.text = props.label;

  const container = ['column', 'row', 'card', 'anim-fade', 'anim-slide', 'anim-scale', 'form'].includes(op);
  const node = {
    id: uid(),
    type: op === 'ui' ? 'column' : op,
    props,
    children: container || children.length ? children : undefined,
  };
  if (node.children && !Array.isArray(node.children)) node.children = [];
  return node;
}

function applySetProps(src, nodes) {
  const re = /\(set-prop\s+(\w+)\s+(\w+)\s+(?:"([^"]*)"|([^\s)]+))\)/g;
  let m;
  let n = 0;
  while ((m = re.exec(src))) {
    const id = m[1];
    const key = m[2];
    const val = m[3] !== undefined ? m[3] : m[4];
    const walk = (list) => {
      for (const node of list || []) {
        if (node.id === id) {
          const num = Number(val);
          node.props[key] = val !== '' && !Number.isNaN(num) && String(num) === val ? num : val;
          n++;
        }
        if (node.children) walk(node.children);
      }
    };
    walk(nodes);
  }
  return n;
}

function extractSetStates(src) {
  const re = /\(set-state\s+(\w+)\s+(?:"([^"]*)"|([^\s)]+))\)/g;
  const out = [];
  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
    const raw = m[2] !== undefined ? m[2] : m[3];
    const num = Number(raw);
    out.push({ name, value: raw !== '' && !Number.isNaN(num) && String(num) === raw ? num : raw });
  }
  return out;
}

/**
 * @returns {{ mode: 'tree'|'patch'|'empty', nodes?: any[], patches: number, states: {name,value}[], message: string }}
 */
export function applyLispSource(src, currentNodes) {
  const text = String(src || '').trim();
  if (!text) {
    return { mode: 'empty', patches: 0, states: [], message: 'Lisp vacío' };
  }

  const states = extractSetStates(text);
  const patches = applySetProps(text, currentNodes);

  // Try full tree parse when it looks like UI
  if (/\(\s*ui\b/.test(text) || /^\(\s*(column|row|card|do)\b/.test(text)) {
    try {
      const ast = parse(text);
      const built = widgetFromList(ast);
      let nodes = [];
      if (Array.isArray(built)) nodes = built;
      else if (built) nodes = [built];
      if (nodes.length) {
        return {
          mode: 'tree',
          nodes,
          patches,
          states,
          message: `Árbol LispAI aplicado (${nodes.length} raíz/raíces)` + (patches ? ` + ${patches} set-prop` : ''),
        };
      }
    } catch (e) {
      if (patches === 0 && states.length === 0) {
        throw e;
      }
    }
  }

  if (patches > 0 || states.length > 0) {
    return {
      mode: 'patch',
      patches,
      states,
      message: `${patches} set-prop` + (states.length ? `, ${states.length} set-state` : ''),
    };
  }

  // Last attempt: parse any UI fragment
  try {
    const ast = parse(text);
    const built = widgetFromList(ast);
    let nodes = Array.isArray(built) ? built : built ? [built] : [];
    if (nodes.length) {
      return { mode: 'tree', nodes, patches: 0, states, message: 'Árbol LispAI aplicado' };
    }
  } catch (e) {
    const err = new Error(
      'LispAI no reconocido. Use (ui (column …)), (set-prop id key "valor") o (set-state name valor). ' +
        String(e.message || e)
    );
    err.pattern = 'lisp-parse';
    err.fix = 'Sincroniza desde el árbol (Sync) y edita, o escribe (set-prop n1 text "Hola")';
    throw err;
  }

  const err = new Error('Nada que aplicar. Escriba un árbol (ui …) o (set-prop id key "valor").');
  err.pattern = 'lisp-empty-apply';
  err.fix = 'Botón Sync árbol → edita props → Aplicar. O: (set-prop n1 text "Hola")';
  throw err;
}
