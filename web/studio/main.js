/**
 * Studio host: ordered shell in HTML/CSS; preview = Alset-JS modules.
 * Served by Go. No npm.
 */
import { AlsetInspector } from '../alset/AlsetPulseCore.js';
import { run } from '../lispai/eval.js';
import { renderTree, applyTheme } from './render.js';

const EXAMPLE = `; Interfaz = datos · Alset-JS renderiza
(do
  (theme (primary "#e8c547") (background "#0c0f14") (surface "#161b24"))
  (def titulo "Panel de ejemplo")
  (rootcid titulo)
  (log "compilado")
  (ui
    (column (pad 8) (gap 12)
      (card (pad 16) (gap 8)
        (text titulo (size 20) (weight bold) (color primary))
        (text "Declarativo, reactivo a nivel de pulso Alset" (size 13) (color muted))
      )
      (row (gap 8)
        (button "Acción" (on-click "ok"))
        (button "Secundario" (bg secondary))
      )
    )
  )
)
`;

const editor = document.getElementById('editor');
const consoleEl = document.getElementById('console');
const treeEl = document.getElementById('tree');
const statusEl = document.getElementById('status');
const cidEl = document.getElementById('cid');
const preview = document.getElementById('preview');

let lastTree = null;

function setStatus(text, ok) {
  statusEl.textContent = text;
  statusEl.className = 'badge ' + (ok === false ? 'err' : ok ? 'ok' : '');
}

function logLine(msg, cls) {
  const line = document.createElement('div');
  if (cls) line.className = cls;
  line.textContent = msg;
  consoleEl.appendChild(line);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function clearConsole() {
  consoleEl.textContent = '';
}

function paintPreview() {
  preview.innerHTML = '';
  // AlsetInspector mounts on #app by default — temporarily use preview as root
  const prevId = preview.id;
  preview.id = 'app';
  try {
    applyTheme({});
    AlsetInspector(() => {
      if (!lastTree) {
        renderTree({ kind: 'text', props: { label: 'Ejecute un programa.', color: 'muted', size: 13 }, children: [] });
        return;
      }
      renderTree(lastTree, {
        onClick: (a) => logLine('click → ' + String(a), 'ok')
      });
    });
  } catch (e) {
    logLine(String(e.message || e), 'err');
  } finally {
    preview.id = prevId;
  }
}

function execute() {
  clearConsole();
  setStatus('ejecutando…');
  try {
    const { env } = run(editor.value);
    lastTree = env.tree;
    treeEl.textContent = lastTree ? JSON.stringify(lastTree, null, 2) : '(sin árbol ui)';
    if (env.rootcid) cidEl.textContent = env.rootcid;
    for (const l of env.logs) logLine(l, 'ok');
    logLine('OK', 'ok');
    setStatus('ok', true);
    paintPreview();
  } catch (e) {
    lastTree = null;
    treeEl.textContent = '';
    logLine(String(e.message || e), 'err');
    setStatus('error', false);
    paintPreview();
  }
}

editor.value = EXAMPLE;
document.getElementById('btn-run').addEventListener('click', execute);
document.getElementById('btn-reset').addEventListener('click', () => {
  editor.value = EXAMPLE;
  execute();
});

execute();
