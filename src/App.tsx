import { useEffect } from 'react';

import AppLayout from '@/layout/AppLayout';
import { getMockMenuTree } from '@/config/mockMenuConfig';
import { useMenuStore, type SystemKey } from '@/store/menu.store';
import { setSystemCss } from '@/utils/system.util';

export default function App() {
  const systemKey = useMenuStore((s) => s.systemKey);
  const setSystemKey = useMenuStore((s) => s.setSystemKey);
  const setMenuTree = useMenuStore((s) => s.setMenuTree);

  useEffect(() => {
    // URL prefix에 맞춰 시스템 초기화 (예: /spp, /etc)
    const seg = window.location.pathname.split('/').filter(Boolean)[0] as SystemKey | undefined;
    const nextSystem: SystemKey = seg === 'etc' || seg === 'spp' ? seg : 'spp';
    setSystemKey(nextSystem);
    setMenuTree(getMockMenuTree(nextSystem));
  }, [setSystemKey, setMenuTree]);

  useEffect(() => {
    setSystemCss(systemKey);
  }, [systemKey]);

  return <AppLayout />;
}
