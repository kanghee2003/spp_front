import { create } from 'zustand';
import { DEFAULT_SCREEN_KEY } from '@/config/mockMenuConfig';

export type MdiTab = {
  /** Screen key (AutoRoutes/menuTree와 동일한 값) */
  key: string;
  title: string;
};

type State = {
  tabs: MdiTab[];
  activeKey: string;
  openTab: (tab: MdiTab) => void;
  closeTab: (key: string) => void;
  resetTabs: () => void;
  setActive: (key: string) => void;
  reorder: (from: number, to: number) => void;
  ensureDashboard: () => void;
};

const DASHBOARD_KEY = DEFAULT_SCREEN_KEY;

export const useMdiStore = create<State>((set, get) => ({
  tabs: [],
  activeKey: DASHBOARD_KEY,

  ensureDashboard: () => {
    const { tabs } = get();
    const has = tabs.some((t) => t.key === DASHBOARD_KEY);
    if (!has) {
      set({
        tabs: [{ key: DASHBOARD_KEY, title: 'Dashboard' }],
        activeKey: DASHBOARD_KEY,
      });
      return;
    }

    // 대시보드는 항상 첫번째 고정
    if (tabs[0]?.key !== DASHBOARD_KEY) {
      const rest = tabs.filter((t) => t.key !== DASHBOARD_KEY);
      set({
        tabs: [{ key: DASHBOARD_KEY, title: 'Dashboard' }, ...rest],
      });
    }
  },

  openTab: (tab) =>
    set((state) => {
      const exists = state.tabs.some((t) => t.key === tab.key);
      const nextTabs = exists ? state.tabs : [...state.tabs, tab];
      return { tabs: nextTabs, activeKey: tab.key };
    }),

  closeTab: (key) =>
    set((state) => {
      // 대시보드는 항상 유지(닫기 불가)
      if (key === DASHBOARD_KEY) {
        return { activeKey: DASHBOARD_KEY };
      }
      const nextTabs = state.tabs.filter((t) => t.key !== key);
      const nextActive = state.activeKey === key ? (nextTabs[nextTabs.length - 1]?.key ?? DASHBOARD_KEY) : state.activeKey;

      // 최소 1개(대시보드)는 항상 유지
      if (nextTabs.length === 0) {
        return {
          tabs: [{ key: DASHBOARD_KEY, title: 'Dashboard' }],
          activeKey: DASHBOARD_KEY,
        };
      }

      return { tabs: nextTabs, activeKey: nextActive };
    }),

  // 시스템 전환 등으로 모든 탭을 닫아야 할 때 사용
  resetTabs: () =>
    set(() => ({
      tabs: [{ key: DASHBOARD_KEY, title: 'Dashboard' }],
      activeKey: DASHBOARD_KEY,
    })),

  setActive: (key) => set({ activeKey: key }),

  reorder: (from, to) => {
    const { tabs, activeKey } = get();
    if (from === to) return;

    // 대시보드 탭은 항상 첫번째 고정(드래그로 순서 변경 불가)
    if (tabs[from]?.key === DASHBOARD_KEY) return;
    if (to === 0) to = 1;

    const next = [...tabs];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    // 혹시 모를 케이스 대비: 대시보드가 0번에 오도록 정규화
    const dashIdx = next.findIndex((t) => t.key === DASHBOARD_KEY);
    if (dashIdx > 0) {
      const [dash] = next.splice(dashIdx, 1);
      next.unshift(dash);
    }

    set({ tabs: next, activeKey });
  },
}));
