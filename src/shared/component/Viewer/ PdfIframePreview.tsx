// PdfIframePreview.tsx
import { Modal, Spin } from 'antd';
import { useEffect, useState } from 'react';

type PdfIframePreviewProps = {
  title: string;
  url: string;
  onClose: () => void;
};

const PdfIframePreview = ({ title, url, onClose }: PdfIframePreviewProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
  }, [url]);

  return (
    <Modal
      open
      title={title}
      width="80vw"
      footer={null}
      onCancel={onClose}
      destroyOnClose
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <Spin spinning={loading}>
        <iframe
          src={url}
          title={title}
          onLoad={() => setLoading(false)}
          style={{
            width: '100%',
            height: '80vh',
            border: 0,
            display: 'block',
            background: '#f5f5f5',
          }}
        />
      </Spin>
    </Modal>
  );
};

export default PdfIframePreview;
