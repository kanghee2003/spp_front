import { create } from 'zustand';

export type MenuNode = {
  key: string;
  path?: string;
  label: string;
  /** leaf 메뉴 여부 (2/3/4레벨 어디든 leaf일 수 있음) */
  isLeaf?: boolean;
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
