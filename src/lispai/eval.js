/**
 * LispAI evaluator with UI + organism environment.
 * Symbolic programming over addressable interface space.
 */
import { parse } from './parse.js';

export function createEnv(extras = {}) {
  const env = {
    vars: Object.create(null),
    ui: null, // set by bridge: { nodes, setTree, log, error }
    memory: Object.create(null),
    agents: [],
    genes: [],
    rootcid: null,
    mind: { last: null },
    ...extras
  };
  env.vars.true = true;
  env.vars.false = false;
  env.vars.nil = null;
  return env;
}

function isSym(x) {
  return x && typeof x === 'object' && 'sym' in x;
}

function symName(x) {
  return isSym(x) ? x.sym : null;
}

export function evalForm(form, env) {
  if (form === null || form === undefined) return null;
  if (typeof form === 'number' || typeof form === 'boolean' || typeof form === 'string') return form;
  if (isSym(form)) {
    const n = form.sym;
    if (n in env.vars) return env.vars[n];
    if (n in env.memory) return env.memory[n];
    return form; // unbound symbol returned as-is for UI attrs
  }
  if (!Array.isArray(form)) return form;
  if (form.length === 0) return null;

  const op = symName(form[0]) || form[0];
  if (typeof op !== 'string') throw new Error('LispAI: operator must be symbol');

  // Special forms
  switch (op) {
    case 'quote':
      return form[1];
    case 'do': {
      let last = null;
      for (let i = 1; i < form.length; i++) last = evalForm(form[i], env);
      return last;
    }
    case 'def':
    case 'set!': {
      const name = symName(form[1]);
      if (!name) throw new Error('def/set! needs symbol');
      const val = evalForm(form[2], env);
      env.vars[name] = val;
      return val;
    }
    case 'recordar': {
      const k = String(evalForm(form[1], env));
      const v = evalForm(form[2], env);
      env.memory[k] = v;
      return v;
    }
    case 'leer': {
      const k = String(evalForm(form[1], env));
      return env.memory[k] ?? null;
    }
    case 'si':
    case 'if': {
      const cond = evalForm(form[1], env);
      return cond ? evalForm(form[2], env) : (form[3] !== undefined ? evalForm(form[3], env) : null);
    }
    case 'igual':
    case '=': {
      return evalForm(form[1], env) === evalForm(form[2], env);
    }
    case '+': {
      return form.slice(1).reduce((a, b) => a + Number(evalForm(b, env)), 0);
    }
    case 'str': {
      return form.slice(1).map((x) => String(evalForm(x, env))).join('');
    }
    case 'list':
      return form.slice(1).map((x) => evalForm(x, env));
    case 'ui':
      return evalUI(form.slice(1), env);
    case 'page':
      return { type: 'page', children: form.slice(1).map((x) => evalForm(x, env)) };
    case 'column':
    case 'row':
    case 'text':
    case 'button':
    case 'card':
    case 'spacer':
    case 'input':
      return evalWidget(op, form.slice(1), env);
    case 'theme': {
      const t = {};
      for (let i = 1; i < form.length; i++) {
        const pair = form[i];
        if (Array.isArray(pair) && pair.length >= 2) {
          t[symName(pair[0]) || pair[0]] = evalForm(pair[1], env);
        }
      }
      return { type: 'theme', value: t };
    }
    case 'gene': {
      const name = String(evalForm(form[1], env));
      const body = form[2];
      env.genes.push({ name, body });
      return name;
    }
    case 'agent': {
      const name = String(evalForm(form[1], env));
      env.agents.push({ name, at: Date.now() });
      return name;
    }
    case 'rootcid': {
      const payload = JSON.stringify(evalForm(form[1], env));
      // lightweight content id (not real IPFS — abstract token)
      let h = 0;
      for (let i = 0; i < payload.length; i++) h = ((h << 5) - h + payload.charCodeAt(i)) | 0;
      env.rootcid = 'cid:lisp:' + (h >>> 0).toString(16);
      return env.rootcid;
    }
    case 'mind-note': {
      const note = String(evalForm(form[1], env));
      env.mind.last = { note, at: Date.now() };
      return note;
    }
    case 'log': {
      const msg = form.slice(1).map((x) => evalForm(x, env));
      env.ui?.log?.(...msg);
      return msg[msg.length - 1] ?? null;
    }
    default:
      // function call if bound
      if (typeof env.vars[op] === 'function') {
        const args = form.slice(1).map((x) => evalForm(x, env));
        return env.vars[op](...args);
      }
      throw new Error('LispAI: unknown form ' + op);
  }
}

function evalUI(body, env) {
  const children = body.map((x) => evalForm(x, env));
  const tree = { type: 'ui', children };
  env.ui?.setTree?.(tree);
  return tree;
}

function evalWidget(type, rest, env) {
  const props = {};
  const children = [];
  for (const item of rest) {
    if (Array.isArray(item) && item.length >= 1) {
      const k = symName(item[0]);
      // style/prop pair: (pad 16) (gap 8) (color primary) (on-click ...)
      if (k && !['column', 'row', 'text', 'button', 'card', 'ui', 'page'].includes(k)) {
        props[k] = item.length === 2 ? evalForm(item[1], env) : item.slice(1).map((x) => evalForm(x, env));
        continue;
      }
      children.push(evalForm(item, env));
    } else if (typeof item === 'string' || typeof item === 'number') {
      if (type === 'text' || type === 'button') props.label = String(item);
      else children.push(item);
    } else if (isSym(item)) {
      props.label = item.sym;
    } else {
      children.push(evalForm(item, env));
    }
  }
  return { type, props, children };
}

export function run(source, env) {
  const ast = parse(source);
  return evalForm(ast, env);
}
