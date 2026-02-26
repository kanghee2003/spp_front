import { Control, Controller } from 'react-hook-form';
import SppRadio, { SppRadioProps } from './SppRadio';

export interface SppRadioFormProps extends SppRadioProps {
  name: string;
  control: Control<any>;
  defaultValue?: any;
}

const SppRadioForm = ({ name, control, defaultValue, options, ...props }: SppRadioFormProps) => {
  return (
    <Controller
      name={name}
      defaultValue={defaultValue}
      control={control}
      render={({ field }) => (
        <SppRadio
          {...props}
          id={props.id ?? field.name}
          name={field.name}
          options={options}
          value={field.value}
          onChange={(e) => {
            const nextValue = (e as any)?.target?.value;
            field.onChange(nextValue);
            props.onChange?.(e as any);
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

export default SppRadioForm;
