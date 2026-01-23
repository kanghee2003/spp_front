import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const toBool = (v?: string) => (v ?? '').toLowerCase() === 'true';
const normalize = (url?: string) => (url ? url.replace(/\/$/, '') : '');

export default defineConfig(({ mode }) => {
  const root = dirname(fileURLToPath(import.meta.url));

  const env = loadEnv(mode, root, 'VITE_');

  const usingGw = toBool(env.VITE_USING_GW);
  const gw = normalize(env.VITE_GW_BASE_URL);
  const api = normalize(env.VITE_API_BASE_URL);

  const target = usingGw ? gw : api;

  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/cm': {
          target: target || 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
