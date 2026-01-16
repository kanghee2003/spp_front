import { create } from 'zustand';

export type ConfirmState = {
  message: string;
  okText?: string;
  cancelText?: string;
  onClickOK: () => void;
  onClickCancel: () => void;
  isOpen: boolean;
};

export type AlertState = {
  message: string;
  okText?: string;
  onClickOK: () => void;
  isOpen: boolean;
};

type MessageStore = {
  confirmState?: ConfirmState;
  alertState?: AlertState;
  openConfirm: (state: ConfirmState) => void;
  closeConfirm: () => void;
  openAlert: (state: AlertState) => void;
  closeAlert: () => void;
  clearAll: () => void;
};

export const useMessageStore = create<MessageStore>((set, get) => ({
  confirmState: undefined,
  alertState: undefined,

  openConfirm: (state) => set({ confirmState: state }),
  closeConfirm: () => {
    const cur = get().confirmState;
    if (!cur) return;
    set({ confirmState: { ...cur, message: '', isOpen: false } });
  },

  openAlert: (state) => set({ alertState: state }),
  closeAlert: () => {
    const cur = get().alertState;
    if (!cur) return;
    set({ alertState: { ...cur, message: '', isOpen: false } });
  },

  clearAll: () => set({ confirmState: undefined, alertState: undefined }),
}));
