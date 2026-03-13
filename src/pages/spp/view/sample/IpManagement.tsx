import { Form, Input, Button } from 'antd';
import { isValidIpv4 } from '@/utils/common.util';

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
