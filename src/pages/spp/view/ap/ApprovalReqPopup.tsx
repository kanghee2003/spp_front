import { Button, Descriptions, Spin, message } from 'antd';
import { Suspense, useEffect, useRef, useState } from 'react';

import SppModal from '../../component/Modal/SppModal';
import { ApprovalContentComponent, ApprovalContentMode } from '../../type/ap/Approval.type';

type ModuleType = {
  default: ApprovalContentComponent;
};

const approvalModules = import.meta.glob<ModuleType>('./contents/*.tsx');

const loadApprovalBody = async (formCode: string) => {
  const componentName = `${formCode}`;
  const targetPath = `./contents/${componentName}.tsx`;

  const importer = approvalModules[targetPath];

  if (!importer) {
    const fallback = approvalModules['./contents/AP0001Default.tsx'];
    if (!fallback) {
      throw new Error(`결재 본문 화면을 찾을 수 없습니다. formCode=${formCode}`);
    }
    return fallback();
  }

  return importer();
};

export interface ApprovalReqPopupProps {
  open: boolean;
  onClose: () => void;
  formCode: string;
  docNo?: string;
}

const ApprovalReqPopup = ({ open, onClose, formCode, docNo }: ApprovalReqPopupProps) => {
  const [BodyComponent, setBodyComponent] = useState<ApprovalContentComponent | null>(null);
  const [loading, setLoading] = useState(false);
  const [snapshotHtml, setSnapshotHtml] = useState('');
  const [mode, setMode] = useState<ApprovalContentMode>('view');
  const [saveLoading, setSaveLoading] = useState(false);
  const [editable, setEditable] = useState(false);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const submitRef = useRef<(() => Promise<boolean>) | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!open || !formCode) {
        setBodyComponent(null);
        submitRef.current = null;
        setEditable(false);
        return;
      }

      try {
        setLoading(true);
        setMode('view');
        setEditable(false);
        setSnapshotHtml('');
        submitRef.current = null;

        const module = await loadApprovalBody(formCode);

        if (!mounted) return;
        setBodyComponent(() => module.default);
      } catch (error) {
        console.error(error);
        if (!mounted) return;
        setBodyComponent(null);
        message.error('결재 본문 화면 로딩 중 오류가 발생했습니다.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [open, formCode]);

  const makeSnapshotHtml = () => {
    const html = contentRef.current?.outerHTML ?? '';
    setSnapshotHtml(html);
  };

  const handleEdit = () => {
    setMode('edit');
  };

  const handleCancelEdit = () => {
    setMode('view');
  };

  const handleSubmitEdit = async () => {
    try {
      if (!submitRef.current) {
        message.warning('저장 가능한 본문 화면이 아닙니다.');
        return;
      }

      setSaveLoading(true);
      const saved = await submitRef.current();

      if (saved) {
        setMode('view');
        message.success('본문 저장이 완료되었습니다.');
      }
    } catch (error) {
      console.error(error);
      message.error('본문 저장 중 오류가 발생했습니다.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <SppModal open={open} title="결재요청" onCancel={onClose} width={900} destroyOnClose footer={null}>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        {editable ? (
          <Button onClick={handleEdit} disabled={mode === 'edit'}>
            수정
          </Button>
        ) : null}
        <Button onClick={makeSnapshotHtml}>본문 Snapshot 생성</Button>
      </div>

      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="문서번호">{docNo}</Descriptions.Item>
        <Descriptions.Item label="모드">{mode}</Descriptions.Item>
        <Descriptions.Item label="수정가능여부">{editable ? 'Y' : 'N'}</Descriptions.Item>
      </Descriptions>

      <Suspense
        fallback={
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Spin />
          </div>
        }
      >
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Spin />
          </div>
        ) : BodyComponent ? (
          <div ref={contentRef} className="approval-content-snapshot">
            <BodyComponent
              formId={formCode}
              docNo={docNo}
              mode={mode}
              onSubmitCallback={(submit) => {
                submitRef.current = submit;
              }}
              onEditableChange={setEditable}
            />
          </div>
        ) : null}
      </Suspense>

      {editable && mode === 'edit' ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Button onClick={handleCancelEdit}>취소</Button>
          <Button type="primary" onClick={handleSubmitEdit} loading={saveLoading}>
            저장
          </Button>
        </div>
      ) : null}

      {snapshotHtml ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>생성된 Snapshot HTML</div>
          <textarea value={snapshotHtml} readOnly style={{ width: '100%', minHeight: 220 }} />
        </div>
      ) : null}
    </SppModal>
  );
};

export default ApprovalReqPopup;
