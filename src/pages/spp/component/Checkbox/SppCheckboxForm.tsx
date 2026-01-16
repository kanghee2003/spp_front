import { Control, Controller } from 'react-hook-form';
import SppCheckbox, { SppCheckboxProps } from './SppCheckbox';

export interface SppCheckboxFormProps extends SppCheckboxProps {
  name: string;
  control: Control<any>;
}

const SppCheckboxForm = ({ name, control, ...props }: SppCheckboxFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={true}
      render={({ field, fieldState }) => (
        <SppCheckbox
          {...props}
          title={props.title}
          id={field.name}
          name={field.name}
          checked={field.value}
          onChange={(v) => {
            field.onChange(v);
            props.onChange?.(v);
          }}
        />
      )}
    />
  );
};

export default SppCheckboxForm;
