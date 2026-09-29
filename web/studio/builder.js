import { CATALOG, createNode, treeToLisp, treeToApp } from './components.js';
import { renderPreview, stateDump, stateSet, stateSubscribe } from './preview.js';

const tree = [];
let selectedId = null;

const $ = (id) => document.getElementById(id);

function findNode(list, id, parent = null) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return { node: list[i], list, index: i, parent };
    if (list[i].children) {
      const r = findNode(list[i].children, id, list[i]);
      if (r) return r;
    }
  }
  return null;
}

function log(msg) {
  const pre = $('console');
  pre.textContent += msg + '\n';
  pre.scrollTop = pre.scrollHeight;
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
        e.dataTransfer.effectAllowed = 'copy';
      });
      t.addEventListener('click', () => {
        tree.push(createNode(item.type));
        selectedId = tree[tree.length - 1].id;
        refresh();
      });
      box.appendChild(t);
    }
  }
}

function nodeEl(n) {
  const d = document.createElement('div');
  d.className = 'node' + (n.id === selectedId ? ' selected' : '');
  d.dataset.id = n.id;
  d.innerHTML = `<div class="kind">${n.type}</div><div class="label">${n.props?.text || n.props?.title || n.props?.name || n.props?.url || n.type}</div>`;
  if (n.props?.state) {
    const m = document.createElement('div');
    m.className = 'meta';
    m.textContent = 'state → ' + n.props.state;
    d.appendChild(m);
  }
  d.onclick = (e) => {
    e.stopPropagation();
    selectedId = n.id;
    refresh();
  };
  if (Array.isArray(n.children)) {
    const ch = document.createElement('div');
    ch.className = 'node-children';
    ch.dataset.parent = n.id;
    ch.addEventListener('dragover', (e) => { e.preventDefault(); ch.classList.add('drag-over'); });
    ch.addEventListener('dragleave', () => ch.classList.remove('drag-over'));
    ch.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      ch.classList.remove('drag-over');
      const type = e.dataTransfer.getData('application/x-alset-type');
      if (!type) return;
      n.children.push(createNode(type));
      selectedId = n.children[n.children.length - 1].id;
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
  hint.textContent = tree.length ? 'Arrastra componentes al canvas o dentro de Column/Row/Card' : 'Arrastra aquí desde la toolbox o haz clic en un componente';
  canvas.appendChild(hint);
  tree.forEach((n) => canvas.appendChild(nodeEl(n)));
}

function renderProps() {
  const props = $('props');
  props.innerHTML = '';
  const hit = selectedId ? findNode(tree, selectedId) : null;
  if (!hit) {
    props.innerHTML = '<p style="color:#8b93a7;font-size:13px">Selecciona un nodo del canvas</p>';
    return;
  }
  const n = hit.node;
  const title = document.createElement('div');
  title.innerHTML = `<strong>${n.type}</strong> <span style="color:#8b93a7">${n.id}</span>`;
  props.appendChild(title);

  function field(key, label, kind = 'text') {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    const lab = document.createElement('label');
    lab.textContent = label;
    let input;
    if (kind === 'textarea') {
      input = document.createElement('textarea');
      input.value = n.props[key] ?? '';
    } else {
      input = document.createElement('input');
      input.value = n.props[key] ?? '';
    }
    input.oninput = () => {
      n.props[key] = input.value;
      refresh(false);
    };
    wrap.appendChild(lab);
    wrap.appendChild(input);
    props.appendChild(wrap);
  }

  const keys = Object.keys(n.props || {});
  if (!keys.length) n.props.text = '';
  Object.keys(n.props).forEach((k) => field(k, k, k === 'url' || k === 'tabs' ? 'text' : 'text'));

  const del = document.createElement('button');
  del.className = 'btn btn-ghost';
  del.textContent = 'Eliminar nodo';
  del.onclick = () => {
    hit.list.splice(hit.index, 1);
    selectedId = null;
    refresh();
  };
  props.appendChild(del);
}

function refresh(full = true) {
  if (full) renderCanvas();
  renderProps();
  $('lisp').textContent = treeToLisp(tree);
  $('appjson').textContent = JSON.stringify(treeToApp(tree, { states: stateDump() }), null, 2);
  renderPreview($('preview'), tree, log);
  $('status').textContent = tree.length + ' nodos';
  $('status').className = 'badge ok';
}

function setupCanvasDrop() {
  const canvas = $('canvas');
  canvas.addEventListener('dragover', (e) => e.preventDefault());
  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/x-alset-type');
    if (!type) return;
    // if dropped on empty canvas root
    if (!e.target.closest('.node-children')) {
      tree.push(createNode(type));
      selectedId = tree[tree.length - 1].id;
      refresh();
    }
  });
}

export function bootBuilder() {
  renderToolbox();
  setupCanvasDrop();
  stateSubscribe(() => renderPreview($('preview'), tree, log));

  $('btn-clear').onclick = () => {
    tree.length = 0;
    selectedId = null;
    refresh();
    log('canvas limpio');
  };
  $('btn-sample').onclick = () => {
    tree.length = 0;
    const col = createNode('column', { gap: 10, pad: 8 });
    col.children.push(createNode('text', { text: 'Mi app no-code', size: 22, weight: 'bold', color: 'primary' }));
    col.children.push(createNode('metric', { title: 'Contador', value: '0', state: 'count', hint: 'alsetState' }));
    col.children.push(createNode('button', { text: 'Sumar', action: 'inc', state: 'count' }));
    col.children.push(createNode('api', { url: '/v1/health', state: 'apiData', auto: true }));
    tree.push(col);
    selectedId = col.id;
    stateSet('count', 0);
    refresh();
    log('ejemplo cargado');
  };
  $('btn-deploy').onclick = async () => {
    const app = treeToApp(tree, { name: $('app-name').value || 'app', states: stateDump() });
    try {
      const r = await fetch('/v1/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(app),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.statusText);
      log('deploy OK → ' + j.path + ' · ' + (j.url || ''));
      $('status').textContent = 'deployed';
      $('status').className = 'badge ok';
    } catch (e) {
      log('deploy ERR ' + e.message);
      $('status').textContent = 'error';
      $('status').className = 'badge err';
    }
  };
  $('btn-export').onclick = () => {
    const blob = new Blob([JSON.stringify(treeToApp(tree, { name: $('app-name').value || 'app', states: stateDump() }), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = ($('app-name').value || 'app') + '.alset.json';
    a.click();
    log('export .alset.json');
  };

  $('btn-sample').click();
}
