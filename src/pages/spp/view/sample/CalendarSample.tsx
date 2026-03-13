import { Button, Calendar, Divider, Space, type CalendarProps } from 'antd';
import { LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import locale from 'antd/es/date-picker/locale/ko_KR';
import 'dayjs/locale/ko';
import { MouseEvent, useMemo, useRef, useState } from 'react';

dayjs.locale('ko');

type ScheduleItem = {
  id: number;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
};

const mockSchedules: ScheduleItem[] = [
  { id: 1, title: '정보보호 점검', date: '2026-03-10', allDay: true },
  { id: 2, title: '교육 일정', date: '2026-03-10', startTime: '09:00', endTime: '10:00' },
  { id: 3, title: '회의', date: '2026-03-11', startTime: '14:00', endTime: '15:00' },
  { id: 4, title: '점검', date: '2026-03-11', startTime: '16:00', endTime: '17:00' },
  { id: 5, title: '보고', date: '2026-03-12', startTime: '10:00', endTime: '11:00' },
];

const PREVIEW_LIMIT = 2;

function getDateKey(date: Dayjs) {
  return date.format('YYYY-MM-DD');
}

function isSameDate(a: Dayjs | null, b: Dayjs) {
  if (!a) return false;
  return a.format('YYYY-MM-DD') === b.format('YYYY-MM-DD');
}

function formatScheduleTime(item: ScheduleItem) {
  if (item.allDay) return '하루 종일';
  if (item.startTime && item.endTime) return `${item.startTime} ~ ${item.endTime}`;
  return '';
}

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [layerPos, setLayerPos] = useState<{ top: number; left: number } | null>(null);

  const calendarWrapRef = useRef<HTMLDivElement | null>(null);

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();

    mockSchedules.forEach((item) => {
      const key = item.date;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    });

    return map;
  }, []);

  const getSchedules = (date: Dayjs) => {
    return schedulesByDate.get(getDateKey(date)) ?? [];
  };

  const moveMonth = (diff: number) => {
    setCurrentDate((prev) => prev.add(diff, 'month'));
    setSelectedDate(null);
    setLayerPos(null);
  };

  const onSelect: CalendarProps<Dayjs>['onSelect'] = (value) => {
    setCurrentDate(value);
  };

  const onPanelChange: CalendarProps<Dayjs>['onPanelChange'] = (value) => {
    setCurrentDate(value);
    setSelectedDate(null);
    setLayerPos(null);
  };

  const handleCellClick = (date: Dayjs, e: MouseEvent<HTMLDivElement>) => {
    const wrapRect = calendarWrapRef.current?.getBoundingClientRect();
    const cellRect = e.currentTarget.getBoundingClientRect();

    if (!wrapRect) return;

    let left = cellRect.left - wrapRect.left + 20;
    let top = cellRect.top - wrapRect.top + 28;

    const layerWidth = 320;
    const layerHeight = 260;

    if (left + layerWidth > wrapRect.width) {
      left = Math.max(8, wrapRect.width - layerWidth - 8);
    }

    if (top + layerHeight > wrapRect.height) {
      top = Math.max(8, cellRect.top - wrapRect.top - layerHeight + cellRect.height);
    }

    setSelectedDate(date);
    setLayerPos({ top, left });
  };

  const fullCellRender: CalendarProps<Dayjs>['fullCellRender'] = (date) => {
    const schedules = getSchedules(date);
    const previewList = schedules.slice(0, PREVIEW_LIMIT);
    const hiddenCount = Math.max(0, schedules.length - PREVIEW_LIMIT);
    const selected = isSameDate(selectedDate, date);

    return (
      <div
        style={{
          minHeight: 110,
          padding: 8,
          border: selected ? '1px solid #1677ff' : '1px solid transparent',
          borderRadius: 6,
          background: selected ? '#f0f7ff' : undefined,
          boxSizing: 'border-box',
          cursor: 'pointer',
        }}
        onClick={(e) => handleCellClick(date, e)}
      >
        <div style={{ textAlign: 'right', fontWeight: 600, marginBottom: 8 }}>{date.date()}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {previewList.map((item) => (
            <div
              key={item.id}
              style={{
                fontSize: 12,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={item.title}
            >
              • {item.title}
            </div>
          ))}

          {hiddenCount > 0 && <div style={{ fontSize: 12, fontWeight: 600 }}>+ {hiddenCount}개 일정</div>}
        </div>
      </div>
    );
  };

  const selectedSchedules = selectedDate ? getSchedules(selectedDate) : [];

  return (
    <div ref={calendarWrapRef} style={{ position: 'relative' }}>
      <Calendar
        value={currentDate}
        locale={locale}
        onSelect={onSelect}
        onPanelChange={onPanelChange}
        headerRender={() => {
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <Space>
                <Button icon={<LeftOutlined />} onClick={() => moveMonth(-1)} />
                <Button icon={<RightOutlined />} onClick={() => moveMonth(1)} />
                <Button
                  onClick={() => {
                    const today = dayjs();
                    setCurrentDate(today);
                    setSelectedDate(null);
                    setLayerPos(null);
                  }}
                >
                  오늘
                </Button>
              </Space>

              <div style={{ fontSize: 24, fontWeight: 700 }}>{currentDate.format('YYYY. MM')}</div>

              <div style={{ width: 120 }} />
            </div>
          );
        }}
        fullCellRender={fullCellRender}
      />

      {selectedDate && layerPos && (
        <div
          style={{
            position: 'absolute',
            top: layerPos.top,
            left: layerPos.left,
            width: 320,
            background: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: 12,
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 700 }}>{selectedDate.format('YYYY-MM-DD')}</div>

            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => {
                setSelectedDate(null);
                setLayerPos(null);
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selectedSchedules.length === 0 ? (
              <div style={{ fontSize: 12, color: '#666' }}>등록된 일정이 없습니다.</div>
            ) : (
              selectedSchedules.map((item) => (
                <div key={item.id}>
                  <div style={{ fontWeight: 500 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{formatScheduleTime(item)}</div>
                </div>
              ))
            )}
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <Button
            type="primary"
            size="small"
            onClick={() => {
              console.log('일정추가', selectedDate.format('YYYY-MM-DD'));
            }}
          >
            일정추가
          </Button>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
