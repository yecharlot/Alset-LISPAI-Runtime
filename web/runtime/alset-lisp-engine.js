/**
 * Alset LispAI ↔ alsetState (motor fusionado)
 * Una sola memoria reactiva: lo que escribe Lisp lo ve la UI y viceversa.
 *
 * Formas soportadas:
 *   (get-state "nombre")
 *   (set-state "nombre" valor)
 *   (swap-state "nombre" valor)     ; alias set
 *   (incf-state "nombre" [delta])
 *   (toggle-state "nombre")
 *   (when-state "nombre" esperado cuerpo…)
 *   (states)                        ; dump
 *   (+ a b …) (- * /)
 *   (str a b …)
 *   (list a b …)
 *   (progn form…)
 *   (set-prop …) se delega al host si hay onSetProp
 */
(function (global) {
  function tokenize(src) {
    const s = String(src || '');
    const tokens = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
        i++;
        continue;
      }
      if (c === '(' || c === ')') {
        tokens.push(c);
        i++;
        continue;
      }
      if (c === '"') {
        let j = i + 1;
        let out = '';
        while (j < s.length && s[j] !== '"') {
          if (s[j] === '\\' && j + 1 < s.length) {
            out += s[j + 1];
            j += 2;
            continue;
          }
          out += s[j++];
        }
        tokens.push({ type: 'str', value: out });
        i = j + 1;
        continue;
      }
      let j = i;
      while (j < s.length && !/[\s()]/.test(s[j])) j++;
      const raw = s.slice(i, j);
      if (/^-?\d+(\.\d+)?$/.test(raw)) tokens.push({ type: 'num', value: Number(raw) });
      else if (raw === 'true') tokens.push({ type: 'bool', value: true });
      else if (raw === 'false') tokens.push({ type: 'bool', value: false });
      else if (raw === 'nil') tokens.push({ type: 'nil', value: null });
      else tokens.push({ type: 'sym', value: raw });
      i = j;
    }
    return tokens;
  }

  function parse(tokens) {
    let i = 0;
    function read() {
      if (i >= tokens.length) throw new Error('EOF inesperado');
      const t = tokens[i++];
      if (t === '(') {
        const list = [];
        while (i < tokens.length && tokens[i] !== ')') list.push(read());
        if (tokens[i] !== ')') throw new Error('falta )');
        i++;
        return list;
      }
      if (t === ')') throw new Error(') extra');
      return t;
    }
    const forms = [];
    while (i < tokens.length) forms.push(read());
    return forms;
  }

  function atomVal(a) {
    if (a == null) return null;
    if (typeof a === 'object' && a.type) {
      if (a.type === 'str' || a.type === 'num' || a.type === 'bool') return a.value;
      if (a.type === 'nil') return null;
      if (a.type === 'sym') return a.value;
    }
    return a;
  }

  /**
   * @param {string} src
   * @param {{ getState:(k:string)=>any, setState:(k:string,v:any)=>void, dump:()=>object, onSetProp?: Function, remount?: Function }} host
   */
  function evalLisp(src, host) {
    host = host || {};
    const getState = host.getState || (() => undefined);
    const setState = host.setState || (() => {});
    const dump = host.dump || (() => ({}));

    function evalForm(form) {
      if (form == null) return null;
      if (!Array.isArray(form)) return atomVal(form);
      if (form.length === 0) return null;
      const head = form[0];
      const op = typeof head === 'object' && head.type === 'sym' ? head.value : atomVal(head);
      const args = form.slice(1);

      if (op === 'progn' || op === 'do') {
        let last = null;
        for (const a of args) last = evalForm(a);
        return last;
      }
      if (op === 'quote') return args[0];
      if (op === 'list') return args.map(evalForm);
      if (op === 'str' || op === 'concat') return args.map((a) => String(evalForm(a) ?? '')).join('');
      if (op === '+' || op === '-' || op === '*' || op === '/') {
        const nums = args.map((a) => Number(evalForm(a)) || 0);
        if (op === '+') return nums.reduce((x, y) => x + y, 0);
        if (op === '*') return nums.reduce((x, y) => x * y, 1);
        if (op === '-') return nums.length === 1 ? -nums[0] : nums.reduce((x, y) => x - y);
        if (op === '/') return nums.reduce((x, y) => x / y);
      }
      if (op === 'get-state' || op === 'get') {
        const k = String(evalForm(args[0]) ?? '');
        return getState(k);
      }
      if (op === 'set-state' || op === 'set' || op === 'swap-state') {
        const k = String(evalForm(args[0]) ?? '');
        const v = evalForm(args[1]);
        setState(k, v);
        if (host.remount) host.remount();
        return v;
      }
      if (op === 'incf-state' || op === 'incf') {
        const k = String(evalForm(args[0]) ?? '');
        const d = args[1] != null ? Number(evalForm(args[1])) || 0 : 1;
        const cur = Number(getState(k)) || 0;
        const v = cur + d;
        setState(k, v);
        if (host.remount) host.remount();
        return v;
      }
      if (op === 'toggle-state' || op === 'toggle') {
        const k = String(evalForm(args[0]) ?? '');
        const v = !getState(k);
        setState(k, v);
        if (host.remount) host.remount();
        return v;
      }
      if (op === 'when-state') {
        const k = String(evalForm(args[0]) ?? '');
        const expected = evalForm(args[1]);
        const cur = getState(k);
        if (cur == expected || String(cur) === String(expected)) {
          let last = null;
          for (let i = 2; i < args.length; i++) last = evalForm(args[i]);
          return last;
        }
        return null;
      }
      if (op === 'states' || op === 'dump-state') return dump();
      if (op === 'set-prop' && host.onSetProp) {
        return host.onSetProp(args.map(evalForm));
      }
      // Fallback: si el host tiene evalUiTree para (ui …)
      if (op === 'ui' && host.onUi) return host.onUi(form);
      return { error: 'forma desconocida', op, hint: 'get-state set-state incf-state toggle-state when-state states + -' };
    }

    try {
      const forms = parse(tokenize(src));
      let last = null;
      for (const f of forms) last = evalForm(f);
      return { ok: true, resultado: last, states: dump() };
    } catch (e) {
      return { ok: false, error: String(e.message || e) };
    }
  }

  function makeHostFromRegistry(registryApi) {
    return {
      getState: (k) => {
        try {
          return registryApi.get(k);
        } catch {
          return undefined;
        }
      },
      setState: (k, v) => registryApi.set(k, v),
      dump: () => registryApi.dump(),
      remount: registryApi.remount,
      onSetProp: registryApi.onSetProp,
      onUi: registryApi.onUi,
    };
  }

  global.AlsetLispEngine = { eval: evalLisp, makeHostFromRegistry, tokenize, parse };
})(typeof window !== 'undefined' ? window : globalThis);
