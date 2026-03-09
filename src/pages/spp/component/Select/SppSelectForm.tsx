import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import SppSelect, { type SppSelectProps } from './SppSelect';

type Primitive = string;

export type SppSelectFormProps<V extends Primitive = any> = SppSelectProps<V> & {
  name: string;
  control: Control<any>;
};

const SppSelectForm = <V extends Primitive = any>({ name, control, ...props }: SppSelectFormProps<V>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SppSelect<V>
          {...props}
          value={field.value ?? undefined}
          onChange={(v, option) => {
            field.onChange(v);
            props.onChange?.(v, option);
          }}
          onBlur={(e) => {
            field.onBlur();
            props.onBlur?.(e as any);
          }}
        />
      )}
    />
  );
};

export default SppSelectForm;
