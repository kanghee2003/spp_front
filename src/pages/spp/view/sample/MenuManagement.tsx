import { Badge, Button, Calendar, List, Modal, Space, Typography } from 'antd';
import type { CalendarProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const { Text } = Typography;

export type DashboardScheduleType = 'MEETING' | 'DEPLOY' | 'ETC';

export interface DashboardSchedule {
  id: string;
  date: string; // 'YYYY-MM-DD'
  title: string;
  type?: DashboardScheduleType;
  time?: string; // 'HH:mm' (optional)
}

function getMonthKey(value: Dayjs) {
  return value.format('YYYY-MM');
}

/**
 * ✅ 여기만 실제 API로 교체하세요.
 * - value는 현재 패널(월) 기준 날짜
 * - 반환은 그 달의 일정 전체 (YYYY-MM-DD 단위로 date를 채워서)
 */
async function fetchMonthSchedules(value: Dayjs): Promise<DashboardSchedule[]> {
  const ym = value.format('YYYY-MM');

  // demo data
  const demo: DashboardSchedule[] = [
    { id: '1', date: `${ym}-02`, title: '정기회의', type: 'MEETING', time: '10:00' },
    { id: '2', date: `${ym}-02`, title: '권한 배포', type: 'DEPLOY', time: '19:30' },
    { id: '3', date: `${ym}-07`, title: '점검', type: 'ETC' },
    { id: '4', date: `${ym}-15`, title: '리뷰', type: 'MEETING' },
    { id: '5', date: `${ym}-15`, title: '사전 리허설', type: 'ETC' },
    { id: '6', date: `${ym}-15`, title: '운영 배포', type: 'DEPLOY' },
  ];

  await new Promise((r) => setTimeout(r, 200));
  return demo;
}

function toBadgeStatus(type?: DashboardScheduleType): 'processing' | 'success' | 'default' | 'warning' | 'error' {
  switch (type) {
    case 'MEETING':
      return 'processing';
    case 'DEPLOY':
      return 'success';
    default:
      return 'default';
  }
}

function formatItem(item: DashboardSchedule) {
  if (!item.time) return item.title;
  return `${item.time} ${item.title}`;
}

export interface DashboardScheduleCalendarProps {
  title?: string;
  height?: number;
  onAddClick?: (date: string) => void; // 날짜별 "추가" 버튼 훅
  onItemClick?: (item: DashboardSchedule) => void; // 일정 클릭 훅
}

export default function DashboardScheduleCalendar({ title = '일정', height = 360, onAddClick, onItemClick }: DashboardScheduleCalendarProps) {
  const [panelValue, setPanelValue] = useState<Dayjs>(() => dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const monthKey = useMemo(() => getMonthKey(panelValue), [panelValue]);

  const { data: monthSchedules = [], isFetching } = useQuery({
    queryKey: ['dashboardSchedules', monthKey],
    queryFn: () => fetchMonthSchedules(panelValue),
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  });

  const eventMap = useMemo(() => {
    const map: Record<string, DashboardSchedule[]> = {};
    for (const e of monthSchedules) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    });
    return map;
  }, [monthSchedules]);

  const selectedKey = selectedDate ? selectedDate.format('YYYY-MM-DD') : '';
  const selectedEvents = selectedKey ? eventMap[selectedKey] || [] : [];

  const dateCellRender: CalendarProps<Dayjs>['dateCellRender'] = (value) => {
    const key = value.format('YYYY-MM-DD');
    const list = eventMap[key] || [];
    if (list.length === 0) return null;

    const visible = list.slice(0, 2);
    const remain = list.length - visible.length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Space size={6} wrap>
          {list.slice(0, 3).map((it) => (
            <Badge key={it.id} status={toBadgeStatus(it.type)} />
          ))}
        </Space>

        {visible.map((it) => (
          <Text key={it.id} ellipsis style={{ fontSize: 11, display: 'block' }} title={formatItem(it)}>
            {formatItem(it)}
          </Text>
        ))}

        {remain > 0 && <Text style={{ fontSize: 11, opacity: 0.6 }}>{`+${remain} more`}</Text>}
      </div>
    );
  };

  const headerRender: CalendarProps<Dayjs>['headerRender'] = ({ value }) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8 }}>
        <Space>
          <Text strong>{title}</Text>
          <Text type="secondary">{value.format('YYYY년 MM월')}</Text>
          {isFetching && <Text type="secondary">조회중…</Text>}
        </Space>

        <Button size="small" onClick={() => setPanelValue(dayjs())}>
          오늘
        </Button>
      </div>
    );
  };

  const handleSelect: CalendarProps<Dayjs>['onSelect'] = (date) => {
    setSelectedDate(date);
  };

  const handlePanelChange: CalendarProps<Dayjs>['onPanelChange'] = (value) => {
    setPanelValue(value);
  };

  return (
    <>
      <div style={{ height, overflow: 'hidden' }}>
        <Calendar
          value={panelValue}
          fullscreen={true}
          headerRender={headerRender}
          dateCellRender={dateCellRender}
          onSelect={handleSelect}
          onPanelChange={handlePanelChange}
        />
      </div>

      <Modal
        open={!!selectedDate}
        title={selectedDate ? selectedDate.format('YYYY-MM-DD') : ''}
        onCancel={() => setSelectedDate(null)}
        footer={
          <Space>
            <Button onClick={() => setSelectedDate(null)}>닫기</Button>
            <Button
              type="primary"
              onClick={() => {
                if (!selectedDate) return;
                onAddClick?.(selectedDate.format('YYYY-MM-DD'));
              }}
            >
              일정 추가
            </Button>
          </Space>
        }
      >
        {selectedEvents.length === 0 ? (
          <Text type="secondary">등록된 일정이 없습니다.</Text>
        ) : (
          <List
            dataSource={selectedEvents}
            renderItem={(item) => (
              <List.Item style={{ cursor: onItemClick ? 'pointer' : 'default' }} onClick={() => onItemClick?.(item)}>
                <Space>
                  <Badge status={toBadgeStatus(item.type)} />
                  <Text>{formatItem(item)}</Text>
                </Space>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </>
  );
}
