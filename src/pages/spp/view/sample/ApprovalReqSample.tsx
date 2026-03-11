import { Button } from 'antd';
import { useState } from 'react';
import ApprovalReqPopup from '../ap/ApprovalReqPopup';

const ApprovalReqSample = () => {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        결재요청1
      </Button>

      <Button type="primary" onClick={() => setOpen2(true)}>
        결재요청2
      </Button>

      <Button type="primary" onClick={() => setOpen3(true)}>
        결재요청3
      </Button>

      <ApprovalReqPopup open={open} onClose={() => setOpen(false)} formCode="F0001" docNo="DOC-20260309-001" />
      <ApprovalReqPopup open={open2} onClose={() => setOpen2(false)} formCode="F0002" docNo="DOC-20260309-001" />
      <ApprovalReqPopup open={open3} onClose={() => setOpen3(false)} formCode="F0003" docNo="DOC-20260309-003" />
    </>
  );
};

export default ApprovalReqSample;
