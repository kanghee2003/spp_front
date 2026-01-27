import { Button, Card, Descriptions, Form, Input, InputNumber, Layout, Radio, Space, Tag, Tree, Typography } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useMemo, useState } from 'react';

const { Sider, Content } = Layout;
const { Title } = Typography;

type MenuInfo = {
  menuId: string;
  upperMenuId: string;
  menuNm: string;
  menuDispNm: string;
  menuLevel: number;
  actId: string;
  scriptNm: string;
  menuType: string;
  useYn: 'Y' | 'N';
  remark?: string;
};

const MOCK_BY_KEY: Record<string, MenuInfo> = {
  MENU_WORK_ISPS_3030: {
    menuId: 'MENU_WORK_ISPS_3030',
    upperMenuId: 'MENU_WORK_ISPS_3000',
    menuNm: '개인정보보호담당자결재',
    menuDispNm: '개인정보보호 담당자결재',
    menuLevel: 2,
    actId: 'ACTN_WORK_ISPS_3030_0000',
    scriptNm: 'selfCall',
    menuType: 'L',
    useYn: 'Y',
    remark: '',
  },
  MENU_WORK_ISPS_3050: {
    menuId: 'MENU_WORK_ISPS_3050',
    upperMenuId: 'MENU_WORK_ISPS_3000',
    menuNm: '유통등록',
    menuDispNm: '유통 등록',
    menuLevel: 2,
    actId: 'ACTN_WORK_ISPS_3050_0000',
    scriptNm: 'selfCall',
    menuType: 'L',
    useYn: 'N',
    remark: '테스트 비고',
  },
};

export default function MenuInfoPage() {
  const [selectedKey, setSelectedKey] = useState<string>('MENU_WORK_ISPS_3030');
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const data = useMemo<MenuInfo>(() => {
    return MOCK_BY_KEY[selectedKey] ?? Object.values(MOCK_BY_KEY)[0];
  }, [selectedKey]);

  const treeData = useMemo<DataNode[]>(
    () => [
      {
        key: 'ROOT',
        title: '메뉴목록',
        children: [
          { key: 'MENU_WORK_ISPS_3030', title: '개인정보보호담당자결재' },
          { key: 'MENU_WORK_ISPS_3050', title: '유통등록' },
        ],
      },
    ],
    [],
  );

  const handleSelect = (keys: React.Key[]) => {
    const k = String(keys?.[0] ?? '');
    if (!k || k === 'ROOT') return;
    setSelectedKey(k);
    setMode('view');
  };

  return (
    <Layout style={{ height: '100%', minHeight: 720, background: '#fff', border: '1px solid #eee' }}>
      <Sider width={280} style={{ background: '#fff', borderRight: '1px solid #eee', padding: 12 }}>
        <Title level={5} style={{ margin: 0, marginBottom: 12 }}>
          메뉴목록
        </Title>

        <Tree defaultExpandAll showLine selectedKeys={[selectedKey]} treeData={treeData} onSelect={handleSelect} />
      </Sider>

      <Content style={{ padding: 16 }}>
        {mode === 'view' ? (
          <MenuInfoView data={data} onEdit={() => setMode('edit')} onDelete={() => console.log('delete', data.menuId)} />
        ) : (
          <MenuInfoEdit
            initialValues={data}
            onSubmit={(v) => {
              console.log('save', v);
              // 실제로는 여기서 API 호출 후 성공하면 view로 전환
              setMode('view');
            }}
            onCancel={() => setMode('view')}
          />
        )}
      </Content>
    </Layout>
  );
}

function MenuInfoView({ data, onEdit, onDelete }: { data: MenuInfo; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card
      title="메뉴 정보조회"
      extra={
        <Space>
          <Button onClick={onEdit}>수정</Button>
          <Button danger onClick={onDelete}>
            삭제
          </Button>
        </Space>
      }
    >
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="메뉴ID">{data.menuId}</Descriptions.Item>
        <Descriptions.Item label="상위메뉴ID">{data.upperMenuId}</Descriptions.Item>

        <Descriptions.Item label="메뉴명">{data.menuNm}</Descriptions.Item>
        <Descriptions.Item label="메뉴표시명">{data.menuDispNm}</Descriptions.Item>

        <Descriptions.Item label="메뉴레벨">{data.menuLevel}</Descriptions.Item>
        <Descriptions.Item label="액션ID">{data.actId}</Descriptions.Item>

        <Descriptions.Item label="스크립트명">{data.scriptNm}</Descriptions.Item>
        <Descriptions.Item label="메뉴타입">{data.menuType}</Descriptions.Item>

        <Descriptions.Item label="사용여부">{data.useYn === 'Y' ? <Tag color="green">사용(Y)</Tag> : <Tag color="red">미사용(N)</Tag>}</Descriptions.Item>
        <Descriptions.Item label="비고">{data.remark || '-'}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

function MenuInfoEdit({ initialValues, onSubmit, onCancel }: { initialValues: Partial<MenuInfo>; onSubmit: (values: MenuInfo) => void; onCancel: () => void }) {
  const [form] = Form.useForm<MenuInfo>();

  return (
    <Card title="메뉴 정보수정">
      <Form<MenuInfo>
        form={form}
        layout="vertical"
        initialValues={{
          useYn: 'Y',
          menuLevel: 1,
          ...initialValues,
        }}
        onFinish={onSubmit}
      >
        <Form.Item name="menuId" label="메뉴ID" rules={[{ required: true, message: '메뉴ID는 필수입니다.' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="upperMenuId" label="상위메뉴ID" rules={[{ required: true, message: '상위메뉴ID는 필수입니다.' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="menuNm" label="메뉴명" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="menuDispNm" label="메뉴표시명">
          <Input />
        </Form.Item>

        <Form.Item name="menuLevel" label="메뉴레벨" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="actId" label="액션ID">
          <Input />
        </Form.Item>

        <Form.Item name="scriptNm" label="스크립트명">
          <Input />
        </Form.Item>

        <Form.Item name="menuType" label="메뉴타입">
          <Input />
        </Form.Item>

        <Form.Item name="useYn" label="사용여부" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value="Y">사용(Y)</Radio>
            <Radio value="N">미사용(N)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="remark" label="비고">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit">
            저장
          </Button>
          <Button onClick={onCancel}>취소</Button>
        </Space>
      </Form>
    </Card>
  );
}
