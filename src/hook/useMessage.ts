import { useMessageStore } from '@/store/message.store';

export const useMessage = () => {
  const openConfirm = useMessageStore((s) => s.openConfirm);
  const openAlert = useMessageStore((s) => s.openAlert);
  const closeConfirm = useMessageStore((s) => s.closeConfirm);
  const closeAlert = useMessageStore((s) => s.closeAlert);

  const genRequestId = () => `${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const confirmMessage = (message?: string, okText?: string, cancelText?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      openConfirm({
        requestId: genRequestId(),
        message: message ?? '',
        okText: okText ?? '확인',
        cancelText: cancelText ?? '취소',
        onClickOK: () => {
          closeConfirm();
          resolve(true);
        },
        onClickCancel: () => {
          closeConfirm();
          resolve(false);
        },
        isOpen: true,
      });
    });
  };

  const alertMessage = (message?: string, okText?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      openAlert({
        requestId: genRequestId(),
        message: message ?? '',
        okText: okText ?? '확인',
        onClickOK: () => {
          closeAlert();
          resolve(true);
        },
        isOpen: true,
      });
    });
  };

  return { confirmMessage, alertMessage };
};
