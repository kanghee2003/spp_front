import { Card, Input, InputNumber, Space, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SppButton from '../../component/Button/SppButton';
import SppFileUploaderForm from '../../component/FileUploader/SppFileUploaderForm';
import { SampleFileApi } from '../../api/SampleFile.api';
import { SampleFileUploadFormSchema, type SampleFileUploadFormValues, type SampleFileUploadResult } from '../../type/sample/SampleFileUpload.type';
import { joinFiles } from '@/utils/common.util';
import { downloadFile } from '@/utils/download.util';

const { Title, Text } = Typography;

const FileUploadSample = () => {
  const [uploaded, setUploaded] = useState<SampleFileUploadResult | null>(null);
  const { control, setValue, watch, handleSubmit, reset } = useForm<SampleFileUploadFormValues>({
    defaultValues: {
      title: '',
      seq: null,
      files1: null,
      files2: null,
    },
    resolver: zodResolver(SampleFileUploadFormSchema),
  });

  const title = watch('title');
  const seq = watch('seq');
  const files1 = watch('files1');
  const files2 = watch('files2');

  const mergedFiles = useMemo(() => joinFiles(files1, files2), [files1, files2]);
  const canSave = useMemo(() => (mergedFiles ?? []).length > 0, [mergedFiles]);
  const { uploadSampleFiles } = SampleFileApi();

  const handleDownload = async (fileId: string, originalName: string) => {
    await downloadFile(`/sample/file/download/${fileId}`, { filename: originalName });
  };

  return (
    <Card>
      <Space vertical={true} style={{ width: '100%' }} size={12}>
        <Title level={4} style={{ margin: 0 }}>
          File Upload Sample
        </Title>
        <Text type="secondary">파일 선택 후 저장 버튼 클릭 시 업로드</Text>

        <Space vertical={true} style={{ width: '100%' }} size={8}>
          <Space direction="vertical" style={{ width: '100%' }} size={4}>
            <Text>제목</Text>
            <Input
              placeholder="제목을 입력해 주세요."
              value={title}
              onChange={(e) => {
                setValue('title', e.target.value);
              }}
            />
          </Space>

          <Space direction="vertical" style={{ width: '100%' }} size={4}>
            <Text>순번</Text>
            <InputNumber
              style={{ width: '100%' }}
              placeholder="순번을 입력해 주세요."
              min={0}
              precision={0}
              value={seq ?? undefined}
              onChange={(v) => {
                setValue('seq', typeof v === 'number' ? v : null);
              }}
            />
          </Space>
        </Space>

        <Space direction="vertical" style={{ width: '100%' }} size={8}>
          <Space direction="vertical" style={{ width: '100%' }} size={4}>
            <Text>files #1</Text>
            <SppFileUploaderForm
              name="files1"
              control={control}
              onChange={() => {
                setUploaded(null);
              }}
            />
            {files1 ? (
              <Space vertical={true} style={{ width: '100%' }} size={2}>
                <Text>- {files1.name}</Text>
              </Space>
            ) : (
              <Text type="secondary">선택된 파일 없음</Text>
            )}
          </Space>

          <Space direction="vertical" style={{ width: '100%' }} size={4}>
            <Space size={6}>
              <Text>files #2</Text>
              <Text type="secondary">(선택)</Text>
            </Space>
            <SppFileUploaderForm
              name="files2"
              control={control}
              onChange={() => {
                setUploaded(null);
              }}
            />
            {files2 ? (
              <Space vertical={true} style={{ width: '100%' }} size={2}>
                <Text>- {files2.name}</Text>
              </Space>
            ) : (
              <Text type="secondary">선택</Text>
            )}
          </Space>
        </Space>

        <Space>
          <SppButton
            onClick={() => {
              reset({
                title: '',
                seq: null,
                files1: null,
                files2: null,
              });
              setUploaded(null);
            }}
          >
            취소
          </SppButton>
          <SppButton
            type="primary"
            disabled={!canSave}
            onClick={handleSubmit(async (values) => {
              const files = joinFiles(values.files1, values.files2) ?? [];
              if (files.length === 0) return;

              try {
                const res = await uploadSampleFiles(files, values.title, values.seq);
                setUploaded(res.item ?? null);
                message.success('업로드되었습니다.');
              } catch (e: any) {
                message.error(e?.message ?? '업로드 중 오류가 발생했습니다.');
              }
            })}
          >
            저장
          </SppButton>
        </Space>

        {uploaded && (
          <Card size="small" title="업로드 결과" style={{ marginTop: 8 }}>
            <Space vertical={true} style={{ width: '100%' }} size={4}>
              <Text>title: {uploaded.title ?? ''}</Text>
              <Text>seq: {uploaded.seq ?? 0}</Text>
              <Text>fileCount: {uploaded.fileCount ?? 0}</Text>
              <Space vertical={true} style={{ width: '100%' }} size={2}>
                {(uploaded.files ?? []).map((it, idx) => (
                  <Text key={`${it.storedName ?? ''}-${idx}`} onClick={() => handleDownload(it?.fileId ?? '', it.originalName ?? '')}>
                    - <a href="#">{it.originalName ?? ''}</a> ({it.size ?? 0} bytes) → {it.storedName ?? ''}
                  </Text>
                ))}
              </Space>
            </Space>
          </Card>
        )}
      </Space>
    </Card>
  );
};

export default FileUploadSample;
