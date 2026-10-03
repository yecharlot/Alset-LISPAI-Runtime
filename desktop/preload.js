const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('alsetDesktop', { platform: process.platform, isDesktop: true });
