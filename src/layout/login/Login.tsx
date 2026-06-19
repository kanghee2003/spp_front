import { Button, Card, Form, Input, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

import { useUserInfoStore } from '@/store/userInfo.store';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import { generateUuidV4 } from '@/utils/common.util';
import { getSystemKeyFromPath } from '@/utils/system.util';

type LoginProps = {
  userId: string;
  password: string;
};

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);

  const [form] = Form.useForm<LoginProps>();

  const setUserInfo = useUserInfoStore((s) => s.setUserInfo);
  const getUserInfo = () => {
    setUserInfo({ userId: '1', userName: '1', admFlag: true });
  };

  const onFinish = async (values: LoginProps) => {
    console.log('USER LOGIN', values);

    setToken(generateUuidV4());
  };

  useEffect(() => {
    if (token) {
      navigate(getSystemKeyFromPath());
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
          로그인
        </Typography.Title>

        <Form<LoginProps> form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="아이디" name="userId" rules={[{ required: true, message: '아이디를 입력해주세요.' }]}>
            <Input placeholder="아이디 입력" />
          </Form.Item>

          <Form.Item label="비밀번호" name="password" rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}>
            <Input.Password placeholder="비밀번호 입력" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block>
              로그인
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
