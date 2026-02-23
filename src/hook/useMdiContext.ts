import { MenuType, type MenuNode, useMenuStore } from '@/store/menu.store';
import { useMdiStore } from '@/store/mdi.store';
import { usePageKey } from '@/layout/PageKeyContext';

function findNodeByKey(tree: MenuNode[], key: string): MenuNode | null {
  const walk = (nodes: MenuNode[]): MenuNode | null => {
    for (const n of nodes) {
      if (n.key === key) return n;

      if (n.children && n.children.length > 0) {
        const found = walk(n.children);
        if (found) return found;
      }
    }
    return null;
  };

  return walk(tree);
}

function findParentViewKeyForTab(tree: MenuNode[], tabKey: string): string | null {
  const walk = (nodes: MenuNode[], currentViewKey?: string): string | null => {
    for (const n of nodes) {
      const nextViewKey = n.type === MenuType.VIEW ? n.key : currentViewKey;

      if (n.type === MenuType.TAB && n.key === tabKey) {
        return nextViewKey ?? null;
      }

      if (n.children && n.children.length > 0) {
        const found = walk(n.children, nextViewKey);
        if (found) return found;
      }
    }
    return null;
  };

  return walk(tree);
}

export type MdiContext = {
  viewKey: string;
  tabKey?: string;
  params?: any;
};

export function useMdiContext(): MdiContext {
  const pageKey = usePageKey();
  const activeKey = useMdiStore((s) => s.activeKey);
  const menuTree = useMenuStore((s) => s.menuTree);

  const viewKey = (() => {
    if (!pageKey) return activeKey;

    const node = findNodeByKey(menuTree, pageKey);
    if (node?.type === MenuType.TAB) {
      return findParentViewKeyForTab(menuTree, pageKey) ?? activeKey;
    }
    return pageKey;
  })();

  const tabKey = (() => {
    if (pageKey) {
      const node = findNodeByKey(menuTree, pageKey);
      if (node?.type === MenuType.TAB) return pageKey;
    }
    return useMdiStore.getState().getViewActiveTab(viewKey);
  })();

  const viewParams = useMdiStore((s) => s.getTabParams(viewKey));
  const tabParams = useMdiStore((s) => (tabKey ? s.getTabParams(tabKey) : undefined));
  const params = tabKey ? tabParams : viewParams;

  return { viewKey, tabKey: tabKey ?? undefined, params };
}
