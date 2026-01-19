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
    ],
  },
  {
    key: 'SAMPLE2',
    label: 'Samples2',
    children: [
      {
        key: 'SAMPLE2-1',
        path: '',
        label: 'Sample2-1',
        children: [
          { key: 'SAMPLE2-1-1', path: '', label: 'Sample2-1-1', isLeaf: true },
          { key: 'SAMPLE2-1-2', path: '', label: 'Sample2-1-2', isLeaf: true },
        ],
      },
      {
        key: 'SAMPLE2-2',
        path: 'sample/Sample2-2',
        label: 'Sample2-2',
        children: [
          { key: 'SAMPLE2-2-1', path: '', label: 'Sample2-2-1', isLeaf: true },
          { key: 'SAMPLE2-2-2', path: '', label: 'Sample2-2-2', isLeaf: true },
          { key: 'SAMPLE2-2-3', path: '', label: 'Sample2-2-2', isLeaf: true },
        ],
      },
      { key: 'SAMPLE2-3', path: '', label: 'Sample2-3', isLeaf: true },
    ],
  },
  {
    key: 'SAMPLE3',
    label: 'Samples3',
    children: [
      { key: 'SAMPLE3-1', path: '', label: 'Sample3-1', isLeaf: true },
      { key: 'SAMPLE3-2', path: '', label: 'Sample3-2', isLeaf: true },
      { key: 'SAMPLE3-3', path: '', label: 'Sample3-3', isLeaf: true },
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
