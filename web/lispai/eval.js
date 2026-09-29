/** LispAI evaluator — UI tree + memory. Pure ES. */
import { parse } from './parse.js';

const isSym = (x) => x && typeof x === 'object' && 's' in x;

export function createEnv() {
  return { mem: Object.create(null), vars: Object.create(null), tree: null, logs: [], rootcid: null };
}

export function evalForm(form, env) {
  if (form === null || typeof form === 'number' || typeof form === 'boolean' || typeof form === 'string') return form;
  if (isSym(form)) {
    const n = form.s;
    if (n in env.vars) return env.vars[n];
    if (n in env.mem) return env.mem[n];
    return n; // bare name as string for props
  }
  if (!Array.isArray(form) || form.length === 0) return form;
  const op = isSym(form[0]) ? form[0].s : form[0];
  if (typeof op !== 'string') throw new Error('operador inválido');

  switch (op) {
    case 'do': {
      let last = null;
      for (let i = 1; i < form.length; i++) last = evalForm(form[i], env);
      return last;
    }
    case 'quote': return form[1];
    case 'def': case 'set!': {
      const name = isSym(form[1]) ? form[1].s : String(form[1]);
      return (env.vars[name] = evalForm(form[2], env));
    }
    case 'recordar': {
      const k = String(evalForm(form[1], env));
      return (env.mem[k] = evalForm(form[2], env));
    }
    case 'leer': return env.mem[String(evalForm(form[1], env))] ?? null;
    case 'si': case 'if':
      return evalForm(form[1], env) ? evalForm(form[2], env) : (form[3] !== undefined ? evalForm(form[3], env) : null);
    case 'igual': case '=': return evalForm(form[1], env) === evalForm(form[2], env);
    case '+': return form.slice(1).reduce((a, b) => a + Number(evalForm(b, env)), 0);
    case 'str': return form.slice(1).map((x) => String(evalForm(x, env))).join('');
    case 'log': {
      const msg = form.slice(1).map((x) => evalForm(x, env));
      env.logs.push(msg.join(' '));
      return msg.at(-1) ?? null;
    }
    case 'rootcid': {
      const data = JSON.stringify(evalForm(form[1], env));
      let h = 2166136261;
      for (let i = 0; i < data.length; i++) h = Math.imul(h ^ data.charCodeAt(i), 16777619);
      env.rootcid = 'cid:' + (h >>> 0).toString(16);
      return env.rootcid;
    }
    case 'theme': {
      const t = {};
      for (let i = 1; i < form.length; i++) {
        const p = form[i];
        if (Array.isArray(p) && p.length >= 2) t[isSym(p[0]) ? p[0].s : p[0]] = evalForm(p[1], env);
      }
      return { kind: 'theme', theme: t };
    }
    case 'ui': {
      const children = form.slice(1).map((x) => evalForm(x, env));
      env.tree = { kind: 'ui', children };
      return env.tree;
    }
    case 'column': case 'row': case 'text': case 'button': case 'card':
      return widget(op, form.slice(1), env);
    default:
      throw new Error('forma desconocida: ' + op);
  }
}

function widget(kind, rest, env) {
  const props = {};
  const children = [];
  for (const item of rest) {
    if (Array.isArray(item) && item.length >= 1) {
      const k = isSym(item[0]) ? item[0].s : item[0];
      if (typeof k === 'string' && !['column', 'row', 'text', 'button', 'card', 'ui'].includes(k)) {
        props[k] = item.length === 2 ? evalForm(item[1], env) : item.slice(1).map((x) => evalForm(x, env));
      } else {
        children.push(evalForm(item, env));
      }
    } else if (typeof item === 'string' || typeof item === 'number') {
      if (kind === 'text' || kind === 'button') props.label = String(item);
      else children.push(item);
    } else {
      const v = evalForm(item, env);
      if (typeof v === 'string' && (kind === 'text' || kind === 'button') && props.label == null) props.label = v;
      else children.push(v);
    }
  }
  return { kind, props, children };
}

export function run(source) {
  const env = createEnv();
  const ast = parse(source);
  const result = evalForm(ast, env);
  return { result, env };
}
