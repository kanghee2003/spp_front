import React, { useEffect, useMemo, useState } from 'react';
import { Empty, Tabs } from 'antd';

import NotFoundPage from '@/error/NotFoundPage';
import LazyLoadErrorBoundary from '@/error/LazyLoadErrorBoundary';
import { MenuType, type MenuNode } from '@/store/menu.store';
import { useMenuStore } from '@/store/menu.store';
import { useMdiStore } from '@/store/mdi.store';
import { useMdiContext } from '@/hook/useMdiContext';

type PageModule = { default: React.ComponentType<any> };

// SPP 탭 화면은 SPP 앱 entry 기준으로 빌드될 때도 안정적으로 잡히도록 상대 glob을 사용한다.
const pageModules = import.meta.glob('../../view/**/*.tsx') as Record<string, () => Promise<PageModule>>;

function fileToPagePath(file: string): string | null {
  // "../../view/sample/TabControlTab1.tsx" -> "sample/TabControlTab1"
  const m = file.match(/(?:^|\/)view\/(.+)\.tsx$/);
  if (!m) return null;
  return normalizePath(m[1]);
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
  const loaderByPath = new Map<string, () => Promise<PageModule>>();
  const loaderByKey = new Map<string, () => Promise<PageModule>>();

  for (const [file, loader] of Object.entries(pageModules)) {
    const pagePath = fileToPagePath(file);
    if (!pagePath) continue;

    loaderByPath.set(pagePath, loader);

    // key 기반 폴백: ".../TabControlTab1" 같은 파일을 tabKey로도 찾을 수 있게 매핑
    const key = pagePath.split('/').slice(-1)[0];
    loaderByKey.set(key, loader);
  }

  return { loaderByPath, loaderByKey };
}

const { loaderByPath, loaderByKey } = buildLoaderMaps();

type SppPageTabsProps = {
  onChange?: (activeKey: string) => void;
};

const SppPageTabs = ({ onChange }: SppPageTabsProps) => {
  const menuTree = useMenuStore((s) => s.menuTree);

  const { viewKey, tabKey } = useMdiContext();
  const setViewActiveTab = useMdiStore((s) => s.setViewActiveTab);

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
  // openTab({ key: TAB_KEY })로 들어온 경우(tabKey 존재)에는 tabKey 우선
  useEffect(() => {
    if (tabKeyList.length === 0) {
      setActiveTabKey('');
      return;
    }

    if (tabKey && tabKeyList.includes(tabKey)) {
      setActiveTabKey(tabKey);
      if (viewKey) setViewActiveTab(viewKey, tabKey);
      return;
    }

    if (!activeTabKey) {
      const firstKey = tabKeyList[0];
      setActiveTabKey(firstKey);
      if (viewKey) setViewActiveTab(viewKey, firstKey);
      return;
    }

    const exists = tabKeyList.includes(activeTabKey);
    if (!exists) {
      const firstKey = tabKeyList[0];
      setActiveTabKey(firstKey);
      if (viewKey) setViewActiveTab(viewKey, firstKey);
    }
  }, [activeTabKey, tabKey, tabKeyList, viewKey, setViewActiveTab]);

  // activeTabKey 변경을 화면단에서 받을 수 있게
  useEffect(() => {
    if (!activeTabKey) return;
    onChange?.(activeTabKey);
  }, [activeTabKey, onChange]);

  const items = useMemo(() => {
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
          <LazyLoadErrorBoundary resetKey={t.key}>
            <React.Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
              <Lazy />
            </React.Suspense>
          </LazyLoadErrorBoundary>
        ),
      };
    });
  }, [tabNodes]);

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
      onChange={(k) => {
        const next = String(k);
        setActiveTabKey(next);
        if (viewKey) setViewActiveTab(viewKey, next);
      }}
      items={items as any}
    ></Tabs>
  );
};

export default SppPageTabs;
