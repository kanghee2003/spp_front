import React from 'react';
import { Form, Input, Button } from 'antd';

function isValidIpv4(value: string) {
  const s = value.trim();
  const m = s.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;

  for (let i = 1; i <= 4; i++) {
    const part = m[i];

    // 선행0 불허(정책): "0"은 OK, "00", "01"은 불허
    if (part.length > 1 && part.startsWith('0')) return false;

    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return false;
  }
  return true;
}

export default function IpSubmitOnlyForm() {
  const [form] = Form.useForm();

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const ip = String(values.ip).trim();
      console.log('submit ip =', ip);
    } catch {
      // validateFields가 에러를 던지면 antd가 Form.Item에 에러를 표시해줌
    }
  };

  return (
    <Form form={form} layout="vertical" initialValues={{ ip: '' }}>
      <Form.Item
        label="서버 IP"
        name="ip"
        validateTrigger={[]}
        rules={[
          { required: true, message: 'IP를 입력해 주세요.' },
          {
            validator(_, value) {
              const s = String(value ?? '').trim();
              if (!s) return Promise.reject(new Error('IP를 입력해 주세요.'));
              if (!isValidIpv4(s)) {
                return Promise.reject(new Error('올바른 IPv4 형식이 아닙니다. 예) 192.168.0.10'));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input placeholder="예) 192.168.0.10" inputMode="numeric" autoComplete="off" />
      </Form.Item>

      <Button type="primary" onClick={onSubmit}>
        저장
      </Button>
    </Form>
  );
}
