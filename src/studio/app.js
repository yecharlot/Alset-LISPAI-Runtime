/**
 * Alset-LISPAI Studio — no-code / LispAI development surface
 */
import {
  AlsetInspector, Column, Row, Text, mod, alsetState, Theme
} from '../vendor/AlsetPulseCore.js';
import { createEnv, run } from '../lispai/eval.js';
import { renderNode, applyTheme } from '../bridge/render.js';
import { createConsole } from './console.js';
import { DEFAULT_PROGRAM } from '../examples/hello.js';

Theme.set({
  primary: '#E8C547',
  secondary: '#5B8DEF',
  background: '#0B0E14',
  surface: '#151B26',
  radius: 14
});

const GOLD = '#E8C547';
const BLUE = '#5B8DEF';
const GREEN = '#3DDC97';
const RED = '#F07178';
const MUTED = '#8B93A7';
const SURF = '#151B26';
const LINE = 'rgba(232,197,71,0.14)';

const source = alsetState(DEFAULT_PROGRAM);
const treeJson = alsetState('null');
const consoleLines = alsetState([]);
const lastError = alsetState('');
const rootcid = alsetState('—');
const mode = alsetState('lisp'); // lisp | blocks (future)
const offline = alsetState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

const cons = createConsole();
cons.subscribe((lines) => consoleLines.set(lines));

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => offline.set(false));
  window.addEventListener('offline', () => offline.set(true));
}

function card(fn) {
  return Column(mod().padding(12).gap(8)
    .addStyle('background', SURF)
    .addStyle('border', '1px solid ' + LINE)
    .addStyle('borderRadius', '12px'), fn);
}

function runProgram() {
  lastError.set('');
  const env = createEnv({
    ui: {
      setTree(tree) {
        treeJson.set(JSON.stringify(tree, null, 2));
        window.__ALSET_UI_TREE__ = tree;
      },
      log: (...a) => cons.log(...a),
      error: (...a) => cons.error(...a)
    }
  });
  try {
    const result = run(source.get(), env);
    if (env.rootcid) rootcid.set(env.rootcid);
    cons.log('eval ok', typeof result === 'object' ? JSON.stringify(result).slice(0, 80) : result);
    // force preview refresh flag
    treeJson.set(treeJson.get());
  } catch (e) {
    lastError.set(String(e.message || e));
    cons.error(String(e.message || e));
  }
}

function Preview() {
  const tree = window.__ALSET_UI_TREE__;
  return Column(mod().padding(12).gap(8)
    .addStyle('background', '#0f131a')
    .addStyle('border', '1px solid ' + LINE)
    .addStyle('borderRadius', '12px')
    .addStyle('minHeight', '220px'), () => {
    Text('PREVIEW · AlsetInspector', mod().sizeText(11).color(GOLD).weight('700').addStyle('letterSpacing', '0.08em'));
    if (!tree) {
      Text('Ejecute el programa LispAI para renderizar la UI.', mod().sizeText(13).color(MUTED));
      return;
    }
    try {
      renderNode(tree, {
        log: (...a) => cons.log(...a),
        onAction: (a) => cons.log('action', a)
      });
    } catch (e) {
      Text(String(e.message || e), mod().sizeText(13).color(RED));
    }
  });
}

function Toolbar() {
  return Row(mod().gap(8).align('center').addStyle('flexWrap', 'wrap'), () => {
    Column(mod().padding('10px 14px').addStyle('background', GOLD).addStyle('borderRadius', '10px')
      .addStyle('cursor', 'pointer').clickable(() => runProgram()), () => {
      Text('▶ Ejecutar LispAI', mod().sizeText(13).weight('700').color('#111'));
    });
    Column(mod().padding('10px 14px').addStyle('border', '1px solid ' + BLUE).addStyle('borderRadius', '10px')
      .addStyle('cursor', 'pointer').clickable(() => { cons.clear(); lastError.set(''); }), () => {
      Text('Limpiar consola', mod().sizeText(13).weight('600').color(BLUE));
    });
    Column(mod().padding('10px 14px').addStyle('border', '1px solid ' + LINE).addStyle('borderRadius', '10px')
      .addStyle('cursor', 'pointer').clickable(() => { source.set(DEFAULT_PROGRAM); }), () => {
      Text('Reset ejemplo', mod().sizeText(13).weight('600').color(MUTED));
    });
    Text(offline.get() ? 'OFFLINE' : 'ONLINE', mod().sizeText(11).weight('700')
      .color(offline.get() ? RED : GREEN).padding('6px 10px')
      .addStyle('border', '1px solid currentColor').addStyle('borderRadius', '999px'));
    Text('RootCID ' + rootcid.get(), mod().sizeText(11).color(MUTED));
  });
}

// Native textarea for Lisp source (Alset Input may be limited)
function ensureEditor() {
  let el = document.getElementById('lisp-editor');
  if (!el) {
    el = document.createElement('textarea');
    el.id = 'lisp-editor';
    el.spellcheck = false;
    Object.assign(el.style, {
      width: '100%', minHeight: '220px', resize: 'vertical',
      background: '#0a0d12', color: '#e8ecf4', border: '1px solid ' + LINE,
      borderRadius: '12px', padding: '12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: '13px', lineHeight: '1.45'
    });
    el.value = source.get();
    el.addEventListener('input', () => source.set(el.value));
  } else if (el.value !== source.get() && document.activeElement !== el) {
    el.value = source.get();
  }
  return el;
}

AlsetInspector(() => {
  applyTheme({});
  Column(mod().padding(16).gap(12).addStyle('maxWidth', '1200px').addStyle('margin', '0 auto')
    .addStyle('minHeight', '100dvh'), () => {
    Row(mod().align('center', 'space-between').addStyle('flexWrap', 'wrap').gap(8), () => {
      Column(mod().gap(2), () => {
        Text('ALSET · LISPAI RUNTIME', mod().sizeText(18).weight('900').color(GOLD).addStyle('letterSpacing', '0.06em'));
        Text('Motor no-code / simbólico sobre Alset-JS · mobile-first · offline-first',
          mod().sizeText(12).color(MUTED));
      });
      Text('Studio v0.1', mod().sizeText(11).color(BLUE).weight('600'));
    });

    Toolbar();

    if (lastError.get()) {
      card(() => {
        Text('ERROR', mod().sizeText(11).weight('700').color(RED));
        Text(lastError.get(), mod().sizeText(13).color(RED));
      });
    }

    // Editor host — mount textarea into a keyed container via DOM after paint
    Column(mod().gap(6).key('editor-host'), () => {
      Text('EDITOR LISPAI', mod().sizeText(11).weight('700').color(GOLD).addStyle('letterSpacing', '0.08em'));
      Column(mod().key('editor-slot').addStyle('minHeight', '220px'), () => {
        Text('Cargando editor…', mod().sizeText(12).color(MUTED));
      });
    });

    Row(mod().gap(12).addStyle('flexWrap', 'wrap').align('start'), () => {
      Column(mod().addStyle('flex', '1').addStyle('minWidth', '280px'), () => Preview());
      Column(mod().addStyle('flex', '1').addStyle('minWidth', '280px').gap(10), () => {
        card(() => {
          Text('UI COMO DATOS (árbol)', mod().sizeText(11).weight('700').color(GOLD));
          Text(treeJson.get() || 'null', mod().sizeText(11).color(MUTED)
            .addStyle('whiteSpace', 'pre-wrap').addStyle('fontFamily', 'ui-monospace, monospace')
            .addStyle('maxHeight', '200px').addStyle('overflow', 'auto'));
        });
        card(() => {
          Text('CONSOLA', mod().sizeText(11).weight('700').color(GOLD));
          const lines = consoleLines.get();
          if (!lines.length) Text('Sin mensajes', mod().sizeText(12).color(MUTED));
          for (const line of lines.slice(-12)) {
            Text((line.level === 'error' ? '✗ ' : '· ') + line.msg,
              mod().sizeText(12).color(line.level === 'error' ? RED : MUTED)
                .addStyle('fontFamily', 'ui-monospace, monospace'));
          }
        });
      });
    });

    card(() => {
      Text('INTEGRACIÓN', mod().sizeText(11).weight('700').color(GOLD));
      Text('LispAI manipula el espacio de UI como datos · Alset-JS resuena el DOM sin recomposición total · Genes/Agentes/Mind/RootCID son tokens del entorno simbólico · Estilos mobile-first offline-ready.',
        mod().sizeText(12).color(MUTED).addStyle('lineHeight', '1.45'));
    });
  });

  // attach textarea after microtask
  queueMicrotask(() => {
    const slot = document.querySelector('[data-alset-key="editor-slot"]') ||
      Array.from(document.querySelectorAll('div')).find((d) => d.textContent === 'Cargando editor…');
    // Find host by looking for editor-slot via Alset registry keys is unreliable;
    // append editor below header if needed
    let host = document.getElementById('lisp-editor-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'lisp-editor-host';
      host.style.cssText = 'max-width:1200px;margin:0 auto;padding:0 16px 8px;';
      const app = document.getElementById('app');
      if (app && app.firstChild) {
        // insert after first block approximately
        app.appendChild(host);
      } else {
        document.body.appendChild(host);
      }
    }
    const ed = ensureEditor();
    if (ed.parentElement !== host) {
      host.innerHTML = '';
      const lab = document.createElement('div');
      lab.textContent = 'PROGRAMA (edite y pulse Ejecutar)';
      lab.style.cssText = 'font-size:11px;color:#8B93A7;margin:0 0 6px;letter-spacing:0.08em;';
      host.appendChild(lab);
      host.appendChild(ed);
    }
  });
});

// auto-run once
setTimeout(() => runProgram(), 50);
