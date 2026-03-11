import { UserInfo } from '@/type/common.type';
import { userInfo } from 'node:os';
import { create } from 'zustand';

type UserInfoStore = {
  userInfo?: UserInfo;
  setUserInfo: (state: UserInfo) => void;
};
export const useUserInfoStore = create<UserInfoStore>((set) => ({ userInfo: undefined, setUserInfo: (state) => set({ userInfo: state }) }));
