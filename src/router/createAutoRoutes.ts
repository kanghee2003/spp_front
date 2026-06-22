import React, { createElement } from 'react';

import { DEFAULT_SCREEN_KEY } from '@/config/mockMenuConfig';
import NotFoundPage from '@/error/NotFoundPage';
import LazyLoadErrorBoundary from '@/shared/app/LazyLoadErrorBoundary';
import { MenuType, type MenuNode } from '@/store/menu.store';
import type { AppRoute } from '@/router/AutoRoutes';

type PageModule = { default: React.ComponentType<any> };
export type PageModules = Record<string, () => Promise<PageModule>>;

function normalizeNodePath(nodePath?: string): string {
  return (nodePath ?? '').replace(/^\/+|\/+$/g, '');
}

function normalizeModulePath(file: string): string | null {
  // './view/home/Dashboard.tsx' -> 'home/Dashboard'
  // '../pages/spp/view/home/Dashboard.tsx' -> 'home/Dashboard'
  const m = file.match(/(?:^\.\/view\/|\/view\/)(.+)\.tsx$/);
  if (!m) return null;
  return normalizeNodePath(m[1]);
}

function flattenViewLeaves(tree: MenuNode[]): MenuNode[] {
  const out: MenuNode[] = [];

  const walk = (nodes: MenuNode[]) => {
    for (const n of nodes) {
      if (n.type === MenuType.VIEW) {
        out.push({ ...n, path: normalizeNodePath(n.path) });
        continue;
      }

      if (n.children && n.children.length > 0) {
        walk(n.children);
      }
    }
  };

  walk(tree);
  return out;
}

function createLazyElement(loader: () => Promise<PageModule>, resetKey: string) {
  const Lazy = React.lazy(loader);

  return createElement(LazyLoadErrorBoundary, {
    resetKey,
    children: createElement(React.Suspense, { fallback: createElement('div', { style: { padding: 16 } }, 'Loading…') }, createElement(Lazy)),
  });
}

export function createAutoRoutes(pageModules: PageModules, menuTree: MenuNode[]): AppRoute[] {
  const loaderByPath = new Map<string, () => Promise<PageModule>>();

  for (const [file, loader] of Object.entries(pageModules)) {
    const pagePath = normalizeModulePath(file);
    if (!pagePath) continue;
    loaderByPath.set(pagePath, loader);
  }

  const leaves = flattenViewLeaves(menuTree);

  const routes: AppRoute[] = leaves.map((leaf) => {
    const resolvedPath = normalizeNodePath(leaf.path);
    const loader = resolvedPath ? loaderByPath.get(resolvedPath) : undefined;

    if (!loader) {
      return {
        key: leaf.key,
        element: createElement(NotFoundPage),
      };
    }

    return {
      key: leaf.key,
      element: createLazyElement(loader, leaf.key),
    };
  });

  routes.sort((a, b) => {
    if (a.key === DEFAULT_SCREEN_KEY) return -1;
    if (b.key === DEFAULT_SCREEN_KEY) return 1;
    return 0;
  });

  return routes;
}
