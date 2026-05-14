// src/pages/spp/component/Editor/JoditRichEditorForm.tsx
import React, { useRef } from 'react';
import { Control, Controller } from 'react-hook-form';
import SppRichEditor, { SppRichEditorProps } from './SppRichEditor';

export interface RichEditorFormProps extends Omit<SppRichEditorProps, 'defaultHtml' | 'onBlurHtml'> {
  name: string;
  control: Control<any>;
  defaultValue?: string;
}

const SppRichEditorForm = ({ name, control, defaultValue = '', onChangeHtml, ...props }: RichEditorFormProps) => {
  const latestHtmlRef = useRef(defaultValue);

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
            latestHtmlRef.current = html;

            onChangeHtml?.(html);
          }}
          onBlurHtml={(html: string) => {
            const latestHtml = html || latestHtmlRef.current || '';

            latestHtmlRef.current = latestHtml;
            field.onChange(latestHtml);
            field.onBlur();
          }}
        />
      )}
    />
  );
};

export default SppRichEditorForm;
