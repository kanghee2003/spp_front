import React, { useMemo, useState } from 'react';
import { Tabs, Tree, Form, Input, Radio, Button, Space, Card, Divider, Typography, message, List } from 'antd';
import type { DataNode } from 'antd/es/tree';

const { Text } = Typography;

type MenuItem = {
  id: string;
  parentId?: string | null;
  name: string;
  path?: string;
  cssClass?: string;
  actionId?: string;
  useYn: 'Y' | 'N';
  sortNo?: number;
  remark?: string;
  type: 'MENU' | 'MYMENU';
};

// ---- mock 데이터 ----
const mockMenus: MenuItem[] = [
  { id: 'M1', parentId: null, name: '통합결재목록', path: '/appr/list', useYn: 'Y', type: 'MENU', sortNo: 1 },
  { id: 'M1-1', parentId: 'M1', name: '결재함', path: '/appr/box', useYn: 'Y', type: 'MENU', sortNo: 1 },
  { id: 'M1-2', parentId: 'M1', name: '기안함', path: '/appr/draft', useYn: 'Y', type: 'MENU', sortNo: 2 },
  { id: 'M2', parentId: null, name: '정보보호', path: '/sec', useYn: 'Y', type: 'MENU', sortNo: 2 },
  { id: 'M2-1', parentId: 'M2', name: '점검', path: '/sec/audit', useYn: 'N', type: 'MENU', sortNo: 1 },
];

const mockMyMenuList: MenuItem[] = [
  { id: 'MY1', parentId: null, name: '정보보안', path: '/sec/info', useYn: 'Y', type: 'MYMENU', sortNo: 1 },
  { id: 'MY2', parentId: null, name: '문서반출 시스템', path: '/sec/docout', useYn: 'Y', type: 'MYMENU', sortNo: 2 },
  { id: 'MY3', parentId: null, name: '개인정보 관리시스템', path: '/sec/privacy', useYn: 'Y', type: 'MYMENU', sortNo: 3 },
  { id: 'MY4', parentId: null, name: '영상정보기기 관리시스템', path: '/sec/cctv', useYn: 'N', type: 'MYMENU', sortNo: 4 },
];

// ---- 유틸: 평면 리스트 -> Tree Data ----
function buildTree(nodes: MenuItem[]): DataNode[] {
  const byParent = new Map<string | null, MenuItem[]>();
  for (const n of nodes) {
    const key = n.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(n);
  }

  const make = (parentId: string | null): DataNode[] => {
    const children = (byParent.get(parentId) ?? []).sort((a, b) => (a.sortNo ?? 0) - (b.sortNo ?? 0));
    return children.map((c) => ({
      key: c.id,
      title: c.name,
      children: make(c.id),
    }));
  };

  return make(null);
}

export default function MenuManagePage() {
  const [activeKey, setActiveKey] = useState<'tab1' | 'tab2'>('tab1');

  const treeData = useMemo(() => buildTree(mockMenus), []);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const formEnabled = !!selected;

  const [form] = Form.useForm<MenuItem>();

  const selectItem = (item: MenuItem) => {
    setSelected(item);
    form.setFieldsValue(item);
  };

  const onTreeSelect = (keys: React.Key[]) => {
    const id = String(keys?.[0] ?? '');
    if (!id) return;

    const found = mockMenus.find((m) => m.id === id);
    if (!found) return;

    selectItem(found);
  };

  const onNew = () => {
    const empty: MenuItem = {
      id: '',
      parentId: null,
      name: '',
      path: '',
      cssClass: '',
      actionId: '',
      useYn: 'Y',
      sortNo: 1,
      remark: '',
      type: activeKey === 'tab1' ? 'MENU' : 'MYMENU',
    };
    setSelected(empty);
    form.setFieldsValue(empty);
  };

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      message.success(`저장(샘플): ${values.name}`);
      setSelected(values);
    } catch {
      // validation error
    }
  };

  const onDelete = () => {
    if (!selected?.id) return message.info('새 항목은 삭제할 수 없어요.');
    message.success(`삭제(샘플): ${selected.name}`);
    setSelected(null);
    form.resetFields();
  };

  const RightForm = (
    <Card
      size="small"
      title="메뉴 정보"
      extra={
        <Space>
          <Button onClick={onNew}>신규</Button>
          <Button type="primary" onClick={onSave} disabled={!formEnabled}>
            저장
          </Button>
          <Button danger onClick={onDelete} disabled={!formEnabled}>
            삭제
          </Button>
        </Space>
      }
      style={{ height: '100%' }}
      styles={{ body: { height: 'calc(100% - 56px)', overflow: 'auto' } }}
    >
      {!formEnabled && (
        <>
          <Text type="secondary">왼쪽에서 항목을 선택하면 오른쪽 상세 정보가 표시돼요.</Text>
          <Divider />
        </>
      )}

      <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} disabled={!formEnabled}>
        <Form.Item label="ID" name="id">
          <Input placeholder="(신규는 비워둠)" />
        </Form.Item>

        <Form.Item label="메뉴명" name="name" rules={[{ required: true, message: '메뉴명을 입력하세요.' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="URL" name="path">
          <Input />
        </Form.Item>

        <Form.Item label="cssClass" name="cssClass">
          <Input />
        </Form.Item>

        <Form.Item label="actionId" name="actionId">
          <Input />
        </Form.Item>

        <Form.Item label="사용여부" name="useYn">
          <Radio.Group>
            <Radio value="Y">사용(Y)</Radio>
            <Radio value="N">미사용(N)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="비고" name="remark">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Card>
  );

  // 1탭: 트리 + 폼
  const Tab1 = (
    <div style={{ display: 'flex', gap: 12, height: 'calc(100vh - 160px)' }}>
      <Card size="small" title="메뉴목록" style={{ width: 360, height: '100%' }} styles={{ body: { height: 'calc(100% - 56px)', overflow: 'auto' } }}>
        <Tree treeData={treeData} defaultExpandAll onSelect={onTreeSelect} selectedKeys={selected?.id ? [selected.id] : []} />
      </Card>

      <div style={{ flex: 1, minWidth: 520, height: '100%' }}>{RightForm}</div>
    </div>
  );

  // ✅ 2탭: 왼쪽 "목록(List)" + 오른쪽 폼 (클릭하면 상세 표시)
  const Tab2 = (
    <div style={{ display: 'flex', gap: 12, height: 'calc(100vh - 160px)' }}>
      <Card size="small" title="마이메뉴 목록" style={{ width: 360, height: '100%' }} styles={{ body: { height: 'calc(100% - 56px)', overflow: 'auto' } }}>
        <List
          size="small"
          dataSource={[...mockMyMenuList].sort((a, b) => (a.sortNo ?? 0) - (b.sortNo ?? 0))}
          renderItem={(item) => {
            const isActive = selected?.id === item.id;
            return (
              <List.Item
                style={{
                  cursor: 'pointer',
                  padding: '8px 10px',
                  borderRadius: 6,
                  marginBottom: 4,
                  background: isActive ? 'rgba(22,119,255,0.12)' : undefined,
                  border: isActive ? '1px solid rgba(22,119,255,0.35)' : '1px solid transparent',
                }}
                onClick={() => selectItem(item)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.path} · 사용:{item.useYn}
                  </Text>
                </div>
              </List.Item>
            );
          }}
        />
      </Card>

      <div style={{ flex: 1, minWidth: 520, height: '100%' }}>{RightForm}</div>
    </div>
  );

  return (
    <Card size="small" style={{ width: '100%' }}>
      <Tabs
        activeKey={activeKey}
        onChange={(k) => {
          setActiveKey(k as 'tab1' | 'tab2');
          // 탭 이동 시 선택 유지/초기화는 정책에 따라 조절 가능
        }}
        items={[
          { key: 'tab1', label: '메뉴관리', children: Tab1 },
          { key: 'tab2', label: '마이메뉴관리', children: Tab2 },
        ]}
      />
    </Card>
  );
}
