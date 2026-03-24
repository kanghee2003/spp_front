import { Card, List, Tag, Typography } from 'antd';

const { Text } = Typography;

const items = [
  { key: '1', badge: '신청', title: '정보보호포털 시스템 신청 안내사항' },
  { key: '2', badge: '신청', title: '정보보호포털 시스템 신청 안내사항' },
  { key: '3', badge: '조회사유', title: '조회사유에 대한 가이드' },
  { key: '4', badge: '보호점검', title: '정보보안 현황에 대한 가이드' },
];

const getColor = (badge?: string) => {
  switch (badge) {
    case '신청':
      return 'orange';
    case '조회사유':
      return 'gold';
    default:
      return 'red';
  }
};

const DashboardFaqSection = () => {
  return (
    <Card title="FAQ" size="small" style={{ height: '100%' }}>
      <List
        size="small"
        dataSource={items}
        renderItem={(item) => (
          <List.Item style={{ paddingInline: 0, paddingBlock: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag color={getColor(item.badge)} style={{ marginInlineEnd: 0 }}>
                {item.badge}
              </Tag>
              <Text style={{ fontSize: 12 }}>{item.title}</Text>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default DashboardFaqSection;
