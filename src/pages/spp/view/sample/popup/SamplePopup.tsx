import SppModal, { SppModalProps } from '@/pages/spp/component/Modal/SppModal';
import React from 'react';

const SamplePopup = (props: SppModalProps) => {
  return (
    <SppModal {...props}>
      <div>
        <h3>test 팝업 본문</h3>
        <p>가나다라마바사</p>
        <p>ABCDEFGHIJKLMNOP</p>
      </div>
    </SppModal>
  );
};

export default SamplePopup;
