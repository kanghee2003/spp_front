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

/** MDI 상단 탭바에서 열 수 있는 최대 탭 수 (대시보드 포함) */
const MAX_MDI_TABS = 10;

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
      const keep = rest.slice(Math.max(0, rest.length - (MAX_MDI_TABS - 1)));
      const nextTabs = [{ key: DASHBOARD_KEY, title: 'Dashboard' }, ...keep];
      set({ tabs: nextTabs });
      return;
    }


    if (tabs.length > MAX_MDI_TABS) {
      const dash = tabs[0];
      const rest = tabs.slice(1);
      set({ tabs: [dash, ...rest.slice(rest.length - (MAX_MDI_TABS - 1))] });
    }
  },

  openTab: (tab) =>
    set((state) => {
      const exists = state.tabs.some((t) => t.key === tab.key);
      let nextTabs = exists ? state.tabs : [...state.tabs, tab];

      // 최대 탭 수 초과 시, 가장 왼쪽(대시보드 다음)부터 자동으로 닫기
      if (!exists && nextTabs.length > MAX_MDI_TABS) {
        const hasDashboard = nextTabs.some((t) => t.key === DASHBOARD_KEY);

        // 대시보드는 항상 유지/첫번째 고정
        if (hasDashboard) {
          const dashIdx = nextTabs.findIndex((t) => t.key === DASHBOARD_KEY);
          if (dashIdx > 0) {
            const [dash] = nextTabs.splice(dashIdx, 1);
            nextTabs.unshift(dash);
          }
        }

        const overflow = nextTabs.length - MAX_MDI_TABS;
        if (overflow > 0) {
          if (hasDashboard && nextTabs[0]?.key === DASHBOARD_KEY) {
            const dash = nextTabs[0];
            const rest = nextTabs.slice(1);
            nextTabs = [dash, ...rest.slice(overflow)];
          } else {
            nextTabs = nextTabs.slice(overflow);
          }
        }
      }

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
