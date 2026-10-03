/**
 * Runtime for deployed alset-app/v1 PWAs — loads tree and mounts Alset-JS.
 */
import { renderAlsetPreview, stateLoad } from './alsetBridge.js';

async function main() {
  const host = document.getElementById('app');
  const status = document.getElementById('boot-status');
  try {
    const r = await fetch('./app.alset.json');
    if (!r.ok) throw new Error('No app.alset.json');
    const app = await r.json();
    document.title = app.name || 'Alset App';
    if (app.states) stateLoad(app.states);
    const log = (m) => {
      const el = document.getElementById('run-log');
      if (el) el.textContent += m + '\n';
    };
    renderAlsetPreview(host, app.tree || [], log, {
      device: null,
      theme: app.theme,
    });
    if (status) status.textContent = (app.rootcid || '') + ' · ' + (app.agent || 'app');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  } catch (e) {
    if (status) status.textContent = String(e.message || e);
    host.textContent = 'Error al cargar la app: ' + (e.message || e);
  }
}
main();
