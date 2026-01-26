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
      { key: 'Menu', path: 'sample/MenuManagement', label: 'Menu', isLeaf: true },
      { key: 'SAMPLE3', path: 'sample/Sample3', label: 'Sample3', isLeaf: true },
      { key: 'SAMPLE4', path: 'sample/Sample4', label: 'Sample4', isLeaf: true },
      { key: 'SAMPLE5', path: 'sample/Sample5', label: 'Sample5', isLeaf: true },
      { key: 'SAMPLE6', path: 'sample/Sample6', label: 'Sample6', isLeaf: true },
      { key: 'SAMPLE7', path: 'sample/Sample7', label: 'Sample7', isLeaf: true },
      { key: 'SAMPLE8', path: 'sample/Sample8', label: 'Sample8', isLeaf: true },
      { key: 'SAMPLE9', path: 'sample/Sample9', label: 'Sample9', isLeaf: true },
      { key: 'SAMPLE10', path: 'sample/Sample10', label: 'Sample10', isLeaf: true },
    ],
  },
  {
    key: 'Test',
    label: 'Test1',
    children: [
      {
        key: 'Test',
        label: 'Test',
        isLeaf: false,
        children: [
          { key: 'Test11', path: 'test/Test11', label: 'Test1', isLeaf: true },
          { key: 'Test12', path: 'test/Test12', label: 'Test2', isLeaf: true },
          { key: 'Test13', path: 'test/Test13', label: 'Test3', isLeaf: true },
          { key: 'Test14', path: 'test/Test14', label: 'Test4', isLeaf: true },
        ],
      },
      { key: 'Test2', path: 'sample/ComponentSample', label: 'Component', isLeaf: true },
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
