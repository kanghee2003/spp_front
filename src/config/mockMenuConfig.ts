import { MenuType, type MenuNode } from '@/store/menu.store';

// AppLayout 등에서 type을 import할 수 있도록 re-export
export type { MenuNode } from '@/store/menu.store';

export const DEFAULT_SCREEN_KEY = 'DASHBOARD';

// 시스템별 메뉴 트리(향후 API로 대체 예정)
export const menuTreeSpp: MenuNode[] = [
  {
    key: 'HOME',
    label: 'Home',
    path: 'home',
    type: MenuType.FOLDER,
    children: [{ key: DEFAULT_SCREEN_KEY, path: 'Dashboard', label: 'Dashboard', type: MenuType.VIEW }],
  },
  {
    key: 'SAMPLE',
    label: 'Samples',
    type: MenuType.FOLDER,
    path: 'sample',
    children: [
      { key: 'SAMPLE1', path: 'Sample1', label: 'Sample1', type: MenuType.VIEW },
      { key: 'Compnent', path: 'ComponentSample', label: 'Component', type: MenuType.VIEW },
      { key: 'Editor', path: 'EditorSample', label: 'Editor', type: MenuType.VIEW },
      { key: 'FileUpload', path: 'FileUploadSample', label: 'FileUpload', type: MenuType.VIEW },
      { key: 'ExcelPasteUpload', path: 'ExcelPasteUploadSample', label: 'ExcelPasteUpload', type: MenuType.VIEW },
      { key: 'Menu', path: 'MenuManagement', label: 'Menu', type: MenuType.VIEW },
      { key: 'DynamicTable', path: 'DynamicTableSample', label: 'Dynamic Table', type: MenuType.VIEW },
      { key: 'Footer', path: 'FooterSample', label: 'Footer Sample', type: MenuType.VIEW },
      { key: 'Widget', path: 'WidgetSample', label: 'Widget Sample', type: MenuType.VIEW },
      {
        key: 'TabControl',
        path: 'TabControl',
        label: 'TabControl',
        type: MenuType.VIEW,
        children: [
          { key: 'TabControlTab1', path: 'TabControlTab1', label: 'TabControlTab1', type: MenuType.TAB },
          { key: 'TabControlTab2', path: 'TabControlTab2', label: 'TabControlTab2', type: MenuType.TAB },
        ],
      },
    ],
  },
];

export const menuTreeEtc: MenuNode[] = [
  {
    key: 'HOME',
    label: 'Home',
    type: MenuType.FOLDER,
    path: 'home',
    children: [{ key: DEFAULT_SCREEN_KEY, path: 'Dashboard', label: 'Dashboard', type: MenuType.VIEW }],
  },
  {
    key: 'SAMPLE',
    label: 'Samples',
    type: MenuType.FOLDER,
    path: 'sample',
    children: [{ key: 'SAMPLE1', path: 'Sample1', label: 'Sample1', type: MenuType.VIEW }],
  },
];

// 기본 시스템은 spp
export const menuTree: MenuNode[] = menuTreeSpp;
