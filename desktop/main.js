/**
 * Alset Studio Desktop (Electron) — ventana propia a pantalla completa.
 * Motor: binario Go alset-studio (ALSET_STUDIO_BIN) o URL (ALSET_STUDIO_URL).
 */
const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

let win = null;
let child = null;
const PORT = process.env.ALSET_STUDIO_PORT || '5177';
const URL_ENV = process.env.ALSET_STUDIO_URL;

function waitReady(url, tries = 60) {
  return new Promise((resolve, reject) => {
    let n = 0;
    const tick = () => {
      n++;
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (n >= tries) reject(new Error('timeout esperando Studio en ' + url));
        else setTimeout(tick, 250);
      });
    };
    tick();
  });
}

function resolveBin() {
  if (process.env.ALSET_STUDIO_BIN && fs.existsSync(process.env.ALSET_STUDIO_BIN)) {
    return process.env.ALSET_STUDIO_BIN;
  }
  const names = process.platform === 'win32'
    ? ['alset-studio.exe']
    : ['alset-studio'];
  const candidates = [];
  for (const n of names) {
    candidates.push(path.join(__dirname, '..', n));
    candidates.push(path.join(__dirname, n));
    if (process.resourcesPath) {
      candidates.push(path.join(process.resourcesPath, 'bin', n));
      candidates.push(path.join(process.resourcesPath, n));
    }
  }
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function resolveWeb(binPath) {
  if (process.env.ALSET_STUDIO_WEB && fs.existsSync(process.env.ALSET_STUDIO_WEB)) {
    return process.env.ALSET_STUDIO_WEB;
  }
  const candidates = [
    path.join(__dirname, '..', 'web'),
    path.join(__dirname, 'web'),
    binPath ? path.join(path.dirname(binPath), 'web') : null,
    process.resourcesPath ? path.join(process.resourcesPath, 'web') : null,
  ].filter(Boolean);
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(__dirname, '..', 'web');
}

function startEngine() {
  const b = resolveBin();
  if (!b) {
    console.warn('No se encontró alset-studio. Arranca el motor a mano o define ALSET_STUDIO_BIN.');
    return null;
  }
  const web = resolveWeb(b);
  console.log('Motor:', b, 'web:', web);
  child = spawn(b, ['-addr', '127.0.0.1:' + PORT, '-dir', web], {
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (c) => console.log('studio engine exit', c));
  return child;
}

async function createWindow() {
  const target = URL_ENV || 'http://127.0.0.1:' + PORT + '/';
  if (!URL_ENV) {
    try {
      startEngine();
      await waitReady(target);
    } catch (e) {
      console.warn('Engine:', e.message);
    }
  }

  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#09090b',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'Alset Studio',
  });

  win.once('ready-to-show', () => {
    win.show();
    // Pantalla completa real (como F11). Cambiar a maximize() si prefieres con barra de título.
    if (process.env.ALSET_STUDIO_MAXIMIZE === '1') {
      win.maximize();
    } else {
      win.setFullScreen(true);
    }
  });

  win.loadURL(target);
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

const menu = Menu.buildFromTemplate([
  {
    label: 'Vista',
    submenu: [
      {
        label: 'Pantalla completa',
        accelerator: 'F11',
        click: () => {
          if (win) win.setFullScreen(!win.isFullScreen());
        },
      },
      {
        label: 'Maximizar',
        click: () => {
          if (win) win.maximize();
        },
      },
      { role: 'toggleDevTools' },
      { role: 'quit' },
    ],
  },
]);
Menu.setApplicationMenu(menu);

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (child) try { child.kill(); } catch (_) {}
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
