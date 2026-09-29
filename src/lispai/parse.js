/**
 * Minimal LispAI tokenizer + parser (S-expressions).
 * Compatible in spirit with AlsetOS LispAI: lists, atoms, strings.
 */
export function tokenize(src) {
  const s = String(src || '')
    .replace(/;[^\n]*/g, '')
    .replace(/\(/g, ' ( ')
    .replace(/\)/g, ' ) ');
  const re = /"([^"\\]|\\.)*"|[^\s]+/g;
  const tokens = [];
  let m;
  while ((m = re.exec(s))) {
    let t = m[0];
    if (t.startsWith('"')) {
      tokens.push({ type: 'str', value: JSON.parse(t.replace(/\\n/g, '\n')) });
    } else {
      tokens.push({ type: 'atom', value: t });
    }
  }
  return tokens;
}

export function parseTokens(tokens) {
  if (!tokens.length) return null;
  function read() {
    if (!tokens.length) throw new Error('LispAI: unexpected end');
    const t = tokens.shift();
    if (t.type === 'atom' && t.value === '(') {
      const list = [];
      while (tokens.length && !(tokens[0].type === 'atom' && tokens[0].value === ')')) {
        list.push(read());
      }
      if (!tokens.length) throw new Error('LispAI: unclosed parenthesis');
      tokens.shift();
      return list;
    }
    if (t.type === 'atom' && t.value === ')') throw new Error('LispAI: unexpected )');
    if (t.type === 'str') return t.value;
    const v = t.value;
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v === 'nil' || v === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
    return { sym: v };
  }
  const forms = [];
  while (tokens.length) forms.push(read());
  return forms.length === 1 ? forms[0] : ['do', ...forms];
}

export function parse(src) {
  return parseTokens(tokenize(src));
}
