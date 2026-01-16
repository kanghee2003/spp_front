import { useEffect } from 'react';

import AppLayout from '@/layout/AppLayout';
import { menuTreeEtc, menuTreeSpp } from '@/config/mockMenuConfig';
import { useMenuStore, type SystemKey } from '@/store/menu.store';

export default function App() {
  const setSystemKey = useMenuStore((s) => s.setSystemKey);
  const setMenuTree = useMenuStore((s) => s.setMenuTree);

  useEffect(() => {
    // URL prefix에 맞춰 시스템 초기화 (예: /spp, /etc)
    const seg = window.location.pathname.split('/').filter(Boolean)[0] as SystemKey | undefined;
    const nextSystem: SystemKey = seg === 'etc' || seg === 'spp' ? seg : 'spp';
    setSystemKey(nextSystem);
    setMenuTree(nextSystem === 'etc' ? menuTreeEtc : menuTreeSpp);
  }, [setSystemKey, setMenuTree]);

  return <AppLayout />;
}
