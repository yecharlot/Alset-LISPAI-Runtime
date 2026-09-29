import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  resolve: {
    alias: {
      '@alset-js': path.resolve(__dirname, '../Alset-JS-Runtime/src/core/AlsetPulseCore.js'),
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: { port: 5177, host: true },
  build: { outDir: 'dist', sourcemap: true }
});
