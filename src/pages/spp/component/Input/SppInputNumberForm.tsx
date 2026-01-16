import { Control, Controller } from 'react-hook-form';
import SppInputNumber, { SppInputNumberProps } from './SppInputNumber';

interface SppInputNumberFormProps extends SppInputNumberProps {
  name: string;
  control: Control<any>;
}

const SppInputNumberForm = ({ name, control, ...props }: SppInputNumberFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <SppInputNumber
          {...props}
          value={field.value ?? ''}
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

export default SppInputNumberForm;
