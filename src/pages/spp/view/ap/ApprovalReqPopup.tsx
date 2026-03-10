import { Suspense, useEffect, useRef, useState } from 'react';
import { Button, Descriptions, Form, Spin, message } from 'antd';

import { ApprovalContentComponent } from '../../type/ap/Approval.type';
import SppModal from '../../component/Modal/SppModal';
import SppInputText from '../../component/Input/SppInputText';
import { generateUuidV4 } from '@/utils/common.util';

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
  bizData?: Record<string, any>;
}

const ApprovalReqPopup = ({ open, onClose, formCode, bizData }: ApprovalReqPopupProps) => {
  const [draftData, setDraftData] = useState<Record<string, any>>({});
  const [BodyComponent, setBodyComponent] = useState<ApprovalContentComponent | null>(null);
  const [loading, setLoading] = useState(false);
  const [snapshotHtml, setSnapshotHtml] = useState('');
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!open || !formCode) {
        setBodyComponent(null);
        setSnapshotHtml('');
        return;
      }

      try {
        setLoading(true);
        setDraftData({});
        setSnapshotHtml('');

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
    return html;
  };

  const handleMakeSnapshot = () => {
    try {
      const html = makeSnapshotHtml();

      if (!html) {
        message.warning('본문 snapshot html이 비어 있습니다.');
        return;
      }

      // console.log('contents snapshot html = ', html);
      // message.success('본문 Snapshot HTML을 생성했습니다.');
    } catch (error) {
      console.error(error);
      message.error('본문 Snapshot HTML 생성 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async () => {
    try {
      const snapshotHtml = makeSnapshotHtml();

      const payload = {
        formCode,
        ...bizData,
        ...draftData,
        snapshotHtml,
      };

      console.log('결재요청 payload = ', payload);

      // await axiosService().post('/api/approval/request', payload);

      message.success('결재요청이 완료되었습니다.');
      onClose();
    } catch (error) {
      console.error(error);
      message.error('결재요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <SppModal open={open} title="결재요청" onCancel={onClose} onOk={handleSubmit} width={900} destroyOnClose>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <Button onClick={handleMakeSnapshot}>본문 Snapshot 생성</Button>
      </div>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="UUID">{generateUuidV4()}</Descriptions.Item>
        <Descriptions.Item label="문서번호">{draftData?.docNo}</Descriptions.Item>
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
            <BodyComponent formId={formCode} bizData={bizData} onChangeDraft={setDraftData} />
          </div>
        ) : null}
      </Suspense>

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
