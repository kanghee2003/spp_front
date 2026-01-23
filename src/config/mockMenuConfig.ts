import type { MenuNode } from '@/store/menu.store';

// AppLayout 등에서 type을 import할 수 있도록 re-export
export type { MenuNode } from '@/store/menu.store';

export const DEFAULT_SCREEN_KEY = 'DASHBOARD';

// 시스템별 메뉴 트리(향후 API로 대체 예정)
export const menuTreeSpp: MenuNode[] = [
  {
    key: 'HOME',
    label: 'Home',
    children: [{ key: DEFAULT_SCREEN_KEY, path: 'home/Dashboard', label: 'Dashboard', isLeaf: true }],
  },
  {
    key: 'SAMPLE',
    label: 'Samples',
    children: [
      { key: 'SAMPLE1', path: 'sample/Sample1', label: 'Sample1', isLeaf: true },
      { key: 'Compnent', path: 'sample/ComponentSample', label: 'Component', isLeaf: true },
      { key: 'Editor', path: 'sample/EditorSample', label: 'Editor', isLeaf: true },
    ],
  },
];

export const menuTreeEtc: MenuNode[] = [
  {
    key: 'HOME',
    label: 'Home',
    children: [{ key: DEFAULT_SCREEN_KEY, path: 'home/Dashboard', label: 'Dashboard', isLeaf: true }],
  },
  {
    key: 'SAMPLE',
    label: 'Samples',
    children: [{ key: 'SAMPLE1', path: '', label: 'Sample1', isLeaf: true }],
  },
];

// 기본 시스템은 spp
export const menuTree: MenuNode[] = menuTreeSpp;
