import { useEffect, useState } from 'react';
import { Descriptions, message } from 'antd';
import { Controller, useForm } from 'react-hook-form';

import { ApprovalContentProps } from '@/pages/spp/type/ap/SppApproval.type';
import SppInputText from '@/pages/spp/component/Input/SppInputText';

type F0002Form = {
  aprvTitle: string;
  docNo: string;
  content1: string;
  content2: string;
};

const F0002 = ({ docNo, mode = 'view', onSubmitCallback, onEditableChange }: ApprovalContentProps) => {
  const { control, reset, getValues } = useForm<F0002Form>({
    defaultValues: {
      aprvTitle: '',
      docNo: '',
      content1: '',
      content2: '',
    },
  });

  const [viewData, setViewData] = useState<F0002Form>({
    aprvTitle: '',
    docNo: '',
    content1: '',
    content2: '',
  });

  useEffect(() => {
    onEditableChange?.(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const item: F0002Form = {
        aprvTitle: 'F0002 결재제목',
        docNo: docNo ?? '',
        content1: 'xxx',
        content2: 'yyy',
      };

      reset(item);
      setViewData(item);
    };

    fetchData();
  }, [docNo, reset]);

  const handleSave = async () => {
    try {
      const formValues = getValues();

      console.log('F0002 save payload = ', formValues);

      // await axiosService().post('/api/approval/f0002/save', formValues);

      setViewData(formValues);

      return true;
    } catch (error) {
      console.error(error);
      message.error('본문 저장 중 오류가 발생했습니다.');
      return false;
    }
  };

  useEffect(() => {
    if (mode === 'edit') {
      onSubmitCallback?.(handleSave);
      return;
    }

    onSubmitCallback?.(null);
  }, [mode]);

  if (mode === 'edit') {
    return (
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="내용1">
          <Controller name="content1" control={control} render={({ field }) => <SppInputText {...field} placeholder="내용1" />} />
        </Descriptions.Item>

        <Descriptions.Item label="내용2">
          <Controller name="content2" control={control} render={({ field }) => <SppInputText {...field} placeholder="내용2" />} />
        </Descriptions.Item>
      </Descriptions>
    );
  }

  return (
    <Descriptions bordered column={1} size="small">
      <Descriptions.Item label="내용1">{viewData.content1}</Descriptions.Item>
      <Descriptions.Item label="내용2">{viewData.content2}</Descriptions.Item>
    </Descriptions>
  );
};

export default F0002;
