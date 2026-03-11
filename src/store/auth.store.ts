import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type AuthStore = {
  token?: string;
  setToken: (state?: string) => void;
  clearToken: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: undefined,

      setToken: (state) => set({ token: state }),

      clearToken: () => set({ token: undefined }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
