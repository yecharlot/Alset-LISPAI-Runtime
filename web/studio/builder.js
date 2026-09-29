import { CATALOG, TEMPLATES, THEME_COLORS, DEVICES, createNode, treeToLisp, treeToApp, applyLispSnippet } from './components.js';
import { EXAMPLES } from './examples.js';
import { renderAlsetPreview, stateDump, stateSet, stateLoad, clearAlsetStates } from './alsetBridge.js';
import { installGlobalTraps, onError, getLastError, guard, reportError, StudioError } from './sandbox.js';

const tree = [];
let selectedId = null;
let deviceId = 'mobile';
let lispDirty = false;

const $ = (id) => document.getElementById(id);

function log(msg) {
  const pre = $('console');
  if (!pre) return;
  pre.textContent += msg + '\n';
  pre.scrollTop = pre.scrollHeight;
}

function findNode(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return { node: list[i], list, index: i };
    if (list[i].children) {
      const r = findNode(list[i].children, id);
      if (r) return r;
    }
  }
  return null;
}

function showError(e) {
  const box = $('error-box');
  if (!box) return;
  if (!e) {
    box.classList.add('hidden');
    box.innerHTML = '';
    return;
  }
  box.classList.remove('hidden');
  box.innerHTML = `<strong>Error aislado</strong>
    <div>${e.message || e.error || e}</div>
    <div class="err-meta"><b>Patrón:</b> ${e.pattern || '—'}</div>
    <div class="err-meta"><b>Dónde:</b> ${e.where || '—'}</div>
    <div class="err-meta"><b>Corrección:</b> ${e.fix || '—'}</div>
    <button type="button" class="btn btn-ghost" id="btn-dismiss-err">Cerrar</button>`;
  $('btn-dismiss-err')?.addEventListener('click', () => showError(null));
}

function renderToolbox() {
  const box = $('toolbox');
  box.innerHTML = '';
  for (const g of CATALOG) {
    const lab = document.createElement('div');
    lab.className = 'group-label';
    lab.textContent = g.group;
    box.appendChild(lab);
    for (const item of g.items) {
      const t = document.createElement('div');
      t.className = 'tool';
      t.draggable = true;
      t.innerHTML = `<strong>${item.label}</strong><span>${item.type}</span>`;
      t.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('application/x-alset-type', item.type);
      });
      t.addEventListener('click', () => {
        tree.push(createNode(item.type));
        selectedId = tree.at(-1).id;
        refresh();
      });
      box.appendChild(t);
    }
  }
}

function renderTemplates() {
  const box = $('templates');
  if (!box) return;
  box.innerHTML = '';
  TEMPLATES.forEach((t) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-ghost tpl';
    b.textContent = t.name;
    b.onclick = () => {
      tree.length = 0;
      guard('template', () => {
        const nodes = t.build();
        nodes.forEach((n) => tree.push(n));
        selectedId = tree[0]?.id || null;
        refresh();
        log('plantilla ' + t.id);
      });
    };
    box.appendChild(b);
  });
}

function renderColors() {
  const box = $('colors');
  if (!box) return;
  box.innerHTML = '';
  Object.entries(THEME_COLORS).forEach(([k, v]) => {
    const s = document.createElement('button');
    s.type = 'button';
    s.className = 'swatch';
    s.title = k + ' ' + v;
    s.style.background = v;
    s.onclick = () => {
      navigator.clipboard?.writeText(v);
      log('color ' + k + ' ' + v);
    };
    box.appendChild(s);
  });
}

function nodeEl(n) {
  const d = document.createElement('div');
  d.className = 'node' + (n.id === selectedId ? ' selected' : '');
  d.innerHTML = `<div class="kind">${n.type}</div>
    <div class="label">${n.props?.text || n.props?.title || n.props?.name || n.props?.url || n.type}</div>
    <div class="meta">${n.id}${n.props?.state ? ' · state:' + n.props.state : ''}</div>`;
  d.onclick = (e) => {
    e.stopPropagation();
    selectedId = n.id;
    refresh();
  };
  if (Array.isArray(n.children)) {
    const ch = document.createElement('div');
    ch.className = 'node-children';
    ch.addEventListener('dragover', (e) => { e.preventDefault(); ch.classList.add('drag-over'); });
    ch.addEventListener('dragleave', () => ch.classList.remove('drag-over'));
    ch.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      ch.classList.remove('drag-over');
      const type = e.dataTransfer.getData('application/x-alset-type');
      if (!type) return;
      n.children.push(createNode(type));
      selectedId = n.children.at(-1).id;
      refresh();
    });
    n.children.forEach((c) => ch.appendChild(nodeEl(c)));
    d.appendChild(ch);
  }
  return d;
}

function renderCanvas() {
  const canvas = $('canvas');
  canvas.innerHTML = '';
  const hint = document.createElement('div');
  hint.className = 'drop-hint';
  hint.textContent = 'Arrastra componentes · clic selecciona · inputs no re-renderizan el árbol al escribir';
  canvas.appendChild(hint);
  tree.forEach((n) => canvas.appendChild(nodeEl(n)));
}

function renderProps() {
  const props = $('props');
  props.innerHTML = '';
  const hit = selectedId ? findNode(tree, selectedId) : null;
  if (!hit) {
    props.innerHTML = '<p class="hint-text">Selecciona un nodo</p>';
    return;
  }
  const n = hit.node;
  const title = document.createElement('div');
  title.innerHTML = `<strong>${n.type}</strong> <code>${n.id}</code>`;
  props.appendChild(title);
  Object.keys(n.props || {}).forEach((k) => {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    wrap.innerHTML = `<label>${k}</label>`;
    const input = document.createElement('input');
    input.value = n.props[k] ?? '';
    // fluid typing: update prop without full canvas rebuild until blur optional
    input.addEventListener('input', () => {
      n.props[k] = input.value;
      if (!lispDirty) $('lisp').value = treeToLisp(tree);
      // granular: only preview refresh
      paintPreviewOnly();
    });
    wrap.appendChild(input);
    props.appendChild(wrap);
  });
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'btn btn-ghost';
  del.textContent = 'Eliminar';
  del.onclick = () => {
    hit.list.splice(hit.index, 1);
    selectedId = null;
    refresh();
  };
  props.appendChild(del);
}

function paintPreviewOnly() {
  const device = DEVICES.find((d) => d.id === deviceId) || DEVICES[0];
  guard('preview', () =>
    renderAlsetPreview($('preview'), tree, log, { device })
  );
  // dump states without remounting — alsetState already recomposes granularly
  $('appjson').textContent = JSON.stringify(
    treeToApp(tree, { name: $('app-name').value, states: stateDump() }),
    null,
    2
  );
}

function refresh() {
  guard('refresh', () => {
    renderCanvas();
    renderProps();
    if (!lispDirty) $('lisp').value = treeToLisp(tree);
    paintPreviewOnly();
    $('status').textContent = tree.length + ' nodos';
    $('status').className = 'badge ok';
  });
}

export function bootBuilder() {
  installGlobalTraps(log);
  onError((e) => {
    showError(e);
    $('status').textContent = 'error aislado';
    $('status').className = 'badge err';
  });

  renderToolbox();
  renderTemplates();
  renderColors();

  const canvas = $('canvas');
  canvas.addEventListener('dragover', (e) => e.preventDefault());
  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/x-alset-type');
    if (!type || e.target.closest('.node-children')) return;
    tree.push(createNode(type));
    selectedId = tree.at(-1).id;
    refresh();
  });

  function paintDeviceButtons() {
    document.querySelectorAll('[data-device-btn]').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-device-btn') === deviceId);
    });
  }
  DEVICES.forEach((d) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-ghost';
    b.setAttribute('data-device-btn', d.id);
    b.textContent = d.label;
    b.onclick = () => {
      deviceId = d.id;
      paintDeviceButtons();
      paintPreviewOnly(); // hot-reload layout for this viewport
      log('preview · ' + d.label + ' (' + d.width + 'px) · hot-reload');
      const st = $('status');
      if (st) st.textContent = 'preview:' + d.id;
    };
    $('devices')?.appendChild(b);
  });
  paintDeviceButtons();

  $('btn-clear').onclick = () => {
    tree.length = 0;
    selectedId = null;
    showError(null);
    clearAlsetStates();
    refresh();
  };
  $('btn-clear-preview').onclick = () => {
    $('preview').innerHTML = '';
    log('preview limpiado');
  };
  $('lisp').addEventListener('input', () => { lispDirty = true; });
  $('btn-apply-lisp').onclick = () => {
    const src = $('lisp').value;
    let err = null;
    const n = guard('lisp', () => {
      try {
        return applyLispSnippet(src, tree);
      } catch (e) {
        err = e;
        return 0;
      }
    }, 0);
    if (err) {
      reportError(
        new StudioError(err.message || String(err), {
          pattern: 'lisp-parse',
          fix: 'Revisa paréntesis y formas. Ejemplo: (set-prop n1 text "Hola") o un árbol (ui (column …))',
          where: 'lisp',
        }),
        'lisp'
      );
      return;
    }
    if (n === 0) {
      reportError(
        new StudioError('LispAI: sin cambios aplicados. Usa set-prop o un árbol (ui …).', {
          pattern: 'lisp-empty',
          fix: '(set-prop n1 text "Hola")  ·  o pega un (ui (column (text "…") (row (button "A") (button "B"))))',
          where: 'lisp',
        }),
        'lisp'
      );
      return;
    }
    lispDirty = false;
    selectedId = tree[0]?.id || selectedId;
    refresh();
    log('LispAI aplicado · mutaciones: ' + n);
  };
  $('btn-sync-lisp').onclick = () => {
    lispDirty = false;
    $('lisp').value = treeToLisp(tree);
  };
  $('btn-export').onclick = () => {
    const app = treeToApp(tree, { name: $('app-name').value || 'app', states: stateDump() });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(app, null, 2)], { type: 'application/json' }));
    a.download = (app.name || 'app') + '.alset.json';
    a.click();
  };
  $('btn-deploy').onclick = async () => {
    const app = treeToApp(tree, { name: $('app-name').value || 'app', states: stateDump(), agent: 'studio' });
    try {
      const r = await fetch('/v1/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(app),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'deploy failed');
      const openUrl = j.url && j.url.startsWith('http') ? j.url : (location.origin + (j.url || '/'));
      log('deploy PWA ' + openUrl + ' rootcid=' + (j.rootcid || '—'));
      $('status').textContent = 'deployed';
      window.open(openUrl, '_blank', 'noopener');
    } catch (e) {
      reportError(e, 'deploy');
    }
  };

  // alsetState nativo recompondrá solo nodos dependientes; no remontamos el árbol aquí

  // Examples drawer
  const drawer = $('examples-drawer');
  const list = $('examples-list');
  if (list) {
    list.innerHTML = '';
    EXAMPLES.forEach((ex) => {
      const card = document.createElement('div');
      card.className = 'example-card';
      card.innerHTML = `<h4>${ex.name}</h4><p>${ex.blurb}</p>
        <div class="example-tags">${(ex.tags || []).map((t) => `<span>${t}</span>`).join('')}</div>`;
      const actions = document.createElement('div');
      actions.className = 'example-actions';
      const loadBtn = document.createElement('button');
      loadBtn.type = 'button';
      loadBtn.className = 'btn btn-ghost';
      loadBtn.textContent = 'Cargar';
      loadBtn.onclick = () => {
        tree.length = 0;
        guard('example', () => {
          ex.build().forEach((n) => tree.push(n));
          selectedId = tree[0]?.id || null;
          $('app-name').value = ex.id;
          refresh();
          log('ejemplo cargado: ' + ex.id);
        });
      };
      const runBtn = document.createElement('button');
      runBtn.type = 'button';
      runBtn.className = 'btn btn-blue';
      runBtn.textContent = 'Correr';
      runBtn.onclick = () => {
        loadBtn.onclick();
        paintPreviewOnly();
        log('ejemplo en preview: ' + ex.id);
      };
      const depBtn = document.createElement('button');
      depBtn.type = 'button';
      depBtn.className = 'btn btn-gold';
      depBtn.textContent = 'Desplegar';
      depBtn.onclick = async () => {
        loadBtn.onclick();
        $('btn-deploy')?.click();
      };
      actions.append(loadBtn, runBtn, depBtn);
      card.appendChild(actions);
      list.appendChild(card);
    });
  }
  $('btn-examples')?.addEventListener('click', () => drawer?.classList.toggle('hidden'));
  $('btn-close-examples')?.addEventListener('click', () => drawer?.classList.add('hidden'));

  // default template
  TEMPLATES.find((t) => t.id === 'dashboard')?.build().forEach((n) => tree.push(n));
  selectedId = tree[0]?.id || null;
  refresh();
  log('studio listo · paneles VS Code · ejemplos · Alset-JS');
}
