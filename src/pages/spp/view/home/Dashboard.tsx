import { Card, Typography } from 'antd';

const Dashboard = () => {
  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Dashboard Overview
      </Typography.Title>

      <Typography.Paragraph style={{ marginBottom: 0 }}>대시보드</Typography.Paragraph>
    </Card>
  );
};

export default Dashboard;
