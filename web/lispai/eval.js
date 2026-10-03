/** LispAI evaluator — UI forms + logic + auth tokens (pure ES module). */
import { parse } from './parse.js';

function isSym(x) {
  return x && typeof x === 'object' && typeof x.s === 'string';
}

function createEnv() {
  return {
    bindings: Object.create(null),
    tree: null,
    theme: null,
    session: { role: 'guest', token: null },
    log: [],
  };
}

function evalForm(form, env) {
  if (form == null) return null;
  if (typeof form === 'string' || typeof form === 'number' || typeof form === 'boolean') return form;
  if (isSym(form)) {
    const name = form.s;
    if (name in env.bindings) return env.bindings[name];
    return form;
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
    case 'def':
    case 'set!': {
      const name = isSym(form[1]) ? form[1].s : String(form[1]);
      const val = evalForm(form[2], env);
      env.bindings[name] = val;
      return val;
    }
    case 'theme': {
      const th = {};
      for (let i = 1; i < form.length; i++) {
        const item = form[i];
        if (Array.isArray(item) && item.length >= 2) {
          const k = isSym(item[0]) ? item[0].s : item[0];
          th[k] = evalForm(item[1], env);
        }
      }
      env.theme = th;
      return th;
    }
    case 'ui': {
      const kids = form.slice(1).map((x) => evalForm(x, env));
      env.tree = { kind: 'ui', props: {}, children: kids };
      return env.tree;
    }
    case 'recordar': {
      const k = String(evalForm(form[1], env));
      const v = evalForm(form[2], env);
      env.bindings['__mem_' + k] = v;
      return v;
    }
    case 'leer': {
      const k = String(evalForm(form[1], env));
      return env.bindings['__mem_' + k] ?? null;
    }
    case 'log':
    case 'mind-note': {
      const msg = form.slice(1).map((x) => evalForm(x, env));
      env.log.push(msg.join(' '));
      return msg.join(' ');
    }
    case 'rootcid':
      return evalForm(form[1], env);
    case 'gene':
    case 'agent':
      return { kind: op, name: isSym(form[1]) ? form[1].s : form[1], body: form[2] };
    case 'si': {
      const c = evalForm(form[1], env);
      return c ? evalForm(form[2], env) : evalForm(form[3], env);
    }
    case 'igual':
      return evalForm(form[1], env) === evalForm(form[2], env);
    case '+': {
      return form.slice(1).reduce((a, x) => a + Number(evalForm(x, env) || 0), 0);
    }
    case 'str':
      return form.slice(1).map((x) => String(evalForm(x, env) ?? '')).join('');
    case 'set-prop':
      return { kind: 'set-prop', id: isSym(form[1]) ? form[1].s : form[1], key: isSym(form[2]) ? form[2].s : form[2], value: evalForm(form[3], env) };
    case 'column':
    case 'row':
    case 'text':
    case 'button':
    case 'card':
    case 'input':
    case 'nav':
    case 'list':
    case 'table':
    case 'api':
    case 'hero':
    case 'metric':
    case 'spacer':
    case 'badge':
    case 'image':
    case 'auth-gate':
    case 'gate':
    case 'login-token':
    case 'role-badge':
    case 'form-login':
    case 'form-register':
    case 'form-contact':
    case 'select':
    case 'checkbox':
    case 'switch':
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
      const isWidget = [
        'column','row','text','button','card','input','nav','list','table','api','hero','metric',
        'spacer','badge','image','auth-gate','gate','login-token','role-badge','ui','form-login',
        'form-register','form-contact','select','checkbox','switch',
      ].includes(k);
      if (typeof k === 'string' && !isWidget) {
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
  if (props.label && props.text == null) props.text = props.label;
  return { kind, props, children };
}

export function run(source) {
  const env = createEnv();
  const ast = parse(source);
  const result = evalForm(ast, env);
  return { result, env };
}
