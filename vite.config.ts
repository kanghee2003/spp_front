/// <reference types="node" />
import fs from 'node:fs';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import process from 'node:process';

import { PORTAL_BUILD_TARGET, SYSTEM_KEY_LIST, isAppBuildTarget, isSystemKey, type AppBuildTarget } from './src/config/system.constant';

const toBool = (v?: string) => (v ?? '').toLowerCase() === 'true';
const normalize = (url?: string) => (url ? url.replace(/\/$/, '') : '');

const getBuildTarget = (mode: string): AppBuildTarget => {
  if (isAppBuildTarget(mode)) {
    return mode;
  }

  return PORTAL_BUILD_TARGET;
};

const createDevHtmlEntryRewritePlugin = (projectRoot: string): Plugin => {
  return {
    name: 'dev-html-entry-rewrite',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const originalUrl = req.url ?? '';
        const [reqPath, queryString = ''] = originalUrl.split('?');
        const search = queryString ? `?${queryString}` : '';
        const accept = req.headers.accept ?? '';
        const isHtmlRequest = req.method === 'GET' && accept.includes('text/html');

        if (!isHtmlRequest) {
          next();
          return;
        }

        const matchedSystemKey = SYSTEM_KEY_LIST.find((systemKey) => {
          const systemPath = `/${systemKey}`;
          return reqPath === systemPath || reqPath.startsWith(`${systemPath}/`);
        });

        if (!matchedSystemKey) {
          next();
          return;
        }

        const systemPath = `/${matchedSystemKey}`;

        if (reqPath === systemPath) {
          res.statusCode = 302;
          res.setHeader('Location', `${systemPath}/${search}`);
          res.end();
          return;
        }

        const entryHtmlPath = resolve(projectRoot, 'entries', matchedSystemKey, 'index.html');

        if (!fs.existsSync(entryHtmlPath)) {
          next();
          return;
        }

        const html = fs.readFileSync(entryHtmlPath, 'utf-8');
        const transformedHtml = await server.transformIndexHtml(`${systemPath}/`, html);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(transformedHtml);
      });
    },
  };
};

export default defineConfig(({ mode }) => {
  const projectRoot = dirname(fileURLToPath(import.meta.url));
  const env = {
    ...loadEnv(mode, projectRoot, 'VITE_'),
    ...process.env,
  };

  const buildTarget = getBuildTarget(mode);
  const isSystemBuild = isSystemKey(buildTarget);

  const viteRoot = isSystemBuild ? resolve(projectRoot, 'entries', buildTarget) : projectRoot;

  const outDir = buildTarget === PORTAL_BUILD_TARGET ? resolve(projectRoot, 'dist') : resolve(projectRoot, 'dist', buildTarget);

  const input = isSystemBuild ? resolve(viteRoot, 'index.html') : resolve(projectRoot, 'index.html');

  const usingGw = toBool(env.VITE_USING_GATEWAY);
  const gw = normalize(env.VITE_GW_BASE_URL);
  const api = normalize(env.VITE_API_BASE_URL);
  const target = usingGw ? gw : api;

  return {
    root: viteRoot,
    envDir: projectRoot,
    publicDir: resolve(projectRoot, 'public'),
    plugins: [react(), tsconfigPaths(), svgr(), createDevHtmlEntryRewritePlugin(projectRoot)],
    base: isSystemBuild ? './' : '/',
    optimizeDeps: {
      include: [
        '@ant-design/icons',
        '@ant-design/plots',
        '@hello-pangea/dnd',
        '@hookform/resolvers/zod',
        '@tanstack/react-query',
        '@tanstack/react-query-devtools',
        'antd',
        'antd/es/date-picker/locale/ko_KR',
        'axios',
        'dayjs',
        'dayjs/locale/ko',
        'jodit',
        'jodit-react',
        'pdfjs-dist',
        'qs',
        'rc-resize-observer',
        'rc-virtual-list',
        'react',
        'react-dom',
        'react-grid-layout',
        'react-hook-form',
        'react-resizable',
        'react-router-dom',
        'uuid',
        'xlsx',
        'zod',
        'zustand',
      ],
    },
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
    build: {
      outDir,
      emptyOutDir: buildTarget !== PORTAL_BUILD_TARGET,
      assetsDir: 'assets',
      rollupOptions: {
        input,
      },
    },
    resolve: {
      alias: {
        '@': resolve(projectRoot, 'src'),
      },
    },
  };
});
