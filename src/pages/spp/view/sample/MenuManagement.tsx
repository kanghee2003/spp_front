import { Layout, Card, Typography, Input, Button, Radio, Tree, Table, Space } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

const { Sider, Content } = Layout;
const { Title } = Typography;

const LEFT_W = 280;
const RIGHT_W = 360;
const MID_W = 64;

export default function PermissionLayoutNoCss() {
  return (
    <Layout style={{ height: '100%', background: '#f5f6f8' }}>
      {/* 왼쪽 */}
      <Sider width={LEFT_W} theme="light" style={{ background: 'transparent', padding: 16 }}>
        <Card
          bordered
          styles={{
            header: { background: '#fafbfc', borderBottom: '1px solid #eef0f4' },
            body: { padding: 12, height: 'calc(100vh - 32px - 56px)', display: 'flex', flexDirection: 'column', gap: 8 },
          }}
          title={
            <Title level={5} style={{ margin: 0 }}>
              권한 목록
            </Title>
          }
        >
          <Input.Search placeholder="검색" />
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {/* 리스트/트리 */}
            <div style={{ paddingTop: 8 }}>
              기본권한
              <br />
              정보보호담당자권한
            </div>
          </div>
        </Card>
      </Sider>

      {/* 가운데 */}
      <Content style={{ padding: 16 }}>
        <div
          style={{
            height: '100%',
            display: 'grid',
            gridTemplateColumns: `1fr ${MID_W}px ${RIGHT_W}px`,
            gap: 16, // ✅ 영역 구분 핵심
            alignItems: 'stretch',
          }}
        >
          {/* 설정목록(테이블) */}
          <Card
            bordered
            styles={{
              header: { background: '#fafbfc', borderBottom: '1px solid #eef0f4' },
              body: { padding: 12, height: 'calc(100vh - 32px - 56px)', display: 'flex', flexDirection: 'column' },
            }}
            title={
              <Title level={5} style={{ margin: 0 }}>
                설정목록
              </Title>
            }
            extra={<Button type="primary">전체삭제</Button>}
          >
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              <Table
                size="small"
                bordered
                pagination={false}
                columns={[
                  { title: '설정유형', dataIndex: 'type', width: 140 },
                  { title: '설정목록', dataIndex: 'value' },
                  { title: '삭제', width: 90, render: () => <Button size="small">삭제</Button> },
                ]}
                dataSource={[{ key: '1', type: '부서단위', value: '안전관리부' }]}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 12 }}>
              <Button>초기화</Button>
              <Button type="primary">저장</Button>
            </div>
          </Card>

          {/* 이동 버튼 컬럼 */}
          <Card
            bordered
            styles={{
              body: {
                padding: 0,
                height: 'calc(100vh - 32px - 56px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafbfc',
              },
            }}
          >
            <Space direction="vertical">
              <Button type="primary" icon={<LeftOutlined />} />
            </Space>
          </Card>

          {/* 오른쪽(라디오+트리) */}
          <Card
            bordered
            styles={{
              header: { background: '#fafbfc', borderBottom: '1px solid #eef0f4' },
              body: { padding: 12, height: 'calc(100vh - 32px - 56px)', display: 'flex', flexDirection: 'column', gap: 8 },
            }}
            title={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Title level={5} style={{ margin: 0 }}>
                  설정유형
                </Title>
                <Radio.Group
                  defaultValue="user"
                  options={[
                    { label: '사용자', value: 'user' },
                    { label: '사용자그룹', value: 'group' },
                    { label: '부서', value: 'dept' },
                  ]}
                />
              </div>
            }
          >
            <Input.Search placeholder="검색" />
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', border: '1px solid #eef0f4', borderRadius: 8, padding: 8, background: '#fff' }}>
              <Tree
                treeData={[
                  { title: 'AI개발부', key: 'a' },
                  { title: 'HR부', key: 'b' },
                ]}
              />
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
