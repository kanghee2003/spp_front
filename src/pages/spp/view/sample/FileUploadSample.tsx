import { Card, Space, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import SppButton from '../../component/Button/SppButton';
import SppFileUploaderForm from '../../component/FileUploader/SppFileUploaderForm';
import { SampleFileApi } from '../../api/SampleFile.api';
import type { SampleFileUploadItem } from '../../type/sample/SampleFileUpload.type';

const { Title, Text } = Typography;

interface FileUploadSampleFormValues {
  file: File | null;
}

const FileUploadSample = () => {
  const [uploaded, setUploaded] = useState<SampleFileUploadItem | null>(null);

  const { control, setValue, watch } = useForm<FileUploadSampleFormValues>({
    defaultValues: {
      file: null,
    },
  });

  const file = watch('file');

  const canSave = useMemo(() => !!file, [file]);

  const { uploadSampleFile } = SampleFileApi();

  return (
    <Card>
      <Space vertical={true} style={{ width: '100%' }} size={12}>
        <Title level={4} style={{ margin: 0 }}>
          File Upload Sample
        </Title>
        <Text type="secondary">파일 선택 후 저장 버튼 클릭 시 업로드</Text>

        <SppFileUploaderForm
          name="file"
          control={control}
          value={file}
          onChange={() => {
            setUploaded(null);
          }}
        />

        <Space>
          <SppButton
            onClick={() => {
              setValue('file', null);
              setUploaded(null);
            }}
          >
            취소
          </SppButton>
          <SppButton
            type="primary"
            disabled={!canSave}
            onClick={async () => {
              if (!file) return;

              try {
                const res = await uploadSampleFile(file);
                setUploaded(res.item ?? null);
                message.success('업로드되었습니다.');
              } catch (e: any) {
                message.error(e?.message ?? '업로드 중 오류가 발생했습니다.');
              }
            }}
          >
            저장
          </SppButton>
        </Space>

        {uploaded && (
          <Card size="small" title="업로드 결과" style={{ marginTop: 8 }}>
            <Space vertical={true} style={{ width: '100%' }} size={4}>
              <Text>originalName: {uploaded.originalName ?? ''}</Text>
              <Text>storedName: {uploaded.storedName ?? ''}</Text>
              <Text>size: {uploaded.size ?? 0}</Text>
            </Space>
          </Card>
        )}
      </Space>
    </Card>
  );
};

export default FileUploadSample;
