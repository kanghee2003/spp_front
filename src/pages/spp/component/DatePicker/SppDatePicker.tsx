import { DatePicker, type DatePickerProps } from 'antd';
import locale from 'antd/es/date-picker/locale/ko_KR';
import type { Dayjs } from 'dayjs';

type AntdValue = DatePickerProps['value']; // Dayjs | Dayjs[] | null ...
type AntdOnChange = DatePickerProps['onChange']; // (Dayjs | Dayjs[] | null, string | string[] | null) => void

export type SppDatePickerProps = Omit<DatePickerProps, 'locale'> & {
  value?: AntdValue;
  onChange?: AntdOnChange;
};

const SppDatePicker = ({ value = null, onChange, ...rest }: SppDatePickerProps) => {
  return <DatePicker {...rest} locale={locale} value={value} onChange={onChange} />;
};

export default SppDatePicker;
