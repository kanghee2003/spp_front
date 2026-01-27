import { Input, Space } from 'antd';
import { useMemo, useRef } from 'react';
import SppButton from '../Button/SppButton';

export interface SppFileUploaderProps {
  value?: File | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
}

const SppFileUploader = (props: SppFileUploaderProps) => {
  const { value, onChange, accept, disabled } = props;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fileName = useMemo(() => value?.name ?? '', [value]);
  const hasFile = useMemo(() => !!value, [value]);

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input readOnly placeholder="파일을 선택해 주세요." value={fileName} />
      <input
        type="file"
        style={{ display: 'none' }}
        ref={fileInputRef}
        accept={accept}
        disabled={disabled}
        onChange={(ev) => {
          const f = ev.target.files?.[0];
          if (!f) return;
          onChange?.(f);
        }}
      />
      <SppButton
        type="default"
        disabled={disabled}
        onClick={() => {
          fileInputRef.current?.click();
        }}
      >
        파일 선택
      </SppButton>
      <SppButton
        type="default"
        disabled={disabled || !hasFile}
        onClick={() => {
          onChange?.(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
      >
        제거
      </SppButton>
    </Space.Compact>
  );
};

export default SppFileUploader;
