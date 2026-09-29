/**
 * Error sandbox — never freeze the host tab.
 * All studio work runs through guarded calls + soft time budgets.
 */
export class StudioError extends Error {
  constructor(message, { pattern = '', fix = '', where = '' } = {}) {
    super(message);
    this.name = 'StudioError';
    this.pattern = pattern;
    this.fix = fix;
    this.where = where;
  }
  toJSON() {
    return {
      error: this.message,
      pattern: this.pattern,
      fix: this.fix,
      where: this.where,
    };
  }
}

let lastError = null;
const errorListeners = new Set();

export function getLastError() {
  return lastError;
}

export function onError(fn) {
  errorListeners.add(fn);
  return () => errorListeners.delete(fn);
}

export function reportError(err, where = 'studio') {
  const e =
    err instanceof StudioError
      ? err
      : new StudioError(String(err?.message || err), {
          pattern: err?.stack?.split('\n')[1]?.trim() || 'uncaught',
          fix: 'Revisa el nodo seleccionado, el LispAI o la URL REST. Usa «Limpiar preview» si el canvas quedó inconsistente.',
          where,
        });
  lastError = e;
  errorListeners.forEach((fn) => {
    try {
      fn(e);
    } catch (_) {}
  });
  return e;
}

/** Run fn; on throw, report and return fallback. Never rethrow to window. */
export function guard(where, fn, fallback = null) {
  try {
    return fn();
  } catch (err) {
    reportError(err, where);
    return fallback;
  }
}

/** Async guard */
export async function guardAsync(where, fn, fallback = null) {
  try {
    return await fn();
  } catch (err) {
    reportError(err, where);
    return fallback;
  }
}

/**
 * Soft budget: if render takes too long, abort and report.
 * Does not use SharedArrayBuffer (works in all browsers).
 */
export function withBudget(where, fn, ms = 80) {
  const t0 = performance.now();
  const result = guard(where, fn, null);
  const dt = performance.now() - t0;
  if (dt > ms) {
    reportError(
      new StudioError(`Render lento (${Math.round(dt)}ms) en ${where}`, {
        pattern: 'budget-exceeded',
        fix: 'Reduce nodos del canvas, desactiva animaciones o cierra preview multi-dispositivo temporalmente.',
        where,
      }),
      where
    );
  }
  return result;
}

/** Install global traps so uncaught errors don't brick UX */
export function installGlobalTraps(log) {
  window.addEventListener('error', (ev) => {
    reportError(ev.error || ev.message, 'window.error');
    ev.preventDefault?.();
    log?.('blocked: ' + (ev.message || 'error'));
  });
  window.addEventListener('unhandledrejection', (ev) => {
    reportError(ev.reason, 'unhandledrejection');
    ev.preventDefault?.();
    log?.('blocked promise: ' + String(ev.reason?.message || ev.reason));
  });
}
