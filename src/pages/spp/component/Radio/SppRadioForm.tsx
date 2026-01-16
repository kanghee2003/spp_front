import { Radio } from 'antd';
import { Control, Controller } from 'react-hook-form';
import { SppRadioProps } from './SppRadio';

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
      render={({ field, fieldState }) => (
        <Radio.Group {...props} id={field.name} name={field.name} value={field.value}>
          {options &&
            options.map((item) => {
              return (
                <Radio
                  key={item.value}
                  value={item.value}
                  onChange={(v) => {
                    field.onChange(v);
                    props.onChange?.(v);
                  }}
                  onBlur={(v) => {
                    field.onBlur();
                    props.onBlur?.(v);
                  }}
                >
                  {item.label}
                </Radio>
              );
            })}
        </Radio.Group>
      )}
    />
  );
};

export default SppRadioForm;
