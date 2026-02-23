// src/pages/spp/component/Editor/JoditRichEditorForm.tsx
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import SppRichEditor, { RichEditorProps } from './SppRichEditor';

export interface RichEditorFormProps extends Omit<RichEditorProps, 'defaultHtml' | 'onChangeHtml'> {
  name: string;
  control: Control<any>;
  defaultValue?: string;
}

const SppRichEditorForm = ({ name, control, defaultValue = '', ...props }: RichEditorFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => <SppRichEditor {...props} defaultHtml={field.value ?? ''} onChangeHtml={(html: string) => field.onChange(html)} />}
    />
  );
};

export default SppRichEditorForm;
