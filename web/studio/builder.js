import { CATALOG, TEMPLATES, THEME_COLORS, DEVICES, createNode, treeToLisp, treeToApp, applyLispSnippet , ALSET_ICONS } from './components.js';
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


function renderIcons() {
  const box = $('icons');
  if (!box) return;
  box.innerHTML = '';
  Object.entries(ALSET_ICONS).forEach(([name, glyph]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'icon-swatch';
    b.title = name;
    b.innerHTML = `<span class="glyph">${glyph}</span><span class="iname">${name}</span>`;
    b.addEventListener('click', () => {
      const node = createNode('icon', { name, size: 28, color: 'primary' });
      tree.push(node);
      renderCanvas();
      selectNode(node.id);
      setStatus('icon:' + name);
    });
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



/** Esquemas de props: selects en lugar de escribir a mano */
export const PROP_SCHEMA = {
  method: { type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
  side: { type: 'select', options: ['left', 'right'] },
  animated: { type: 'select', options: ['true', 'false'] },
  auto: { type: 'select', options: ['true', 'false'] },
  autoplay: { type: 'select', options: ['true', 'false'] },
  open: { type: 'select', options: ['true', 'false'] },
  multiple: { type: 'select', options: ['true', 'false'] },
  showRaw: { type: 'select', options: ['true', 'false'] },
  local: { type: 'select', options: ['true', 'false'] },
  weight: { type: 'select', options: ['400', '500', '600', '700', 'bold'] },
  color: { type: 'select', options: ['', 'primary', 'muted', 'text', 'secondary', '#f5c542', '#22d3ee', '#fb7185', '#a3e635', '#ffffff', '#0a0d12'], allowCustom: true },
  bg: { type: 'select', options: ['', 'primary', 'card', 'transparent', '#0a0d12', '#12171f', '#f5c542', 'linear-gradient(135deg,#0b0e14,#f5c542)'], allowCustom: true },
  theme: { type: 'select', options: ['gold-night', 'ocean', 'forest', 'rose', 'mono'] },
  kind: { type: 'select', options: ['circle', 'blob', 'rounded', 'cut', 'pill', 'hex', 'diamond'] },
  variant: { type: 'select', options: ['default', 'drawer'] },
  accept: { type: 'select', options: ['image/*', 'image/png,image/jpeg', '.pdf', '*/*'] },
  layer: { type: 'select', options: ['presentation', 'domain', 'data'] },
  pattern: { type: 'select', options: ['repository', 'factory', 'singleton', 'di'] },
  mode: { type: 'select', options: ['0', '1', '2'] },
  lifecycle: { type: 'select', options: ['mount', 'active', 'idle', 'unmount'] },
  src: { type: 'asset', accept: 'image/*' },
  url: { type: 'url-or-asset' },
  from: { type: 'select', options: ['#0b0e14', '#f5c542', '#5b9cf5', '#22d3ee', '#fb7185', 'transparent', 'rgba(0,0,0,0.75)'], allowCustom: true },
  to: { type: 'select', options: ['#f5c542', '#0b0e14', '#22d3ee', '#a3e635', 'transparent', 'rgba(0,0,0,0.85)'], allowCustom: true },
};

function fieldControl(k, n, onChange) {
  const schema = PROP_SCHEMA[k];
  const val = n.props[k] ?? '';
  if (schema?.type === 'select') {
    const wrap = document.createElement('div');
    wrap.className = 'field-row';
    const sel = document.createElement('select');
    sel.className = 'rt-input prop-select';
    const opts = schema.options.slice();
    if (schema.allowCustom && val !== '' && !opts.map(String).includes(String(val))) opts.unshift(String(val));
    opts.forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o === '' ? '— (vacío)' : o;
      if (String(o) === String(val)) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => onChange(sel.value));
    wrap.appendChild(sel);
    if (schema.allowCustom) {
      const custom = document.createElement('input');
      custom.className = 'rt-input';
      custom.placeholder = 'u otro valor…';
      custom.value = opts.map(String).includes(String(val)) ? '' : String(val);
      custom.addEventListener('change', () => { if (custom.value) onChange(custom.value); });
      wrap.appendChild(custom);
    }
    return wrap;
  }
  if (schema?.type === 'asset' || k === 'src' || (k === 'url' && /image|gradient|src/i.test(n.type))) {
    const wrap = document.createElement('div');
    wrap.className = 'field-row asset-row';
    const input = document.createElement('input');
    input.className = 'rt-input';
    input.value = val;
    input.placeholder = 'URL o elige archivo…';
    input.addEventListener('change', () => onChange(input.value));
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rt-btn prop-browse';
    btn.textContent = 'Examinar';
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = schema?.accept || 'image/*';
    file.style.display = 'none';
    btn.onclick = () => file.click();
    file.onchange = () => {
      const f = file.files && file.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        onChange(r.result);
        input.value = '(archivo local)';
      };
      r.readAsDataURL(f);
    };
    wrap.appendChild(input);
    wrap.appendChild(btn);
    wrap.appendChild(file);
    return wrap;
  }
  const input = document.createElement(k === 'text' || k === 'subtitle' || k === 'deny' || k === 'body' ? 'textarea' : 'input');
  input.className = 'rt-input';
  input.value = val;
  if (k === 'color' || k === 'bg') input.placeholder = '#hex o primary|muted|…';
  input.addEventListener('input', () => {
    let v = input.value;
    if (['x','y','width','height','radius','opacity','size','duration','value','pageSize','height'].includes(k) && v !== '' && !isNaN(Number(v))) v = Number(v);
    if (v === 'true') v = true;
    if (v === 'false') v = false;
    onChange(v);
  });
  return input;
}


function renderProps() {
  const props = $('props');
  props.innerHTML = '';
  const hit = selectedId ? findNode(tree, selectedId) : null;
  if (!hit) {
    props.innerHTML = '<p class="hint-text">Selecciona un nodo en el canvas o en el preview</p>';
    return;
  }
  const n = hit.node;
  if (!n.props) n.props = {};
  const title = document.createElement('div');
  title.innerHTML = `<strong>${n.type}</strong> <code>${n.id}</code>`;
  props.appendChild(title);

  const ensure = (k, def) => {
    if (n.props[k] === undefined || n.props[k] === null) n.props[k] = def;
  };
  // layout + style defaults so they always appear in the form
  ['text', 'title', 'subtitle', 'action', 'state', 'url', 'placeholder', 'tabs', 'bg', 'color', 'size', 'weight', 'x', 'y', 'width', 'height', 'radius', 'opacity', 'side', 'duration', 'animated', 'open'].forEach((k) => {
    if (k in (n.props || {}) || ['x','y','width','height','bg','color','radius','opacity'].includes(k)) {
      if (!(k in n.props)) n.props[k] = '';
    }
  });
  // Always show layout block for any node
  const layoutKeys = ['x', 'y', 'width', 'height', 'bg', 'color', 'radius', 'opacity', 'size'];
  layoutKeys.forEach((k) => {
    if (!(k in n.props)) n.props[k] = n.props[k] ?? '';
  });

  const section = (label) => {
    const h = document.createElement('h4');
    h.className = 'props-section';
    h.textContent = label;
    props.appendChild(h);
  };

  section('Contenido / datos');
  Object.keys(n.props).filter((k) => !layoutKeys.includes(k) && k !== 'devices').forEach((k) => {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    wrap.innerHTML = `<label>${k}</label>`;
    const ctrl = fieldControl(k, n, (v) => {
      if (v === 'true') v = true;
      if (v === 'false') v = false;
      n.props[k] = v;
      if (!lispDirty) $('lisp').value = treeToLisp(tree);
      paintPreviewOnly();
    });
    wrap.appendChild(ctrl);
    props.appendChild(wrap);
  });

  section('Layout · ' + deviceId + ' (preview)');
  const devHint = document.createElement('p');
  devHint.className = 'hint-text';
  devHint.textContent = 'Los cambios de arrastre se guardan en devices.' + deviceId + ' y afectan solo ese dispositivo.';
  props.appendChild(devHint);
  layoutKeys.forEach((k) => {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    wrap.innerHTML = `<label>${k}</label>`;
    const input = document.createElement('input');
    const d = (n.props.devices && n.props.devices[deviceId]) || {};
    const val = d[k] != null ? d[k] : (n.props[k] ?? '');
    input.value = val;
    input.addEventListener('input', () => {
      let v = input.value;
      if (v === '') {
        // unset — no forzar 0x0
        if (n.props.devices && n.props.devices[deviceId]) delete n.props.devices[deviceId][k];
        delete n.props[k];
        paintPreviewOnly();
        return;
      }
      if (!isNaN(Number(v)) && k !== 'bg' && k !== 'color') v = Number(v);
      if (!n.props.devices) n.props.devices = {};
      if (!n.props.devices[deviceId]) n.props.devices[deviceId] = {};
      n.props.devices[deviceId][k] = v;
      n.props[k] = v;
      paintPreviewOnly();
    });
    wrap.appendChild(input);
    props.appendChild(wrap);
  });

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'btn btn-ghost';
  del.textContent = 'Eliminar nodo';
  del.onclick = () => {
    hit.list.splice(hit.index, 1);
    selectedId = null;
    refresh();
  };
  props.appendChild(del);
}



function applyLayoutChange(nodeId, dev, patch) {
  const hit = findNode(tree, nodeId);
  if (!hit) return;
  const n = hit.node;
  if (!n.props) n.props = {};
  if (!n.props.devices) n.props.devices = {};
  if (!n.props.devices[dev]) n.props.devices[dev] = {};
  Object.assign(n.props.devices[dev], patch);
  Object.assign(n.props, patch);
  selectedId = nodeId;
  // light update: re-render props values + preview without full canvas rebuild thrash
  paintPreviewOnly();
  // debounce props panel
  if (!applyLayoutChange._t) {
    applyLayoutChange._t = setTimeout(() => {
      applyLayoutChange._t = null;
      renderProps();
    }, 120);
  }
}

function paintPreviewOnly() {
  const device = DEVICES.find((d) => d.id === deviceId) || DEVICES[0];
  const host = $('preview');
  guard('preview', () => {
    if (window.AlsetAppRuntime && window.AlsetAppRuntime.mount) {
      window.AlsetAppRuntime.mount(host, {
        device,
        tree,
        states: stateDump(),
        interactive: true,
        selectedId,
        log,
        onLayoutChange: applyLayoutChange,
        onEvent: (type, payload) => log('evento ' + type + ' ' + JSON.stringify(payload || {})),
      });
    } else {
      renderAlsetPreview(host, tree, log, { device });
    }
  });
  $('appjson').textContent = JSON.stringify(
    treeToApp(tree, { name: $('app-name').value, states: stateDump(), device: deviceId }),
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
  $('btn-run-preview')?.addEventListener('click', () => {
    paintPreviewOnly();
    log('Correr preview: re-montó ' + tree.length + ' nodos raíz en el panel Preview');
    $('status').textContent = 'preview ok';
    $('status').className = 'badge ok';
  });
  const pingBackend = async () => {
    try {
      const r = await fetch('/v1/health');
      const j = await r.json();
      log('backend /v1/health → ' + JSON.stringify(j));
      $('status').textContent = 'backend ok';
      $('status').className = 'badge ok';
    } catch (e) {
      log('backend error: ' + e.message);
      $('status').textContent = 'backend err';
      $('status').className = 'badge err';
    }
  };
  document.querySelectorAll('#btn-backend-ping').forEach((b) => b.addEventListener('click', pingBackend));
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
    try {
      const payload = treeToApp(tree, {
        name: $('app-name').value,
        states: stateDump(),
        device: deviceId,
      });
      const r = await fetch('/v1/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'deploy failed');
      let openUrl = j.url || ('/apps/' + encodeURIComponent($('app-name').value || 'app') + '/');
      if (!openUrl.startsWith('http')) openUrl = location.origin + openUrl;
      log('deploy PWA (mismo runtime que preview) → ' + openUrl);
      log('rootcid=' + (j.rootcid || '—'));
      $('status').textContent = 'deployed';
      $('status').className = 'badge ok';
      const win = window.open(openUrl, '_blank', 'noopener,noreferrer');
      if (!win) log('El navegador bloqueó la pestaña: abre manualmente ' + openUrl);
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
      runBtn.title = 'Carga el ejemplo y fuerza el preview (Alset-JS + DOM fallback)';
      runBtn.textContent = 'Correr preview';
      runBtn.onclick = () => {
        // Load tree, then hard-refresh preview so API/auto components fire again
        tree.length = 0;
        guard('example-run', () => {
          ex.build().forEach((n) => tree.push(n));
          selectedId = tree[0]?.id || null;
          $('app-name').value = ex.id;
          lispDirty = false;
          renderCanvas();
          renderProps();
          if (!lispDirty) $('lisp').value = treeToLisp(tree);
          paintPreviewOnly();
          log('Correr preview = cargar árbol + montar preview · ejemplo: ' + ex.id);
          log('Flujo: Cargar → editar canvas/props/LispAI → Correr preview → Desplegar PWA');
        });
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
  log('studio listo · pantalla completa');
  log('Correr preview = monta el árbol en el panel Preview (no despliega).');
  log('Desplegar PWA = escribe /apps/<nombre>/ y abre la app final.');
  log('LispAI (panel derecho) = lógica declarativa; Backend = /v1/health /v1/data /v1/auth/login');
}


  const btnFs = document.getElementById('btn-fullscreen');
  if (btnFs) btnFs.addEventListener('click', () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || (()=>{})).call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || (()=>{})).call(document);
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F11') { /* browser handles */ }
  });
