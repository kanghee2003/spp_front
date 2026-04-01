import { forwardRef } from 'react';
import { Control, Controller } from 'react-hook-form';
import SppAutoComplete, { SppAutocompleteProps, SppCustomAutoCompleteRef } from './SppAutoComplete';

interface SppAutoCompleteFormProps extends SppAutocompleteProps {
  name: string;
  control?: Control<any>;
}

const SppAutoCompleteForm = forwardRef<SppCustomAutoCompleteRef, SppAutoCompleteFormProps>(({ name, control, ...props }, ref) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SppAutoComplete
          ref={ref}
          {...props}
          value={field.value}
          options={props.options}
          onChange={(v) => {
            field.onChange(v);
            props.onChange?.(v);
          }}
          onSelect={(value, option) => {
            props.onSelect?.(value, option);
          }}
        />
      )}
    />
  );
});

export default SppAutoCompleteForm;
