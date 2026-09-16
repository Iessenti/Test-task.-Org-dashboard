import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const apiPort = Number(process.env['API_PORT'] ?? 3001);
const apiHost = process.env['API_HOST'] ?? '127.0.0.1';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': `http://${apiHost}:${apiPort}`,
    },
  },
});
