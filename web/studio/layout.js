/**
 * VS Code–style workbench: resizable + closable panes.
 * Layout persisted in localStorage.
 */
const KEY = 'alset-studio-layout-v1';

const defaults = {
  left: 240,
  right: 300,
  bottom: 160,
  preview: 0.42, // fraction of center stack
  closed: { left: false, right: false, bottom: false, preview: false },
};

function load() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}'), closed: { ...defaults.closed, ...(JSON.parse(localStorage.getItem(KEY) || '{}').closed || {}) } };
  } catch {
    return { ...defaults, closed: { ...defaults.closed } };
  }
}

function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function bootLayout() {
  const state = load();
  const wb = document.getElementById('workbench');
  const left = document.getElementById('pane-left');
  const right = document.getElementById('pane-right');
  const bottom = document.getElementById('pane-bottom');
  const preview = document.getElementById('pane-preview');
  const centerStack = document.getElementById('center-stack');

  function apply() {
    wb.style.gridTemplateColumns = [
      state.closed.left ? '0px' : `${state.left}px`,
      state.closed.left ? '0px' : '5px',
      '1fr',
      state.closed.right ? '0px' : '5px',
      state.closed.right ? '0px' : `${state.right}px`,
    ].join(' ');

    left.classList.toggle('collapsed', state.closed.left);
    right.classList.toggle('collapsed', state.closed.right);
    bottom.classList.toggle('collapsed', state.closed.bottom);
    preview?.classList.toggle('collapsed', state.closed.preview);

    bottom.style.height = state.closed.bottom ? '0px' : `${state.bottom}px`;
    bottom.style.minHeight = state.closed.bottom ? '0' : '80px';
    document.querySelector('.bottom-split')?.classList.toggle('hidden', state.closed.bottom);

    if (centerStack && !state.closed.preview) {
      const canvas = document.getElementById('canvas');
      if (canvas) {
        canvas.style.flex = String(1 - state.preview);
      }
      preview.style.flex = String(state.preview);
      preview.style.display = 'flex';
    } else if (preview) {
      preview.style.display = 'none';
      const canvas = document.getElementById('canvas');
      if (canvas) canvas.style.flex = '1';
    }

    document.querySelectorAll('.panel-tog').forEach((btn) => {
      const p = btn.getAttribute('data-panel');
      const open = !state.closed[p];
      btn.setAttribute('aria-pressed', open ? 'true' : 'false');
      btn.classList.toggle('active', open);
    });

    save(state);
  }

  function toggle(panel) {
    state.closed[panel] = !state.closed[panel];
    apply();
  }

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => toggle(btn.getAttribute('data-close')));
  });
  document.querySelectorAll('.panel-tog').forEach((btn) => {
    btn.addEventListener('click', () => toggle(btn.getAttribute('data-panel')));
  });

  // Vertical splitters (left / right width)
  document.querySelectorAll('.splitter.v').forEach((sp) => {
    const which = sp.getAttribute('data-split');
    sp.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startLeft = state.left;
      const startRight = state.right;
      const onMove = (ev) => {
        const dx = ev.clientX - startX;
        if (which === 'left' && !state.closed.left) {
          state.left = Math.min(420, Math.max(160, startLeft + dx));
        }
        if (which === 'right' && !state.closed.right) {
          state.right = Math.min(480, Math.max(200, startRight - dx));
        }
        apply();
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });
  });

  // Horizontal: bottom height
  document.querySelector('.bottom-split')?.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = state.bottom;
    const onMove = (ev) => {
      const dy = startY - ev.clientY;
      state.bottom = Math.min(360, Math.max(80, startH + dy));
      apply();
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  // Horizontal: preview ratio inside center
  document.querySelector('.splitter.h[data-split="preview"]')?.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (state.closed.preview) return;
    const rect = centerStack.getBoundingClientRect();
    const onMove = (ev) => {
      const y = ev.clientY - rect.top;
      state.preview = Math.min(0.75, Math.max(0.2, 1 - y / rect.height));
      apply();
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  apply();
  window.addEventListener('resize', apply);
}
