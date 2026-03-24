import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Calendar, Card, Divider, List, Popover, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import SppButton from '../../component/Button/SppButton';

const { Text } = Typography;

const DashboardCalendarSection = () => {
  const today = dayjs();
  const [viewDate, setViewDate] = useState<Dayjs>(today.startOf('month'));

  const eventMap: Record<string, { title: string; time?: string }[]> = {
    '2026-03-10': [{ title: '정보보호 점검 미처리 알림', time: '09:00' }],
    '2026-03-16': [{ title: '주요 점검사항 등록 확인', time: '14:00' }],
    '2026-03-23': [
      { title: '정보보호 점검 마감일', time: '10:00' },
      { title: '보안점검 확인', time: '15:00' },
    ],
  };

  const recentItem = [
    { key: '1', title: '오늘 정보보호 점검 미처리 알림입니다.', date: '2025.01.02' },
    { key: '2', title: '주요 점검사항은 반드시 등록하여 주시기 바랍니다.', date: '2025.01.02' },
    { key: '3', title: '오늘은 정보보호 점검 마감일입니다.', date: '2025.01.02' },
  ];

  const minMonth = dayjs('2019-12-01').startOf('month');
  const maxMonth = today.startOf('month');
  const canMovePrev = viewDate.isAfter(minMonth);
  const canMoveNext = viewDate.isBefore(maxMonth);

  const movePrevMonth = () => canMovePrev && setViewDate((prev) => prev.subtract(1, 'month'));
  const moveNextMonth = () => canMoveNext && setViewDate((prev) => prev.add(1, 'month'));
  const monthTitle = useMemo(() => viewDate.format('M월 YYYY'), [viewDate]);
  const getEvents = (date: Dayjs) => eventMap[date.format('YYYY-MM-DD')] ?? [];

  const renderPopoverContent = (date: Dayjs, events: { title: string; time?: string }[]) => (
    <div style={{ minWidth: 180 }}>
      <Text strong>{date.format('YYYY-MM-DD')}</Text>
      {events.length > 0 ? (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {events.map((event, index) => (
            <div key={index}>
              <Text style={{ fontSize: 12 }}>{event.title}</Text>
              {event.time ? (
                <>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {event.time}
                  </Text>
                </>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            등록된 일정이 없습니다.
          </Text>
        </div>
      )}
    </div>
  );

  const dateFullCellRender = (date: Dayjs) => {
    const events = getEvents(date);
    const isCurrentMonth = date.month() === viewDate.month();
    const isToday = date.isSame(today, 'day');

    return (
      <Popover trigger="click" placement="top" content={renderPopoverContent(date, events)}>
        <div
          style={{
            minHeight: 42,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: 0,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isCurrentMonth ? '#262626' : '#bfbfbf',
              background: 'transparent',
              border: isToday ? '1px solid #fa8c16' : '1px solid transparent',
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: 12 }}>{date.date()}</span>
          </div>
          <div style={{ height: 8, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {events.length > 0 ? <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#1677ff', display: 'inline-block' }} /> : null}
          </div>
        </div>
      </Popover>
    );
  };

  return (
    <Card size="small" style={{ height: '100%' }} styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: '#262626' }}>
          <span>안녕하세요 김신한님 </span>
          <span>오늘 </span>
          <span style={{ color: '#1677ff', fontWeight: 600 }}>3건</span>
          <span>의 주요 일정이 있습니다.</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: 16 }}>
            {monthTitle}
          </Text>
          <div style={{ display: 'flex', gap: 8 }}>
            <SppButton onClick={movePrevMonth} disabled={!canMovePrev} icon={<LeftOutlined />} />
            <SppButton onClick={moveNextMonth} disabled={!canMoveNext} icon={<RightOutlined />} />
          </div>
        </div>

        <Calendar
          fullscreen={false}
          value={viewDate}
          headerRender={() => null}
          onPanelChange={(date) => {
            const next = date.startOf('month');
            if (next.isBefore(minMonth)) return setViewDate(minMonth);
            if (next.isAfter(maxMonth)) return setViewDate(maxMonth);
            setViewDate(next);
          }}
          onSelect={(date) => setViewDate(date.startOf('month'))}
          fullCellRender={(date) => dateFullCellRender(date)}
        />

        <Divider style={{ margin: 0 }} />
        <Text strong>최근일정</Text>
      </Space>

      <div style={{ marginTop: 6 }}>
        <List
          size="small"
          dataSource={recentItem}
          renderItem={(item) => (
            <List.Item style={{ paddingInline: 0, paddingBlock: 8 }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <Text style={{ fontSize: 12 }}>{item.title}</Text>
                <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                  {item.date}
                </Text>
              </div>
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
};

export default DashboardCalendarSection;
