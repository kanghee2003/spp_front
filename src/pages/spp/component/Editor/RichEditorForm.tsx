// src/pages/spp/component/Editor/JoditRichEditorForm.tsx
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import RichEditor, { RichEditorProps } from './RichEditor';

export interface RichEditorFormProps extends Omit<RichEditorProps, 'defaultHtml' | 'onChangeHtml'> {
  name: string;
  control: Control<any>;
  defaultValue?: string;
}

const RichEditorForm = ({ name, control, defaultValue = '', ...props }: RichEditorFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => <RichEditor {...props} defaultHtml={field.value ?? ''} onChangeHtml={(html: string) => field.onChange(html)} />}
    />
  );
};

export default RichEditorForm;
