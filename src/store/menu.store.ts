import { create } from 'zustand';

export enum MenuType {
  FOLDER = 'F',
  VIEW = 'V',
  TAB = 'T',
}

export type MenuNode = {
  key: string;
  path?: string;
  label: string;
  type: MenuType;
  children?: MenuNode[];
};

export type SystemKey = 'spp' | 'etc';

type State = {
  systemKey: SystemKey;
  menuTree: MenuNode[];
  setSystemKey: (systemKey: SystemKey) => void;
  setMenuTree: (menuTree: MenuNode[]) => void;

  findMenuPath: (targetKey: string) => MenuNode[];
  findMenuNode: (targetKey: string) => MenuNode | undefined;
};

const findPath = (menus: MenuNode[], targetKey: string, parents: MenuNode[] = []): MenuNode[] | null => {
  for (const menu of menus) {
    const current = [...parents, menu];

    if (menu.key === targetKey) {
      return current;
    }

    if (menu.children?.length) {
      const found = findPath(menu.children, targetKey, current);
      if (found) return found;
    }
  }

  return null;
};

const findNode = (menus: MenuNode[], targetKey: string): MenuNode | undefined => {
  for (const menu of menus) {
    if (menu.key === targetKey) return menu;

    if (menu.children?.length) {
      const found = findNode(menu.children, targetKey);
      if (found) return found;
    }
  }
};

export const useMenuStore = create<State>((set, get) => ({
  systemKey: (() => {
    try {
      const seg = window.location.pathname.split('/').filter(Boolean)[0] as SystemKey | undefined;
      return seg === 'etc' || seg === 'spp' ? seg : 'spp';
    } catch {
      return 'spp';
    }
  })(),

  menuTree: [],

  setSystemKey: (systemKey) => set(() => ({ systemKey })),

  setMenuTree: (menuTree) => set(() => ({ menuTree })),

  findMenuPath: (targetKey) => {
    const { menuTree } = get();
    return findPath(menuTree, targetKey) ?? [];
  },

  findMenuNode: (targetKey) => {
    const { menuTree } = get();
    return findNode(menuTree, targetKey);
  },
}));
