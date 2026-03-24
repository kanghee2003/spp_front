import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Card, Select, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import SppButton from '../../component/Button/SppButton';

const { Title, Text } = Typography;

const minMonth = dayjs('2019-12-01').startOf('month');
const currentMonth = dayjs().startOf('month');

const segments = [
  { color: '#52c41a', label: '점검 진행상태(진행중/종료/해당없음)', width: 18 },
  { color: '#4c74dd', label: '개인정보', width: 18 },
  { color: '#ef5b6c', label: '담당자 직무지식', width: 26 },
  { color: '#f0b22a', label: '관리자 직무지식', width: 18 },
  { color: '#cf58b5', label: '정보보안점검(전산/부문)', width: 20 },
];

const DashboardInspectionSection = () => {
  const [month, setMonth] = useState(currentMonth);
  const canPrev = month.isAfter(minMonth);
  const canNext = month.isBefore(currentMonth);
  const monthLabel = useMemo(() => `${month.year()}년 ${month.month() + 1}월`, [month]);

  return (
    <Card size="small" styles={{ body: { padding: 18 } }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Title level={4} style={{ margin: 0 }}>
              정보보호 점검현황
            </Title>
            <SppButton icon={<LeftOutlined />} disabled={!canPrev} onClick={() => canPrev && setMonth((v) => v.subtract(1, 'month'))} />
            <Text strong style={{ fontSize: 16 }}>
              {monthLabel}
            </Text>
            <SppButton icon={<RightOutlined />} disabled={!canNext} onClick={() => canNext && setMonth((v) => v.add(1, 'month'))} />
            <Select
              style={{ width: 260 }}
              value="영업점 고객정보 보호점검"
              options={[{ value: '영업점 고객정보 보호점검', label: '영업점 고객정보 보호점검' }]}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'center' }}>
          <div style={{ width: '100%', height: 34, borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
            {segments.map((seg) => (
              <div key={seg.label} style={{ width: `${seg.width}%`, background: seg.color }} />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            {segments.map((seg) => (
              <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color, display: 'inline-block', flexShrink: 0 }} />
                <Text style={{ fontSize: 12 }}>{seg.label}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DashboardInspectionSection;
