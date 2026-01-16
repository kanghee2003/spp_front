import { SelectProps } from 'antd';
import { Control, Controller } from 'react-hook-form';
import SppSelect from './SppSelect';

interface SppSelectFormProps extends SelectProps {
  name: string;
  control: Control<any>;
}

const SppSelectForm = ({ name, defaultValue, control, ...props }: SppSelectFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <SppSelect
          {...props}
          value={field.value ?? undefined}
          onChange={(v) => {
            field.onChange(v);
            props.onChange?.(v);
          }}
          onBlur={(v) => {
            field.onBlur();
            props.onBlur?.(v);
          }}
        />
      )}
    />
  );
};

export default SppSelectForm;
