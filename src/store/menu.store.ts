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
};

export const useMenuStore = create<State>((set) => ({
  systemKey: (() => {
    try {
      const seg = window.location.pathname.split('/').filter(Boolean)[0] as SystemKey | undefined;
      return seg === 'etc' || seg === 'spp' ? seg : 'spp';
    } catch {
      return 'spp';
    }
  })(),
  // 메뉴 트리는 화면 로딩 시(App.tsx 등)에서 setMenuTree로 주입한다.
  menuTree: [],

  setSystemKey: (systemKey) => set(() => ({ systemKey })),

  setMenuTree: (menuTree) => set(() => ({ menuTree })),
}));
