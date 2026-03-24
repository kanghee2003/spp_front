import { Card, List, Tabs, Tag, Typography } from 'antd';
import type { TabsProps } from 'antd';

const { Text } = Typography;

const portalItems = [
  { key: '1', badge: '공지사항', title: '정보보호포털 시스템 사용자 가이드', date: '2025.12.02' },
  { key: '2', badge: '공지사항', title: '정보보호포털 시스템 사용자 가이드', date: '2025.12.02' },
  { key: '3', badge: '공지사항', title: '정보보호포털 시스템 사용자 가이드', date: '2025.12.02' },
];

const swingItems = [
  { key: '1', badge: '공지사항', title: 'SWING 시스템 점검 안내', date: '2025.12.02' },
  { key: '2', badge: '공지사항', title: 'SWING 메뉴 개편 안내', date: '2025.12.02' },
  { key: '3', badge: '공지사항', title: 'SWING 사용자 가이드', date: '2025.12.02' },
];

const renderList = (items: typeof portalItems) => (
  <List
    size="small"
    dataSource={items}
    renderItem={(item) => (
      <List.Item extra={<Text type="secondary">{item.date}</Text>} style={{ paddingInline: 0, paddingBlock: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag color="blue" style={{ marginInlineEnd: 0 }}>
            {item.badge}
          </Tag>
          <Text style={{ fontSize: 12 }}>{item.title}</Text>
        </div>
      </List.Item>
    )}
  />
);

const DashboardNoticeSection = () => {
  const items: TabsProps['items'] = [
    { key: 'portal', label: '정보보호포털', children: renderList(portalItems) },
    { key: 'swing', label: 'SWING', children: renderList(swingItems) },
  ];

  return (
    <Card title="공지사항" size="small" style={{ height: '100%' }} styles={{ body: { paddingTop: 8 } }}>
      <Tabs defaultActiveKey="portal" size="small" items={items} />
    </Card>
  );
};

export default DashboardNoticeSection;
