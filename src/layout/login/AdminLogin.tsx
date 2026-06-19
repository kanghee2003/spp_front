import { Button, Card, Form, Input, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useUserInfoStore } from '@/store/userInfo.store';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { generateUuidV4 } from '@/utils/common.util';

type AdminLoginProps = {
  userId: string;
  password: string;
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);

  const [form] = Form.useForm<AdminLoginProps>();
  const onFinish = async (values: AdminLoginProps) => {
    console.log('ADMIN LOGIN', values);
    setToken(generateUuidV4());
    navigate('/spp');
  };

  useEffect(() => {
    if (token) {
      navigate('/spp');
    }
  }, [token]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
      }}
    >
      <Card style={{ width: 360 }}>
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          관리자 로그인
        </Typography.Title>

        <Form<AdminLoginProps> form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="관리자 아이디" name="userId" rules={[{ required: true, message: '관리자 아이디를 입력해주세요.' }]}>
            <Input placeholder="관리자 아이디 입력" />
          </Form.Item>

          <Form.Item label="비밀번호" name="password" rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}>
            <Input.Password placeholder="비밀번호 입력" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block>
              관리자 로그인
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminLogin;
