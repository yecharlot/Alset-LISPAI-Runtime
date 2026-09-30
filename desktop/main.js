/**
 * Alset Studio Desktop (Electron)
 * Abre el Studio local o una URL (ALSET_STUDIO_URL).
 * Arranca opcionalmente el binario alset-studio si ALSET_STUDIO_BIN está definido.
 */
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

let win = null;
let child = null;
const PORT = process.env.ALSET_STUDIO_PORT || '5177';
const URL_ENV = process.env.ALSET_STUDIO_URL;

function waitReady(url, tries = 50) {
  return new Promise((resolve, reject) => {
    let n = 0;
    const tick = () => {
      n++;
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (n >= tries) reject(new Error('timeout'));
        else setTimeout(tick, 200);
      });
    };
    tick();
  });
}

function startEngine() {
  const bin =
    process.env.ALSET_STUDIO_BIN ||
    path.join(__dirname, '..', 'alset-studio') ||
    path.join(process.resourcesPath || '', 'bin', process.platform === 'win32' ? 'alset-studio.exe' : 'alset-studio');
  if (!fs.existsSync(bin) && !process.env.ALSET_STUDIO_BIN) return null;
  const b = process.env.ALSET_STUDIO_BIN || bin;
  if (!fs.existsSync(b)) return null;
  const web = process.env.ALSET_STUDIO_WEB || path.join(path.dirname(b), 'web');
  child = spawn(b, ['-addr', ':' + PORT, '-dir', web], {
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
      console.warn('Engine not ready:', e.message, '— open URL only if already running');
    }
  }
  win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0b0e14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'Alset Studio',
  });
  win.loadURL(target);
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (child) try { child.kill(); } catch (_) {}
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
