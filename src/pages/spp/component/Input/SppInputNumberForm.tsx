import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import SppInputNumber, { type SppInputNumberProps } from './SppInputNumber';

export interface SppInputNumberFormProps extends SppInputNumberProps {
  name: string;
  control: Control<any>;
}

const SppInputNumberForm = ({ name, control, ...props }: SppInputNumberFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={props.defaultValue ?? null}
      render={({ field }) => (
        <SppInputNumber
          {...props}
          value={field.value ?? null}
          onChange={(v) => {
            field.onChange(v);
            props.onChange?.(v);
          }}
          onBlur={(e) => {
            field.onBlur();
            props.onBlur?.(e);
          }}
        />
      )}
    />
  );
};

export default SppInputNumberForm;
