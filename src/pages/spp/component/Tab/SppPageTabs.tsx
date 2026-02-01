import React, { useEffect, useMemo, useState } from 'react';
import { Empty, Tabs } from 'antd';

import NotFoundPage from '@/error/NotFoundPage';
import { MenuType, type MenuNode } from '@/store/menu.store';
import { useMenuStore } from '@/store/menu.store';
import { useMdiStore } from '@/store/mdi.store';
import { usePageKey } from '@/layout/PageKeyContext';

type PageModule = { default: React.ComponentType<any> };

// src/pages 아래의 모든 TSX를 로딩할 수 있게 준비
const pageModules = import.meta.glob('/src/pages/*/view/**/*.tsx') as Record<string, () => Promise<PageModule>>;

function fileToSystemAndPagePath(file: string): { systemKey: string; pagePath: string } | null {
  // "/src/pages/spp/view/home/Dashboard.tsx" -> {systemKey:'spp', pagePath:'home/Dashboard'}
  const m = file.match(/^(?:\.\.\/)?(?:\/src\/)?pages\/([^/]+)\/view\/(.+)\.tsx$/);
  if (!m) return null;
  return { systemKey: m[1], pagePath: m[2] };
}

function normalizePath(p?: string): string {
  return (p ?? '').replace(/^\/+|\/+$/g, '');
}

function findViewByKey(tree: MenuNode[], viewKey: string): MenuNode | null {
  const walk = (nodes: MenuNode[]): MenuNode | null => {
    for (const n of nodes) {
      if (n.type === MenuType.VIEW && n.key === viewKey) return n;

      if (n.children && n.children.length > 0) {
        const found = walk(n.children);
        if (found) return found;
      }
    }
    return null;
  };

  return walk(tree);
}

function getTabsUnderViewByKey(tree: MenuNode[], viewKey: string): MenuNode[] {
  const view = findViewByKey(tree, viewKey);
  if (!view?.children || view.children.length === 0) return [];
  return view.children.filter((c) => c.type === MenuType.TAB);
}

function buildLoaderMaps() {
  const loaderBySystemPath = new Map<string, Map<string, () => Promise<PageModule>>>();
  const loaderBySystemKey = new Map<string, Map<string, () => Promise<PageModule>>>();

  for (const [file, loader] of Object.entries(pageModules)) {
    const parsed = fileToSystemAndPagePath(file);
    if (!parsed) continue;

    const { systemKey, pagePath } = parsed;

    if (!loaderBySystemPath.has(systemKey)) loaderBySystemPath.set(systemKey, new Map());
    loaderBySystemPath.get(systemKey)!.set(pagePath, loader);

    // key 기반 폴백: ".../TabControlTab1" 같은 파일을 tabKey로도 찾을 수 있게 매핑
    const key = pagePath.split('/').slice(-1)[0];
    if (!loaderBySystemKey.has(systemKey)) loaderBySystemKey.set(systemKey, new Map());
    loaderBySystemKey.get(systemKey)!.set(key, loader);
  }

  return { loaderBySystemPath, loaderBySystemKey };
}

const { loaderBySystemPath, loaderBySystemKey } = buildLoaderMaps();

type SppPageTabsProps = {
  onChange?: (activeKey: string) => void;
};

const SppPageTabs = ({ onChange }: SppPageTabsProps) => {
  const systemKey = useMenuStore((s) => s.systemKey);
  const menuTree = useMenuStore((s) => s.menuTree);

  // PageHost가 각 탭 렌더링 영역을 Provider로 감싸주기 때문에,
  // 여기서는 현재 "페이지(=MDI 탭)"의 key 를 안전하게 가져올 수 있다.
  const pageKey = usePageKey();
  const activeKey = useMdiStore((s) => s.activeKey);
  const viewKey = pageKey ?? activeKey;

  const tabNodes = useMemo(() => {
    // menuTree 기준 TAB만 노출(권한 제어)
    if (!viewKey) return [];
    return getTabsUnderViewByKey(menuTree, viewKey);
  }, [menuTree, viewKey]);

  const tabKeyList = useMemo(() => {
    return tabNodes.map((t) => t.key);
  }, [tabNodes]);

  const [activeTabKey, setActiveTabKey] = useState<string>('');

  // 권한/메뉴 변경으로 탭 목록이 바뀌면 activeTabKey 보정
  useEffect(() => {
    if (tabKeyList.length === 0) {
      setActiveTabKey('');
      return;
    }

    if (!activeTabKey) {
      setActiveTabKey(tabKeyList[0]);
      return;
    }

    const exists = tabKeyList.includes(activeTabKey);
    if (!exists) {
      setActiveTabKey(tabKeyList[0]);
    }
  }, [activeTabKey, tabKeyList]);

  // activeTabKey 변경을 화면단에서 받을 수 있게
  useEffect(() => {
    if (!activeTabKey) return;
    onChange?.(activeTabKey);
  }, [activeTabKey, onChange]);

  const items = useMemo(() => {
    const loaderByPath = loaderBySystemPath.get(systemKey) ?? new Map<string, () => Promise<PageModule>>();
    const loaderByKey = loaderBySystemKey.get(systemKey) ?? new Map<string, () => Promise<PageModule>>();

    return tabNodes.map((t) => {
      // 1) path가 정확히 매칭되면 path 기반 사용
      // 2) 프로젝트 구조상 tab 파일이 "sample/TabControlTab1" 처럼 존재할 수 있어서 key 기반 폴백
      const loader = (t.path ? loaderByPath.get(normalizePath(t.path)) : undefined) ?? loaderByKey.get(t.key);

      if (!loader) {
        return {
          key: t.key,
          label: t.label,
          children: <NotFoundPage />,
        };
      }

      const Lazy = React.lazy(loader);

      return {
        key: t.key,
        label: t.label,
        children: (
          <React.Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
            <Lazy />
          </React.Suspense>
        ),
      };
    });
  }, [systemKey, tabNodes]);

  if (!viewKey) return null;

  if (tabNodes.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <Empty description="표시할 탭이 없습니다." />
      </div>
    );
  }

  return (
    <Tabs
      activeKey={activeTabKey || undefined}
      onChange={(k) => setActiveTabKey(k as string)}
      items={items as any}
    ></Tabs>
  );
};

export default SppPageTabs;
