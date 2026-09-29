export function createConsole() {
  const lines = [];
  const listeners = new Set();
  function emit() { listeners.forEach((fn) => fn(lines.slice())); }
  return {
    log(...args) {
      lines.push({ level: 'info', msg: args.map(String).join(' '), at: Date.now() });
      if (lines.length > 200) lines.shift();
      emit();
    },
    error(...args) {
      lines.push({ level: 'error', msg: args.map(String).join(' '), at: Date.now() });
      if (lines.length > 200) lines.shift();
      emit();
    },
    clear() { lines.length = 0; emit(); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    snapshot() { return lines.slice(); }
  };
}
