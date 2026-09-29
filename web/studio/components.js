/** Toolbox catalog — basic + composite next-gen components */
export const CATALOG = [
  { group: 'Básicos', items: [
    { type: 'text', label: 'Texto', defaults: { text: 'Título', size: 18, weight: 'bold', color: 'primary' } },
    { type: 'button', label: 'Botón', defaults: { text: 'Acción', action: 'click' } },
    { type: 'input', label: 'Input', defaults: { placeholder: 'Escribe…', state: 'input1' } },
    { type: 'column', label: 'Columna', defaults: { gap: 8, pad: 8 }, container: true },
    { type: 'row', label: 'Fila', defaults: { gap: 8 }, container: true },
    { type: 'card', label: 'Card', defaults: { pad: 14, gap: 8 }, container: true },
    { type: 'spacer', label: 'Espacio', defaults: { size: 12 } },
  ]},
  { group: 'Compuestos', items: [
    { type: 'metric', label: 'Métrica', defaults: { title: 'KPI', value: '—', hint: 'observado' } },
    { type: 'list', label: 'Lista API', defaults: { state: 'items', empty: 'Sin datos' } },
    { type: 'form', label: 'Formulario', defaults: { submit: 'Enviar' }, container: true },
    { type: 'nav', label: 'Nav tabs', defaults: { tabs: 'Inicio,Datos,Ajustes', state: 'tab' } },
  ]},
  { group: 'Datos / red', items: [
    { type: 'api', label: 'REST GET', defaults: { url: '/v1/health', state: 'apiData', auto: true } },
    { type: 'state', label: 'Estado', defaults: { name: 'count', value: '0' } },
    { type: 'ipfs', label: 'IPFS ref', defaults: { cid: '', state: 'ipfsDoc', note: 'RootCID / gateway' } },
  ]},
];

let _id = 1;
export function uid() { return 'n' + (_id++); }

export function createNode(type, defaults = {}) {
  const meta = CATALOG.flatMap((g) => g.items).find((i) => i.type === type);
  const d = { ...(meta?.defaults || {}), ...defaults };
  return {
    id: uid(),
    type,
    props: { ...d },
    children: meta?.container ? [] : undefined,
  };
}

export function treeToLisp(nodes) {
  function one(n) {
    if (!n) return '';
    const p = n.props || {};
    const props = Object.entries(p)
      .filter(([, v]) => v !== '' && v != null)
      .map(([k, v]) => {
        if (typeof v === 'number') return `(${k} ${v})`;
        if (typeof v === 'boolean') return `(${k} ${v})`;
        return `(${k} "${String(v).replace(/"/g, '\\"')}")`;
      })
      .join(' ');
    const kids = (n.children || []).map(one).join(' ');
    if (n.type === 'text') return `(text "${p.text || ''}" ${props})`;
    if (n.type === 'button') return `(button "${p.text || 'OK'}" ${props})`;
    if (['column', 'row', 'card', 'form'].includes(n.type)) {
      return `(${n.type} ${props} ${kids})`;
    }
    return `(${n.type} ${props} ${kids})`;
  }
  return `(ui\n  (column (pad 8) (gap 10)\n${nodes.map((n) => '    ' + one(n)).join('\n')}\n  )\n)`;
}

export function treeToApp(nodes, meta = {}) {
  return {
    format: 'alset-app/v1',
    name: meta.name || 'untitled',
    created: new Date().toISOString(),
    tree: nodes,
    states: meta.states || {},
    apis: meta.apis || [],
  };
}
