import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import SppMultiSelect, { type SppMultiSelectProps } from './SppMultiSelect';

type Primitive = string | number;

export type SppMultiSelectFormProps<V extends Primitive = any> = SppMultiSelectProps<V> & {
  name: string;
  control: Control<any>;
};

const SppMultiSelectForm = <V extends Primitive = any>({ name, control, ...props }: SppMultiSelectFormProps<V>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SppMultiSelect<V>
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

export default SppMultiSelectForm;
