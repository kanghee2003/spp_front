import { create } from 'zustand';

type LoadingStore = {
  /** 화면에서 구독할 로딩 상태 (기존 loadingAtom) */
  loadings: string[];

  /** 기존 useRef 역할: 내부 큐 */
  queue: string[];

  /** remove 지연 반영 타이머 */
  _timer?: ReturnType<typeof setTimeout>;

  add: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
};

export const useLoadingStore = create<LoadingStore>((set, get) => ({
  loadings: [],
  queue: [],
  _timer: undefined,

  add: (key) => {
    const next = [...get().queue, key];
    // 기존: queue 갱신 후 즉시 setLoadings(loadings)
    set({ queue: next, loadings: next });
  },

  remove: (key) => {
    const { queue, _timer } = get();

    const idx = queue.findIndex((item) => item === key);
    if (idx < 0) return; // (Recoil 코드의 -1 splice 버그 방지)

    const next = [...queue];
    next.splice(idx, 1);

    // 기존: queue는 즉시 갱신
    set({ queue: next });

    // 기존: 500ms 뒤 setLoadings(loadings)
    if (_timer) clearTimeout(_timer);

    const timer = setTimeout(() => {
      // 타이머 시점에 최신 queue를 반영(연속 add/remove 경합 방지)
      set({ loadings: get().queue, _timer: undefined });
    }, 500);

    set({ _timer: timer });
  },

  clear: () => {
    const { _timer } = get();
    if (_timer) clearTimeout(_timer);

    set({ queue: [], loadings: [], _timer: undefined });
  },
}));
