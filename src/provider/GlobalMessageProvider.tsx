import { useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { useMessageStore } from '@/store/message.store';

const GlobalMessageProvider = () => {
  const alertState = useMessageStore((s) => s.alertState);
  const confirmState = useMessageStore((s) => s.confirmState);
  const closeAlert = useMessageStore((s) => s.closeAlert);
  const closeConfirm = useMessageStore((s) => s.closeConfirm);

  // 같은 payload가 연속해서 들어올 때 중복 방지용 시그니처
  const lastAlertSig = useRef<string>('');
  const lastConfirmSig = useRef<string>('');

  useEffect(() => {
    if (!alertState?.isOpen) return;

    const sig = `alert|${alertState.message}|${alertState.okText ?? ''}`;
    if (lastAlertSig.current === sig) {
      closeAlert();
      return;
    }
    lastAlertSig.current = sig;

    Modal.info({
      title: alertState.message,
      okText: alertState.okText,
      onOk: alertState.onClickOK,
    });

    closeAlert();
  }, [alertState?.isOpen, alertState?.message, alertState?.okText, alertState?.onClickOK, closeAlert]);

  useEffect(() => {
    if (!confirmState?.isOpen) return;

    const sig = `confirm|${confirmState.message}|${confirmState.okText ?? ''}|${confirmState.cancelText ?? ''}`;
    if (lastConfirmSig.current === sig) {
      closeConfirm();
      return;
    }
    lastConfirmSig.current = sig;

    Modal.confirm({
      title: confirmState.message,
      okText: confirmState.okText,
      cancelText: confirmState.cancelText,
      onOk: confirmState.onClickOK,
      onCancel: confirmState.onClickCancel,
    });

    closeConfirm();
  }, [
    confirmState?.isOpen,
    confirmState?.message,
    confirmState?.okText,
    confirmState?.cancelText,
    confirmState?.onClickOK,
    confirmState?.onClickCancel,
    closeConfirm,
  ]);

  return null;
};

export default GlobalMessageProvider;
