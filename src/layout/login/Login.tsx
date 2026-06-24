import { Button, Card, Form, Input, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

import { useUserInfoStore } from '@/store/userInfo.store';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import { generateUuidV4 } from '@/utils/common.util';
import { getSystemKeyFromPath, getSystemRootPath } from '@/utils/system.util';

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

    setToken(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9maWxlVXJsIjoiaHR0cHM6Ly9zd2luZ2Rldi5zaGluaGFuLmNvbS9la3AvbmFtZUNhcmRVUkwvMDFLMFhYWFhYWFhYWFhYWCIsInJvbGVzIjpbeyJyb2xlSWQiOiJSMjczNDEzNzcwMTgzMDAyOSIsInJvbGVOYW1lIjoic3RhbGst7Jew64-ZIO2FjOyKpO2KuDQifSx7InJvbGVJZCI6IlIxMDAwMDAwMDAwMDAwMDAxIiwicm9sZU5hbWUiOiJVU0VSIn1dLCJkZXBhcnRtZW50cyI6W3siZGVwYXJ0bWVudElkIjoiRDYzMzE3MDg2MCIsImRlcGFydG1lbnRObyI6IklNMDgiLCJkZXBhcnRtZW50TmFtZSI6IkRT6rCc67Cc7YyAIiwiZGVwYXJ0bWVudFBhdGgiOiJDMzAwMjIwNjE5L0Q4MTI1Mzg1NDAvRDEyNDIwODU3Ny9ENjQzNzA1NTAyL0Q2MzMxNzA4NjAiLCJkZXBhcnRtZW50TmFtZVBhdGgiOiLsi6DtlZzsnYDtlokv67O467aA67aA7IScL1RlY2jqt7jro7kvVGVjaOq4sO2ajeu2gC9EU-qwnOuwnO2MgCIsImJhc2VEZXBhcnRtZW50WW4iOiJZIn1dLCJvdGhlcldvcmtlcnMiOlt7ImNvbXBhbnlDb2RlIjoiU0giLCJwb3NpdGlvbk5hbWUiOiJT7ISg7J6EIiwiZW1wbG95ZWVOYW1lIjoi7ZmN6ri464-ZIiwiZW1wbG95ZWVObyI6IjIyMTIxOTAzIn1dLCJwZXJzb25hbFBob25lIjoiMDEwLTAwMDAtNTI2NyIsImNvbXBhbnlOYW1lIjoi7Iug7ZWc7J2A7ZaJIiwibWVtbyI6IiIsImVtcGxveWVlTm8iOiIyMzExMTAwOCIsInBvc2l0aW9uTmFtZSI6IiIsIndvcmtMb2NhdGlvbiI6IuyEnOyauO2KueuzhOyLnCDspJHqtawg64Ko64yA66y466GcMTDquLggMjkg67Cx64WE6rSAIDTsuLUiLCJ1bml0VHlwZSI6IkVNUExPWUVFIiwid2ViRW1haWwiOiIqKioqKipAc2hpbmhhbi5jb20iLCJjb21wYW55Tm8iOiJTSCIsImNvbXBhbnlFbWFpbCI6InNoMjMxMTEwMDhAc3dpbmdkZXYuc2hpbmhhbi5jb20iLCJjb21wYW55UGhvbmUiOiI1LTAwMDAiLCJwcm9maWxlSW1hZ2VVcmwiOiIiLCJwYXJlbnRHd0NtcENkIjoiIiwiZGVwYXJ0bWVudE5hbWUiOiIiLCJlbXBsb3llZU5hbWUiOiLquYDrr7ztnawiLCJjaGFyZ2VXb3JrIjoi66y47ISc67CY7Lac7Iuc7Iqk7YWcXG5IU0JDIDnsuLUgLyDsgrzshLHrs7jqtIAgMuy4tSIsImlubmVyTGluZVBob25lIjoiNS0wMDAwIiwicGFyZW50Q29tcGFueUNvZGUiOiIiLCJhYnNlbnRlZWlzbUluZm8iOiIiLCJmYXhOdW1iZXIiOiIiLCJzdWIiOiIyMzExMTAwOCIsImlhdCI6MTc2OTY2NjIzMywiZXhwIjoxNzY5NjY5ODMzfQ.RXJFEeUKzLHNRSJQGhKXPmxhrmYsf0oEGAXO-6g6JZo',
    );
  };

  useEffect(() => {
    if (token) {
      navigate(getSystemRootPath(getSystemKeyFromPath(location.pathname)));
    }
  }, [token, location.pathname, navigate]);

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
