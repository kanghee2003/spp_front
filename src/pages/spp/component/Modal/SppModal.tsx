import { Modal } from 'antd';
import { ModalProps } from 'antd/es/modal/interface';

export interface SppModalProps extends ModalProps {}

const SppModal = (props: SppModalProps) => {
  return (
    <>
      <Modal
        {...props}
        maskClosable={false}
        keyboard={false}
        okText={props.okText ? props.okText : '확인'}
        cancelText={props.cancelText ? props.cancelText : '취소'}
      >
        {props.children}
      </Modal>
    </>
  );
};

export default SppModal;
