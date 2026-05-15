// src/pages/spp/component/Editor/JoditRichEditorForm.tsx
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import SppRichEditor, { SppRichEditorProps } from './SppRichEditor';

export interface RichEditorFormProps extends Omit<SppRichEditorProps, 'defaultHtml'> {
  name: string;
  control: Control<any>;
  defaultValue?: string;
}

const SppRichEditorForm = ({ name, control, defaultValue = '', onChangeHtml, ...props }: RichEditorFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => (
        <SppRichEditor
          {...props}
          defaultHtml={field.value ?? ''}
          onChangeHtml={(html: string) => {
            field.onChange(html);
            onChangeHtml?.(html);
          }}
        />
      )}
    />
  );
};

export default SppRichEditorForm;
