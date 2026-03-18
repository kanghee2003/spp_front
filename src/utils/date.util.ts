import dayjs, { type Dayjs } from 'dayjs';

/**
 * 오늘 이전 날짜 선택 불가
 */
export const disablePastDate = (current: Dayjs) => {
  if (!current) return false;
  return current.isBefore(dayjs().startOf('day'), 'day');
};

/**
 * 오늘 이후 날짜 선택 불가
 */
export const disableFutureDate = (current: Dayjs) => {
  if (!current) return false;
  return current.isAfter(dayjs().endOf('day'), 'day');
};

/**
 * 과거 시간 선택 불가 (DateTimePicker 용)
 */
export const disablePastDateTime = (current: Dayjs) => {
  if (!current) return false;
  return current.isBefore(dayjs());
};

/**
 * Dayjs → YYYY-MM-DD
 */
export const formatDate = (date?: Dayjs | null) => {
  if (!date) return null;
  return date.format('YYYY-MM-DD');
};

/**
 * Dayjs → HH:mm
 */
export const formatTime = (date?: Dayjs | null) => {
  if (!date) return null;
  return date.format('HH:mm');
};

/**
 * Dayjs → YYYY-MM
 */
export const formatYearMonth = (date?: Dayjs | null) => {
  if (!date) return null;
  return date.format('YYYY-MM');
};

/**
 * string → Dayjs
 */
export const toDayjs = (date?: string | null) => {
  if (!date) return null;
  return dayjs(date);
};

/**
 * YYYY-MM-DD + HH:mm → Dayjs
 */
export const mergeDateTime = (date?: string, time?: string) => {
  if (!date) return null;
  if (!time) return dayjs(date);

  return dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
};

/**
 * 두 날짜 동일 여부
 */
export const isSameDate = (a?: Dayjs | null, b?: Dayjs | null) => {
  if (!a || !b) return false;
  return a.isSame(b, 'day');
};
