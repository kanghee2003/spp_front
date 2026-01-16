import { Control, Controller } from 'react-hook-form';
import SppInputText, { SppInputTextProps } from './SppInputText';

interface SppInputTextFormProps extends SppInputTextProps {
  name: string;
  control: Control<any>;
}

const SppInputTextForm = ({ name, control, ...props }: SppInputTextFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <SppInputText
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

export default SppInputTextForm;
