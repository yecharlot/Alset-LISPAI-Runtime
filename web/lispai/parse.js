/** LispAI — S-expression parser (pure ES module, no build). */
export function parse(src) {
  const tokens = [];
  const s = String(src || '').replace(/;[^\n]*/g, '').replace(/\(/g, ' ( ').replace(/\)/g, ' ) ');
  const re = /"([^"\\]|\\.)*"|[^\s]+/g;
  let m;
  while ((m = re.exec(s))) {
    const t = m[0];
    if (t.startsWith('"')) tokens.push(JSON.parse(t));
    else if (t === '(' || t === ')') tokens.push(t);
    else if (t === 'true') tokens.push(true);
    else if (t === 'false') tokens.push(false);
    else if (t === 'nil' || t === 'null') tokens.push(null);
    else if (/^-?\d+(\.\d+)?$/.test(t)) tokens.push(Number(t));
    else tokens.push({ s: t });
  }
  let i = 0;
  function read() {
    if (i >= tokens.length) throw new Error('fin inesperado');
    const t = tokens[i++];
    if (t === '(') {
      const list = [];
      while (i < tokens.length && tokens[i] !== ')') list.push(read());
      if (i >= tokens.length) throw new Error('falta )');
      i++;
      return list;
    }
    if (t === ')') throw new Error(') inesperado');
    return t;
  }
  const forms = [];
  while (i < tokens.length) forms.push(read());
  return forms.length === 1 ? forms[0] : [{ s: 'do' }, ...forms];
}
