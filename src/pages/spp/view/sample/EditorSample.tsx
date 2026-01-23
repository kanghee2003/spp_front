import { Card, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import SppButton from '../../component/Button/SppButton';
import RichEditor from '../../component/Editor/RichEditor';
import RichEditorForm from '../../component/Editor/RichEditorForm';
import { useForm, useWatch } from 'react-hook-form';

const { Title, Text } = Typography;
type EditorSampleFomeType = {
  editor: string;
};
const EditorSample = () => {
  const [html, setHtml] = useState<string>('');
  const [savedHtml, setSavedHtml] = useState<string>('');
  const [editorKey, setEditorKey] = useState<number>(0);

  const {
    control: sampleControl,
    setValue,
    getValues,
  } = useForm<EditorSampleFomeType>({
    mode: 'onChange',
    defaultValues: { editor: '<p>초기값</p>' },
  });
  const canSave = useMemo(() => html.trim().length > 0, [html]);
  const watchForm = useWatch({ control: sampleControl, name: 'editor' });
  return (
    <Card>
      <Space vertical={true} style={{ width: '100%' }} size={12}>
        <Title level={4} style={{ margin: 0 }}>
          Editor Sample
        </Title>
        <Text type="secondary">표(Table) / 이미지 업로드 / HTML 저장</Text>

        {/*
          Jodit는 글자 입력마다 value를 다시 주입하면 포커스가 튈 수 있어서, initial(defaultHtml)만 주고
          필요할 때만 key를 변경해 리마운트(초기화/리로드)합니다.
        */}
        <RichEditor key={editorKey} defaultHtml={''} onChangeHtml={setHtml} />
        <Space>
          <SppButton
            onClick={() => {
              setHtml('');
              setSavedHtml('');
              setEditorKey((k) => k + 1);
            }}
          >
            취소
          </SppButton>
          <SppButton type="primary" disabled={!canSave} onClick={() => setSavedHtml(html)}>
            저장
          </SppButton>
        </Space>

        {savedHtml && (
          <Card size="small" title="저장된 HTML (미리보기)" style={{ marginTop: 8 }}>
            <div dangerouslySetInnerHTML={{ __html: savedHtml }} />
            {savedHtml}
          </Card>
        )}
      </Space>

      <Space vertical={true} style={{ width: '100%' }} size={12}>
        <Title level={4} style={{ margin: 0 }}>
          Editor Form Sample
        </Title>
        <Text type="secondary">표(Table) / 이미지 업로드 / HTML 저장</Text>

        <RichEditorForm name="editor" control={sampleControl} />

        {watchForm && (
          <Card size="small" title="저장된 HTML (미리보기)" style={{ marginTop: 8 }}>
            <div dangerouslySetInnerHTML={{ __html: watchForm }} />
            {watchForm}
          </Card>
        )}
      </Space>
    </Card>
  );
};

export default EditorSample;
