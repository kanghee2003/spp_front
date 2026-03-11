import { useEffect, useMemo, useState } from 'react';
import { Button, Descriptions, Input, message } from 'antd';
import { Controller, useForm } from 'react-hook-form';

import { ApprovalContentProps } from '@/pages/spp/type/ap/SppApproval.type';
import SppInputText from '@/pages/spp/component/Input/SppInputText';
import SppTable from '@/pages/spp/component/Table/SppTable';

type F0001Form = {
  aprvTitle: string;
  docNo: string;
  content1: string;
  content2: string;
};

type F0001TableRow = {
  id: number;
  itemNm: string;
  itemValue: string;
};

const F0001 = ({ docNo, mode = 'view', onSubmitCallback, onEditableChange }: ApprovalContentProps) => {
  const { control, reset, getValues } = useForm<F0001Form>({
    defaultValues: {
      aprvTitle: '',
      docNo: '',
      content1: '',
      content2: '',
    },
  });

  const [viewData, setViewData] = useState<F0001Form>({
    aprvTitle: '',
    docNo: '',
    content1: '',
    content2: '',
  });

  const [tableData, setTableData] = useState<F0001TableRow[]>([
    { id: 1, itemNm: '항목1', itemValue: '값1' },
    { id: 2, itemNm: '항목2', itemValue: '값2' },
  ]);

  useEffect(() => {
    onEditableChange?.(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const item: F0001Form = {
        aprvTitle: 'F0001 결재제목',
        docNo: docNo ?? '',
        content1: 'x',
        content2: 'y',
      };

      reset(item);
      setViewData(item);
    };

    fetchData();
  }, [docNo, reset]);

  const handleAddRow = () => {
    setTableData((prev) => [
      ...prev,
      {
        id: Date.now(),
        itemNm: '',
        itemValue: '',
      },
    ]);
  };

  const handleChangeRow = (id: number, field: 'itemNm' | 'itemValue', value: string) => {
    setTableData((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        return { ...row, [field]: value };
      }),
    );
  };

  const handleSave = async () => {
    try {
      const formValues = getValues();

      const payload = {
        ...formValues,
        tableData,
      };

      console.log('F0001 save payload = ', payload);

      // await axiosService().post('/api/approval/f0001/save', payload);

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
  }, [mode, tableData]);

  const columns = useMemo(
    () => [
      {
        title: '항목명',
        dataIndex: 'itemNm',
        key: 'itemNm',
        render: (_: any, row: F0001TableRow) =>
          mode === 'edit' ? <Input value={row.itemNm} onChange={(e) => handleChangeRow(row.id, 'itemNm', e.target.value)} /> : row.itemNm,
      },
      {
        title: '값',
        dataIndex: 'itemValue',
        key: 'itemValue',
        render: (_: any, row: F0001TableRow) =>
          mode === 'edit' ? <Input value={row.itemValue} onChange={(e) => handleChangeRow(row.id, 'itemValue', e.target.value)} /> : row.itemValue,
      },
    ],
    [mode],
  );

  if (mode === 'edit') {
    return (
      <div>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="내용1">
            <Controller name="content1" control={control} render={({ field }) => <SppInputText {...field} placeholder="내용1" />} />
          </Descriptions.Item>

          <Descriptions.Item label="내용2">
            <Controller name="content2" control={control} render={({ field }) => <SppInputText {...field} placeholder="내용2" />} />
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 12, marginBottom: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={handleAddRow}>행추가</Button>
        </div>

        <SppTable rowKey="id" columns={columns} dataSource={tableData} pagination={false} />
      </div>
    );
  }

  return (
    <div>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="내용1">{viewData.content1}</Descriptions.Item>
        <Descriptions.Item label="내용2">{viewData.content2}</Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 12 }}>
        <SppTable rowKey="id" columns={columns} dataSource={tableData} pagination={false} />
      </div>
    </div>
  );
};

export default F0001;
