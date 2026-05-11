// PdfCanvasPreview.tsx
import { Button, InputNumber, Modal, Space, Spin, Typography } from 'antd';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { useCallback, useEffect, useRef, useState } from 'react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type PdfCanvasPreviewProps = {
  title: string;
  url: string;
  onClose: () => void;
};

const DEFAULT_SCALE = 1;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.1;

// 실제 canvas는 크게 렌더링하고, 확대/축소는 wrapper width만 변경
const RENDER_SCALE = 2;

// 썸네일 렌더링 배율
const THUMBNAIL_SCALE = 0.25;

const PdfCanvasPreview = ({ title, url, onClose }: PdfCanvasPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const renderedUrlRef = useRef<string>('');
  const pdfRef = useRef<any>(null);
  const blobUrlRef = useRef<string>('');
  const scaleRef = useRef(DEFAULT_SCALE);
  const currentPageRef = useRef(1);

  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInputValue, setPageInputValue] = useState<number | null>(1);

  const applyZoom = useCallback((targetScale: number) => {
    const container = containerRef.current;
    if (!container) return;

    const pages = Array.from(container.querySelectorAll<HTMLDivElement>('[data-page-no]'));

    pages.forEach((page) => {
      const baseWidth = Number(page.dataset.baseWidth || 0);

      if (baseWidth > 0) {
        page.style.width = `${baseWidth * targetScale}px`;
      }
    });
  }, []);

  const setZoom = useCallback(
    (targetScale: number) => {
      const nextScale = Math.min(Math.max(Number(targetScale.toFixed(2)), MIN_SCALE), MAX_SCALE);

      scaleRef.current = nextScale;
      setScale(nextScale);
      applyZoom(nextScale);
    },
    [applyZoom],
  );

  const applyActiveThumbnail = useCallback((pageNo: number) => {
    const thumbnailContainer = thumbnailRef.current;
    if (!thumbnailContainer) return;

    const items = Array.from(thumbnailContainer.querySelectorAll<HTMLDivElement>('[data-thumbnail-page-no]'));

    items.forEach((item) => {
      const isActive = Number(item.dataset.thumbnailPageNo || 1) === pageNo;

      item.style.background = isActive ? '#e6f4ff' : 'transparent';
      item.style.border = isActive ? '1px solid #1677ff' : '1px solid transparent';
    });
  }, []);

  const renderPdf = useCallback(async () => {
    const container = containerRef.current;
    const pdf = pdfRef.current;

    if (!container || !pdf) return;

    container.innerHTML = '';

    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
      const page = await pdf.getPage(pageNo);

      const baseViewport = page.getViewport({ scale: 1 });
      const renderViewport = page.getViewport({ scale: RENDER_SCALE });

      const pageWrapper = document.createElement('div');
      pageWrapper.dataset.pageNo = String(pageNo);
      pageWrapper.dataset.baseWidth = String(baseViewport.width);
      pageWrapper.style.margin = '0 auto 16px';
      pageWrapper.style.width = `${baseViewport.width * scaleRef.current}px`;

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) continue;

      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;
      canvas.style.display = 'block';
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.background = '#fff';
      canvas.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.12)';

      pageWrapper.appendChild(canvas);
      container.appendChild(pageWrapper);

      await page.render({
        canvasContext: context,
        viewport: renderViewport,
      }).promise;
    }
  }, []);

  const scrollToPage = useCallback((pageNo: number) => {
    const container = containerRef.current;
    if (!container) return;

    const target = container.querySelector<HTMLDivElement>(`[data-page-no="${pageNo}"]`);

    if (!target) return;

    container.scrollTo({
      top: target.offsetTop - 8,
      behavior: 'auto',
    });
  }, []);

  const renderThumbnails = useCallback(async () => {
    const thumbnailContainer = thumbnailRef.current;
    const pdf = pdfRef.current;

    if (!thumbnailContainer || !pdf) return;

    thumbnailContainer.innerHTML = '';

    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
      const page = await pdf.getPage(pageNo);
      const viewport = page.getViewport({ scale: THUMBNAIL_SCALE });

      const thumbnailItem = document.createElement('div');
      thumbnailItem.dataset.thumbnailPageNo = String(pageNo);
      thumbnailItem.style.padding = '6px';
      thumbnailItem.style.marginBottom = '8px';
      thumbnailItem.style.cursor = 'pointer';
      thumbnailItem.style.border = '1px solid transparent';
      thumbnailItem.style.borderRadius = '4px';
      thumbnailItem.style.background = 'transparent';

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.display = 'block';
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.background = '#fff';
      canvas.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.15)';

      const pageLabel = document.createElement('div');
      pageLabel.innerText = String(pageNo);
      pageLabel.style.marginTop = '4px';
      pageLabel.style.fontSize = '12px';
      pageLabel.style.color = '#666';
      pageLabel.style.textAlign = 'center';

      thumbnailItem.appendChild(canvas);
      thumbnailItem.appendChild(pageLabel);
      thumbnailContainer.appendChild(thumbnailItem);

      thumbnailItem.onclick = () => {
        currentPageRef.current = pageNo;
        setCurrentPage(pageNo);
        setPageInputValue(pageNo);
        applyActiveThumbnail(pageNo);
        scrollToPage(pageNo);
      };

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;
    }

    applyActiveThumbnail(1);
  }, [applyActiveThumbnail, scrollToPage]);

  const moveToPage = (value: number | null) => {
    if (!value || !pageCount) return;

    const nextPage = Math.min(Math.max(value, 1), pageCount);

    setPageInputValue(nextPage);
    scrollToPage(nextPage);
  };

  const handleZoomOut = () => {
    setZoom(scaleRef.current - SCALE_STEP);
  };

  const handleZoomIn = () => {
    setZoom(scaleRef.current + SCALE_STEP);
  };

  const handleResetZoom = () => {
    setZoom(DEFAULT_SCALE);
  };

  const handleFitWidth = () => {
    const container = containerRef.current;
    if (!container) return;

    const firstPage = container.querySelector<HTMLDivElement>('[data-page-no="1"]');
    if (!firstPage) return;

    const baseWidth = Number(firstPage.dataset.baseWidth || 0);
    if (!baseWidth) return;

    const containerWidth = container.clientWidth - 32;
    const nextScale = containerWidth / baseWidth;

    setZoom(nextScale);
  };

  const handleDownload = () => {
    if (!blobUrlRef.current) return;

    const a = document.createElement('a');

    a.href = blobUrlRef.current;
    a.download = title || 'preview.pdf';
    a.click();
  };

  const handlePrint = () => {
    if (!blobUrlRef.current) return;

    const iframe = document.createElement('iframe');

    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = blobUrlRef.current;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  };

  useEffect(() => {
    if (renderedUrlRef.current === url) {
      return;
    }

    renderedUrlRef.current = url;

    let cancelled = false;

    const loadPdf = async () => {
      const container = containerRef.current;
      const thumbnailContainer = thumbnailRef.current;

      if (!container || !thumbnailContainer) return;

      container.innerHTML = '';
      thumbnailContainer.innerHTML = '';

      setLoading(true);
      setCurrentPage(1);
      setPageInputValue(1);
      currentPageRef.current = 1;
      setPageCount(0);
      setScale(DEFAULT_SCALE);
      scaleRef.current = DEFAULT_SCALE;

      try {
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = '';
        }

        const res = await axios.get<ArrayBuffer>(url, {
          responseType: 'arraybuffer',
          withCredentials: true,
        });

        if (cancelled) return;

        const blob = new Blob([res.data], {
          type: 'application/pdf',
        });

        blobUrlRef.current = URL.createObjectURL(blob);

        const pdf = await pdfjsLib.getDocument({
          data: res.data,
        }).promise;

        if (cancelled) return;

        pdfRef.current = pdf;
        setPageCount(pdf.numPages);

        await renderPdf();

        if (cancelled) return;

        await renderThumbnails();
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
  }, [url, renderPdf, renderThumbnails]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const pages = Array.from(container.querySelectorAll<HTMLDivElement>('[data-page-no]'));

      if (!pages.length) return;

      const containerTop = container.scrollTop;
      let activePage = 1;

      for (const page of pages) {
        if (page.offsetTop - 40 <= containerTop) {
          activePage = Number(page.dataset.pageNo || 1);
        }
      }

      currentPageRef.current = activePage;
      setCurrentPage(activePage);
      setPageInputValue(activePage);
      applyActiveThumbnail(activePage);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [applyActiveThumbnail]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;

      event.preventDefault();

      const nextScale = event.deltaY < 0 ? scaleRef.current + SCALE_STEP : scaleRef.current - SCALE_STEP;

      setZoom(nextScale);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [setZoom]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

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
      <div
        style={{
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#f5f5f5',
        }}
      >
        <div
          style={{
            height: 48,
            padding: '8px 12px',
            borderBottom: '1px solid #e5e5e5',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <Space size={4}>
            <InputNumber
              size="small"
              min={1}
              max={pageCount || 1}
              value={pageInputValue}
              controls={false}
              onChange={setPageInputValue}
              onPressEnter={() => moveToPage(pageInputValue)}
              onBlur={() => moveToPage(pageInputValue)}
              style={{
                width: 48,
              }}
            />

            <Typography.Text type="secondary">/ {pageCount || 0}</Typography.Text>
          </Space>

          <Space size={6}>
            <Button size="small" onClick={handleZoomOut} disabled={scale <= MIN_SCALE}>
              -
            </Button>

            <Typography.Text style={{ width: 52, textAlign: 'center' }}>{Math.round(scale * 100)}%</Typography.Text>

            <Button size="small" onClick={handleZoomIn} disabled={scale >= MAX_SCALE}>
              +
            </Button>

            <Button size="small" onClick={handleResetZoom}>
              원본
            </Button>

            <Button size="small" onClick={handleFitWidth}>
              너비맞춤
            </Button>
          </Space>

          <Space size={6}>
            <Button size="small" onClick={handleDownload}>
              다운로드
            </Button>

            <Button size="small" onClick={handlePrint}>
              인쇄
            </Button>
          </Space>
        </div>

        <Spin spinning={loading}>
          <div
            style={{
              height: 'calc(80vh - 48px)',
              display: 'flex',
              overflow: 'hidden',
              background: '#f5f5f5',
            }}
          >
            <div
              ref={thumbnailRef}
              style={{
                width: 120,
                flex: '0 0 120px',
                overflowY: 'auto',
                background: '#fafafa',
                borderRight: '1px solid #e5e5e5',
                padding: 8,
              }}
            />

            <div
              ref={containerRef}
              style={{
                flex: 1,
                overflow: 'auto',
                background: '#f5f5f5',
                padding: 16,
              }}
            />
          </div>
        </Spin>
      </div>
    </Modal>
  );
};

export default PdfCanvasPreview;
