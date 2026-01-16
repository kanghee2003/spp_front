import { useMemo, type ReactNode } from 'react';
import { loadRoutes } from '@/router/AutoRoutes';
import { useMdiStore } from '@/store/mdi.store';
import { useMenuStore } from '@/store/menu.store';

const PageHost = () => {
  const tabs = useMdiStore((s) => s.tabs);
  const activeKey = useMdiStore((s) => s.activeKey);
  const systemKey = useMenuStore((s) => s.systemKey);
  const menuTree = useMenuStore((s) => s.menuTree);
  const routes = useMemo(() => loadRoutes(systemKey, menuTree), [systemKey, menuTree]);

  const elementByKey = useMemo(() => {
    const m: Record<string, ReactNode> = {};
    for (const r of routes) m[r.key] = r.element;
    return m;
  }, [routes]);

  return (
    <>
      {tabs.map((t) => (
        <div key={t.key} style={{ display: t.key === activeKey ? 'block' : 'none' }}>
          {elementByKey[t.key] ?? <div style={{ padding: 16 }}>페이지를 찾을 수 없습니다: {t.key}</div>}
        </div>
      ))}
    </>
  );
};

export default PageHost;
