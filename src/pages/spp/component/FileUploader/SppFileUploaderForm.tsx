import { Control, Controller } from 'react-hook-form';
import SppFileUploader, { type SppFileUploaderProps } from './SppFileUploader';

interface SppFileUploaderFormProps extends SppFileUploaderProps {
  name: string;
  control: Control<any>;
}

const SppFileUploaderForm = ({ name, control, ...props }: SppFileUploaderFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SppFileUploader
          {...props}
          value={field.value ?? null}
          onChange={(v) => {
            field.onChange(v);
            props.onChange?.(v);
          }}
        />
      )}
    />
  );
};

export default SppFileUploaderForm;
