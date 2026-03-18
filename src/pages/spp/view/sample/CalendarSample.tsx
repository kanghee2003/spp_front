import { Button, Calendar, Checkbox, DatePicker, Divider, Input, Modal, Select, Space, type CalendarProps } from 'antd';
import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import locale from 'antd/es/date-picker/locale/ko_KR';
import 'dayjs/locale/ko';
import { MouseEvent, useMemo, useRef, useState } from 'react';

dayjs.locale('ko');

type ScheduleItem = {
  schdNo: number;
  schdTtlNm: string;
  schdSttDate: string;
  schdEndDate: string;
  schdSttTime?: string;
  schdEndTime?: string;
  allDay?: string;
};

const mockSchedules: ScheduleItem[] = [
  { schdNo: 1, schdTtlNm: '정보보호 점검', schdSttDate: '2026-03-10', schdEndDate: '2026-03-10', allDay: 'Y' },
  { schdNo: 2, schdTtlNm: '교육 일정', schdSttDate: '2026-03-10', schdEndDate: '2026-03-10', schdSttTime: '09:00', schdEndTime: '10:00', allDay: 'N' },
  { schdNo: 3, schdTtlNm: '회의', schdSttDate: '2026-03-11', schdEndDate: '2026-03-11', schdSttTime: '14:00', schdEndTime: '15:00', allDay: 'N' },
  { schdNo: 4, schdTtlNm: '점검', schdSttDate: '2026-03-11', schdEndDate: '2026-03-11', schdSttTime: '16:00', schdEndTime: '17:00', allDay: 'N' },
  { schdNo: 5, schdTtlNm: '보고', schdSttDate: '2026-03-12', schdEndDate: '2026-03-12', schdSttTime: '10:00', schdEndTime: '11:00', allDay: 'N' },
  { schdNo: 6, schdTtlNm: '3일 점검 일정', schdSttDate: '2026-03-13', schdEndDate: '2026-03-15', allDay: 'Y' },
  { schdNo: 7, schdTtlNm: '장기 프로젝트 회의', schdSttDate: '2026-03-18', schdEndDate: '2026-03-20', schdSttTime: '09:00', schdEndTime: '18:00', allDay: 'N' },
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
  if (item.allDay === 'Y') return '하루 종일';
  if (item.schdSttTime && item.schdEndTime) return `${item.schdSttTime} ~ ${item.schdEndTime}`;
  return '';
}

function getDateColor(date: Dayjs, currentDate: Dayjs) {
  if (date.month() !== currentDate.month()) return '#bfbfbf';

  const day = date.day();

  if (day === 0) return '#ff4d4f';
  if (day === 6) return '#1677ff';
  return '#000000d9';
}

function filterSchedulesForMonth(schedules: ScheduleItem[], currentDate: Dayjs) {
  const monthStart = currentDate.startOf('month');
  const nextMonthStart = currentDate.add(1, 'month').startOf('month');

  return schedules.filter((item) => {
    const startDate = dayjs(item.schdSttDate, 'YYYY-MM-DD');
    const endDate = dayjs(item.schdEndDate, 'YYYY-MM-DD');

    if (!startDate.isValid() || !endDate.isValid()) return false;
    if (endDate.isBefore(startDate, 'day')) return false;

    return startDate.isBefore(nextMonthStart, 'day') && (endDate.isAfter(monthStart, 'day') || endDate.isSame(monthStart, 'day'));
  });
}

function buildSchedulesByDate(schedules: ScheduleItem[]) {
  const map = new Map<string, ScheduleItem[]>();

  schedules.forEach((item) => {
    const startDate = dayjs(item.schdSttDate, 'YYYY-MM-DD');
    const endDate = dayjs(item.schdEndDate, 'YYYY-MM-DD');

    if (!startDate.isValid() || !endDate.isValid()) return;
    if (endDate.isBefore(startDate, 'day')) return;

    let cursor = startDate.startOf('day');
    const lastDate = endDate.startOf('day');

    while (cursor.isBefore(lastDate, 'day') || cursor.isSame(lastDate, 'day')) {
      const key = cursor.format('YYYY-MM-DD');
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
      cursor = cursor.add(1, 'day');
    }
  });

  return map;
}

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, '0');
  const minute = index % 2 === 0 ? '00' : '30';
  const value = `${hour}:${minute}`;

  return {
    label: value,
    value,
  };
});

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [layerPos, setLayerPos] = useState<{ top: number; left: number } | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schdTtlNm, setSchdTtlNm] = useState('');
  const [schdPlcNm, setSchdPlcNm] = useState('');
  const [schdCn, setSchdCn] = useState('');
  const [schdSttDate, setSchdSttDate] = useState<Dayjs | null>(null);
  const [schdEndDate, setSchdEndDate] = useState<Dayjs | null>(null);
  const [schdSttTime, setSchdSttTime] = useState<string>('09:00');
  const [schdEndTime, setSchdEndTime] = useState<string>('10:00');
  const [allDay, setAllDay] = useState(false);

  const calendarWrapRef = useRef<HTMLDivElement | null>(null);

  const schedulesByDate = useMemo(() => {
    const monthSchedules = filterSchedulesForMonth(mockSchedules, currentDate);
    return buildSchedulesByDate(monthSchedules);
  }, [currentDate]);

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

  const openScheduleModal = (date?: Dayjs | null) => {
    const baseDate = date ?? selectedDate ?? dayjs();

    setSchdTtlNm('');
    setSchdPlcNm('');
    setSchdCn('');
    setSchdSttDate(baseDate);
    setSchdEndDate(baseDate);
    setSchdSttTime('09:00');
    setSchdEndTime('10:00');
    setAllDay(false);
    setScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setScheduleModalOpen(false);
  };

  const handleSaveSchedule = () => {
    console.log('저장', {
      schdTtlNm,
      schdPlcNm,
      schdCn,
      schdSttDate: schdSttDate?.format('YYYY-MM-DD'),
      schdEndDate: schdEndDate?.format('YYYY-MM-DD'),
      schdSttTime,
      schdEndTime,
      allDay: allDay ? 'Y' : 'N',
    });

    setScheduleModalOpen(false);
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
    const dateColor = getDateColor(date, currentDate);

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
        <div
          style={{
            textAlign: 'right',
            fontWeight: 600,
            marginBottom: 8,
            color: dateColor,
          }}
        >
          {date.date()}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {previewList.map((item) => (
            <div
              key={`${getDateKey(date)}-${item.schdNo}`}
              style={{
                fontSize: 12,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={item.schdTtlNm}
            >
              • {item.schdTtlNm}
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
            <div style={{ fontWeight: 700 }}>{selectedDate.format('YYYY-MM-DD (ddd)')}</div>

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
                <div key={`${selectedDate.format('YYYY-MM-DD')}-${item.schdNo}`}>
                  <div style={{ fontWeight: 500 }}>{item.schdTtlNm}</div>
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
              openScheduleModal(selectedDate);
            }}
          >
            일정추가
          </Button>
        </div>
      )}

      <Modal open={scheduleModalOpen} onCancel={closeScheduleModal} footer={null} destroyOnHidden width={960} title="일정추가">
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>일정 기본정보</div>

          <div style={{ border: '1px solid #e5e5e5' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5' }}>
              <div
                style={{
                  width: 140,
                  padding: '16px 12px',
                  background: '#fafafa',
                  fontWeight: 600,
                  borderRight: '1px solid #e5e5e5',
                }}
              >
                제목 <span style={{ color: '#ff4d4f' }}>*</span>
              </div>

              <div style={{ flex: 1, padding: 12 }}>
                <Input value={schdTtlNm} onChange={(e) => setSchdTtlNm(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5' }}>
              <div
                style={{
                  width: 140,
                  padding: '16px 12px',
                  background: '#fafafa',
                  fontWeight: 600,
                  borderRight: '1px solid #e5e5e5',
                }}
              >
                일시 <span style={{ color: '#ff4d4f' }}>*</span>
              </div>

              <div style={{ flex: 1, padding: 12 }}>
                <Space wrap>
                  <DatePicker value={schdSttDate} onChange={setSchdSttDate} locale={locale} />
                  <Select style={{ width: 100 }} value={schdSttTime} onChange={setSchdSttTime} options={timeOptions} disabled={allDay} />
                  <span>~</span>
                  <DatePicker value={schdEndDate} onChange={setSchdEndDate} locale={locale} />
                  <Select style={{ width: 100 }} value={schdEndTime} onChange={setSchdEndTime} options={timeOptions} disabled={allDay} />
                  <Checkbox checked={allDay} onChange={(e) => setAllDay(e.target.checked)}>
                    하루종일
                  </Checkbox>
                </Space>
              </div>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5' }}>
              <div
                style={{
                  width: 140,
                  padding: '16px 12px',
                  background: '#fafafa',
                  fontWeight: 600,
                  borderRight: '1px solid #e5e5e5',
                }}
              >
                장소 <span style={{ color: '#ff4d4f' }}>*</span>
              </div>

              <div style={{ flex: 1, padding: 12 }}>
                <Input value={schdPlcNm} onChange={(e) => setSchdPlcNm(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex' }}>
              <div
                style={{
                  width: 140,
                  padding: '16px 12px',
                  background: '#fafafa',
                  fontWeight: 600,
                  borderRight: '1px solid #e5e5e5',
                }}
              >
                내용
              </div>

              <div style={{ flex: 1, padding: 12 }}>
                <Input.TextArea value={schdCn} onChange={(e) => setSchdCn(e.target.value)} rows={6} placeholder="내용을 입력해주세요" />
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <Button onClick={closeScheduleModal}>닫기</Button>
            <Button type="primary" onClick={handleSaveSchedule}>
              저장
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarPage;
