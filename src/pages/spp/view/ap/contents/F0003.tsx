import { useEffect, useState } from 'react';
import { Descriptions } from 'antd';
import { ApprovalContentProps } from '@/pages/spp/type/ap/SppApproval.type';

type F0003Data = {
  docNo: string;
  content1: string;
  content2: string;
};

const F0003 = ({ docNo, onEditableChange }: ApprovalContentProps) => {
  const [viewData, setViewData] = useState<F0003Data>({
    docNo: '',
    content1: '',
    content2: '',
  });

  useEffect(() => {
    onEditableChange?.(false);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const item: F0003Data = {
        docNo: docNo ?? '',
        content1: 'xxxxxx',
        content2: 'yyyyy',
      };

      setViewData(item);
    };

    fetchData();
  }, [docNo]);

  return (
    <Descriptions bordered column={1} size="small">
      <Descriptions.Item label="내용1">{viewData.content1}</Descriptions.Item>
      <Descriptions.Item label="내용2">{viewData.content2}</Descriptions.Item>
    </Descriptions>
  );
};

export default F0003;
