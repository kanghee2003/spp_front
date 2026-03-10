import { Button } from 'antd';
import { useState } from 'react';
import ApprovalReqPopup from '../ap/ApprovalReqPopup';

const ApprovalReqSample = () => {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const formCode = 'F0001';

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        결재요청1
      </Button>

      <ApprovalReqPopup
        open={open}
        onClose={() => setOpen(false)}
        formCode={'F0001'}
        bizData={{
          docNo: 'DOC-20260309-001',
          seq: 123,
        }}
      />
      <Button type="primary" onClick={() => setOpen2(true)}>
        결재요청2
      </Button>

      <ApprovalReqPopup
        open={open2}
        onClose={() => setOpen2(false)}
        formCode={'F0002'}
        bizData={{
          docNo: 'DOC-20260309-002',
          seq: 3333,
        }}
      />
    </>
  );
};

export default ApprovalReqSample;
