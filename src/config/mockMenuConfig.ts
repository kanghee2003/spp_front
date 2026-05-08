import { MenuType, type MenuNode } from '@/store/menu.store';
import { SystemKey } from '@/utils/system.util';

// AppLayout 등에서 type을 import할 수 있도록 re-export
export type { MenuNode } from '@/store/menu.store';

export const DEFAULT_SCREEN_KEY = 'DASHBOARD';

// 시스템별 메뉴 트리(향후 API로 대체 예정)
export const menuTreeSpp: MenuNode[] = [
  {
    key: 'HOME',
    label: 'Home',
    type: MenuType.FOLDER,
    children: [
      {
        key: DEFAULT_SCREEN_KEY,
        path: 'home/Dashboard',
        label: 'Dashboard',
        type: MenuType.VIEW,
      },
    ],
  },
  {
    key: 'SAMPLE',
    label: 'Samples',
    type: MenuType.FOLDER,
    children: [
      { key: 'Sample1', path: 'sample/Sample1', label: 'Sample1', type: MenuType.VIEW },
      { key: 'Compnent', path: 'sample/ComponentSample', label: 'Component', type: MenuType.VIEW },
      { key: 'Editor', path: 'sample/EditorSample', label: 'Editor', type: MenuType.VIEW },
      { key: 'FileUpload', path: 'sample/FileUploadSample', label: 'FileUpload', type: MenuType.VIEW },
      { key: 'ExcelPasteUpload', path: 'sample/ExcelPasteUploadSample', label: 'ExcelPasteUpload', type: MenuType.VIEW },
      { key: 'Menu', path: 'sample/MenuManagement', label: 'Menu', type: MenuType.VIEW },
      { key: 'Dept', path: 'sample/DeptManagement', label: 'DeptManagement', type: MenuType.VIEW },
      { key: 'ExpandedTree', path: 'sample/ExpandedTree', label: 'ExpandedTree', type: MenuType.VIEW },
      { key: 'DynamicTable', path: 'sample/DynamicTableSample', label: 'Dynamic Table', type: MenuType.VIEW },
      { key: 'Footer', path: 'sample/FooterSample', label: 'Footer Sample', type: MenuType.VIEW },
      { key: 'Widget', path: 'sample/WidgetSample', label: 'Widget Sample', type: MenuType.VIEW },
      { key: 'IpManagement', path: 'sample/IpManagement', label: 'Ip Valid', type: MenuType.VIEW },
      { key: 'ApprovalReqSample', path: 'sample/ApprovalReqSample', label: 'ApprovalReqSample', type: MenuType.VIEW },
      { key: 'CalendarSample', path: 'sample/CalendarSample', label: 'CalendarSample', type: MenuType.VIEW },
      { key: 'TemplateManagement', path: 'sample/TemplateManagement', label: 'TemplateManagement', type: MenuType.VIEW },

      {
        key: 'TabControl',
        path: 'sample/TabControl',
        label: 'TabControl',
        type: MenuType.VIEW,
        children: [
          { key: 'TabControlTab1', path: 'sample/TabControlTab1', label: 'TabControlTab1', type: MenuType.TAB },
          { key: 'TabControlTab2', path: 'sample/TabControlTab2', label: 'TabControlTab2', type: MenuType.TAB },
        ],
      },
    ],
  },
  {
    key: 'ip',
    label: 'ip',
    type: MenuType.FOLDER,
    children: [
      {
        key: 'SppIp0006M',
        path: 'ip/SppIp0006M',
        label: 'TabControl',
        type: MenuType.VIEW,
        children: [
          { key: 'SppIp0006T01', path: 'ip/SppIp0006T01', label: 'SppIp0006T01', type: MenuType.TAB },
          { key: 'SppIp0006T02', path: 'ip/SppIp0006T02', label: 'SppIp0006T02', type: MenuType.TAB },
          { key: 'SppIp0006T03', path: 'ip/SppIp0006T03', label: 'SppIp0006T03', type: MenuType.TAB },
          { key: 'SppIp0006T04', path: 'ip/SppIp0006T04', label: 'SppIp0006T04', type: MenuType.TAB },
          { key: 'SppIp0006T05', path: 'ip/SppIp0006T05', label: 'SppIp0006T05', type: MenuType.TAB },
          { key: 'SppIp0006T06', path: 'ip/SppIp0006T06', label: 'SppIp0006T06', type: MenuType.TAB },
          { key: 'SppIp0006T07', path: 'ip/SppIp0006T07', label: 'SppIp0006T07', type: MenuType.TAB },
          { key: 'SppIp0006T08', path: 'ip/SppIp0006T08', label: 'SppIp0006T08', type: MenuType.TAB },
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
    children: [
      {
        key: DEFAULT_SCREEN_KEY,
        path: 'home/Dashboard',
        label: 'Dashboard',
        type: MenuType.VIEW,
      },
    ],
  },
  {
    key: 'SAMPLE',
    label: 'Samples',
    type: MenuType.FOLDER,
    children: [{ key: 'SAMPLE1', path: 'sample/Sample1', label: 'Sample1', type: MenuType.VIEW }],
  },
];

const menuTreeMap: Record<SystemKey, MenuNode[]> = {
  spp: menuTreeSpp,
  etc: menuTreeEtc,
};

export function getMockMenuTree(systemKey: SystemKey): MenuNode[] {
  return menuTreeMap[systemKey];
}

// 기본 시스템은 spp
export const menuTree: MenuNode[] = menuTreeSpp;
