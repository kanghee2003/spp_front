import dayjs, { type Dayjs } from 'dayjs';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import SppDatePicker, { type SppDatePickerProps } from './SppDatePicker';

type AntdOnChange = NonNullable<SppDatePickerProps['onChange']>;

export type SppDatePickerFormProps<T extends FieldValues> = Omit<SppDatePickerProps, 'value' | 'onChange'> & {
  name: FieldPath<T>;
  control: Control<T>;
  valueFormat?: string;
  onChange?: AntdOnChange;
};

const SppDatePickerForm = <T extends FieldValues>({ name, control, valueFormat = 'YYYY-MM-DD', onChange, ...props }: SppDatePickerFormProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <SppDatePicker
          {...props}
          id={field.name}
          name={field.name}
          value={field.value ? dayjs(field.value as string, valueFormat) : null}
          onChange={(date, dateString) => {
            const d: Dayjs | null = Array.isArray(date) ? (date[0] ?? null) : (date ?? null);
            field.onChange(d ? d.format(valueFormat) : null);
            onChange?.(date, dateString);
          }}
          status={fieldState.error ? 'error' : props.status}
        />
      )}
    />
  );
};

export default SppDatePickerForm;
