import { defineConfig } from 'vite';
import { resolve } from 'path';
import puterLocalhost from '../../dev/puter-localhost.mjs';

export default defineConfig({
  plugins: [puterLocalhost('extractor')],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5176,
    strictPort: false,
    fs: {
      allow: ['..', '../..'],
    },
  },
  resolve: {
    alias: {
      '@documents': resolve(import.meta.dirname, '../documents/src'),
      '@presentation': resolve(import.meta.dirname, '../presentation/src'),
      '@presentation-lib': resolve(import.meta.dirname, '../presentation/lib'),
    },
  },
  build: {
    target: 'es2022',
  },
});
