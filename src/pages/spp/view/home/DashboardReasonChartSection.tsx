import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Card, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import SppButton from '../../component/Button/SppButton';

const { Text, Title } = Typography;

const minMonth = dayjs('2019-12-01').startOf('month');
const maxMonth = dayjs().startOf('month');

const baseMonthData = [
  { unregistered: 51, completed: 29, pending: 20 },
  { unregistered: 35, completed: 40, pending: 25 },
  { unregistered: 20, completed: 55, pending: 25 },
  { unregistered: 28, completed: 47, pending: 25 },
  { unregistered: 18, completed: 62, pending: 20 },
  { unregistered: 24, completed: 51, pending: 25 },
];

const monthData = Array.from({ length: maxMonth.diff(minMonth, 'month') + 1 }, (_, index) => {
  const month = minMonth.add(index, 'month');
  const sample = baseMonthData[index % baseMonthData.length];

  return {
    monthKey: month.format('YYYY-MM'),
    monthLabel: month.format('YYYY년 M월'),
    ...sample,
  };
});

const legendItems = [
  { key: '1', label: '미등록', color: '#faad14' },
  { key: '2', label: '완료', color: '#52c41a' },
  { key: '3', label: '미결재', color: '#ff4d4f' },
];

const DashboardReasonChartSection = () => {
  const [monthIndex, setMonthIndex] = useState(monthData.length - 1);

  const current = monthData[monthIndex];
  const total = current.unregistered + current.completed + current.pending;
  const unregisteredPercent = Math.round((current.unregistered / total) * 100);

  const titleText = useMemo(() => {
    if (total === 0) return '미등록 0%';

    return `미등록 ${unregisteredPercent}%`;
  }, [current.unregistered, total]);

  const donutStyle = useMemo(() => {
    if (total === 0) {
      return { background: '#f0f0f0' };
    }

    const unregisteredDeg = (current.unregistered / total) * 360;
    const completedDeg = (current.completed / total) * 360;
    const pendingDeg = (current.pending / total) * 360;

    const firstEnd = unregisteredDeg;
    const secondEnd = unregisteredDeg + completedDeg;
    const thirdEnd = unregisteredDeg + completedDeg + pendingDeg;

    return {
      background: `conic-gradient(
        #faad14 0deg ${firstEnd}deg,
        #52c41a ${firstEnd}deg ${secondEnd}deg,
        #ff4d4f ${secondEnd}deg ${thirdEnd}deg
      )`,
    };
  }, [current.completed, current.pending, current.unregistered, total]);

  const canMovePrev = monthIndex > 0;
  const canMoveNext = monthIndex < monthData.length - 1;

  const movePrev = () => {
    if (!canMovePrev) return;
    setMonthIndex((prev) => prev - 1);
  };

  const moveNext = () => {
    if (!canMoveNext) return;
    setMonthIndex((prev) => prev + 1);
  };

  return (
    <div>
      <Title level={5} style={{ margin: '0 0 8px 0' }}>
        조회사유 처리현황
      </Title>

      <Card size="small" style={{ height: '100%' }} styles={{ body: { height: '100%' } }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Space size={6} align="center">
            <SppButton icon={<LeftOutlined />} onClick={movePrev} disabled={!canMovePrev} />
            <Text strong style={{ minWidth: 88, textAlign: 'center' }}>
              {current.monthLabel}
            </Text>
            <SppButton icon={<RightOutlined />} onClick={moveNext} disabled={!canMoveNext} />
          </Space>
        </div>

        <div
          style={{
            minHeight: 220,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: 600 }}>{titleText}</Text>

          <div
            style={{
              width: 118,
              height: 118,
              borderRadius: '50%',
              ...donutStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                boxShadow: 'inset 0 0 0 1px #f0f0f0',
              }}
            >
              <Text strong style={{ fontSize: 16, lineHeight: 1 }}>
                {`${unregisteredPercent}%`}
              </Text>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Space size={12} wrap>
              {legendItems.map((legend) => (
                <Space key={legend.key} size={6} align="center">
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: legend.color,
                      display: 'inline-block',
                    }}
                  />
                  <Text style={{ fontSize: 12 }}>{legend.label}</Text>
                </Space>
              ))}
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardReasonChartSection;
