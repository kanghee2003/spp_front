import { Card, List, Typography } from 'antd';

export default function RolesPage() {
  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Roles
      </Typography.Title>
      <List bordered dataSource={['Admin', 'Manager', 'User']} renderItem={(item) => <List.Item>{item}</List.Item>} />
    </Card>
  );
}
