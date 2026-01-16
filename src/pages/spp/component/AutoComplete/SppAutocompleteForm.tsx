import { Control, Controller } from 'react-hook-form';
import SppAutoComplete, { SppAutocompleteProps } from './SppAutoComplete';

interface SppAutoCompleteFormProps extends SppAutocompleteProps {
  name: string;
  control?: Control<any>;
}

const SppAutoCompleteForm = ({ name, control, ...props }: SppAutoCompleteFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <SppAutoComplete
          {...props}
          value={field.value}
          options={props.options}
          onChange={(v) => {
            field.onChange(v);
          }}
        />
      )}
    />
  );
};

export default SppAutoCompleteForm;
