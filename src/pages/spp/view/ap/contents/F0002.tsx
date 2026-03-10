import { useEffect } from 'react';
import { Descriptions } from 'antd';
import { ApprovalContentProps } from '@/pages/spp/type/ap/Approval.type';

const F0002 = ({ bizData, onChangeDraft }: ApprovalContentProps) => {
  useEffect(() => {
    const fetchData = async () => {
      onChangeDraft?.({
        aprvTitle: 'F0002 결재제목',
        docNo: bizData?.docNo,
      });
    };

    fetchData();
  }, [bizData, onChangeDraft]);

  return (
    <Descriptions bordered column={1} size="small">
      <Descriptions.Item label="내용1">{'xxx'}</Descriptions.Item>
      <Descriptions.Item label="내용2">{'yyy'}</Descriptions.Item>
    </Descriptions>
  );
};

export default F0002;
