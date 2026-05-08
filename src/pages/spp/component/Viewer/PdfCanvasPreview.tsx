// PdfCanvasPreview.tsx
import { Modal, Spin } from 'antd';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { useEffect, useRef, useState } from 'react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type PdfCanvasPreviewProps = {
  title: string;
  url: string;
  onClose: () => void;
};

const PdfCanvasPreview = ({ title, url, onClose }: PdfCanvasPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedUrlRef = useRef<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (renderedUrlRef.current === url) {
      return;
    }

    renderedUrlRef.current = url;

    let cancelled = false;

    const loadPdf = async () => {
      const container = containerRef.current;
      if (!container) return;

      container.innerHTML = '';
      setLoading(true);

      try {
        const res = await axios.get<ArrayBuffer>(url, {
          responseType: 'arraybuffer',
          withCredentials: true,
        });

        const pdf = await pdfjsLib.getDocument({
          data: res.data,
        }).promise;

        for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNo);
          const viewport = page.getViewport({ scale: 1.3 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.display = 'block';
          canvas.style.margin = '0 auto 16px';
          canvas.style.maxWidth = '100%';
          canvas.style.height = 'auto';

          container.appendChild(canvas);

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
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
        <div
          ref={containerRef}
          style={{
            height: '80vh',
            overflow: 'auto',
            background: '#f5f5f5',
            padding: 16,
          }}
        />
      </Spin>
    </Modal>
  );
};

export default PdfCanvasPreview;
