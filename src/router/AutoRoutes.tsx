import React from 'react';

import { DEFAULT_SCREEN_KEY } from '@/config/mockMenuConfig';
import type { MenuNode } from '@/store/menu.store';
import NotFoundPage from '@/error/NotFoundPage';

export type AppRoute = {
  /** 탭/메뉴에서 사용하는 화면 고유 key (백엔드가 내려준다고 가정) */
  key: string;
  /** 실제 렌더링 Element */
  element: React.ReactNode;
};

type PageModule = { default: React.ComponentType<any> };

// src/pages 아래의 모든 TSX를 로딩할 수 있게 준비하지만,
// 실제 라우트 목록은 menuTree 기준으로만 만든다.
const pageModules = import.meta.glob('../pages/*/view/**/*.tsx') as Record<string, () => Promise<PageModule>>;

function fileToSystemAndPagePath(file: string): { systemKey: string; pagePath: string } | null {
  // "../pages/spp/view/home/Dashboard.tsx" -> {systemKey:'spp', pagePath:'home/Dashboard'}
  const m = file.match(/^\.\.\/pages\/([^/]+)\/view\/(.+)\.tsx$/);
  if (!m) return null;
  return { systemKey: m[1], pagePath: m[2] };
}

function flattenLeaves(tree: MenuNode[]): MenuNode[] {
  const out: MenuNode[] = [];
  const walk = (nodes: MenuNode[]) => {
    for (const n of nodes) {
      if (n.isLeaf) {
        out.push(n);
      } else if (n.children && n.children.length > 0) {
        walk(n.children);
      }
    }
  };
  walk(tree);
  return out;
}

export function loadRoutes(systemKey: string, menuTree: MenuNode[]): AppRoute[] {
  // 1) pages 폴더 스캔 결과를 "{systemKey,pagePath}" -> loader 로 매핑
  const loaderBySystemPath = new Map<string, Map<string, () => Promise<PageModule>>>();
  for (const [file, loader] of Object.entries(pageModules)) {
    const parsed = fileToSystemAndPagePath(file);
    if (!parsed) continue;
    const { systemKey: sk, pagePath } = parsed;
    if (!loaderBySystemPath.has(sk)) loaderBySystemPath.set(sk, new Map());
    loaderBySystemPath.get(sk)!.set(pagePath, loader);
  }

  const loaderByPath = loaderBySystemPath.get(systemKey) ?? new Map<string, () => Promise<PageModule>>();

  // 2) menuTree 기준으로만 라우트 구성
  const leaves = flattenLeaves(menuTree);

  const routes: AppRoute[] = leaves.map((leaf) => {
    const loader = leaf.path ? loaderByPath.get(leaf.path) : undefined;

    if (!loader) {
      return {
        key: leaf.key,
        element: <NotFoundPage />,
      };
    }

    const Lazy = React.lazy(loader);
    return {
      key: leaf.key,
      element: (
        <React.Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
          <Lazy />
        </React.Suspense>
      ),
    };
  });

  // 기본 화면이 항상 먼저 잡히도록(선택 사항)
  routes.sort((a, b) => {
    if (a.key === DEFAULT_SCREEN_KEY) return -1;
    if (b.key === DEFAULT_SCREEN_KEY) return 1;
    return 0;
  });

  return routes;
}
