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

type PageSize = {
  width: number;
  height: number;
};

const DEFAULT_SCALE = 1;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.1;

// 실제 canvas 렌더링 배율
// 값이 클수록 선명하지만 렌더링 비용이 증가한다.
const RENDER_SCALE = 1.5;

// 썸네일 렌더링 배율
const THUMBNAIL_SCALE = 0.18;

const PdfCanvasPreview = ({ title, url, onClose }: PdfCanvasPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const renderedUrlRef = useRef<string>('');
  const pdfRef = useRef<any>(null);
  const blobUrlRef = useRef<string>('');
  const scaleRef = useRef(DEFAULT_SCALE);
  const currentPageRef = useRef(1);

  const pageObserverRef = useRef<IntersectionObserver | null>(null);
  const thumbnailObserverRef = useRef<IntersectionObserver | null>(null);

  const pageSizeMapRef = useRef<Map<number, PageSize>>(new Map());
  const renderedPageSetRef = useRef<Set<number>>(new Set());
  const renderingPageSetRef = useRef<Set<number>>(new Set());
  const renderedThumbnailSetRef = useRef<Set<number>>(new Set());
  const renderingThumbnailSetRef = useRef<Set<number>>(new Set());

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
      const pageNo = Number(page.dataset.pageNo || 0);
      const pageSize = pageSizeMapRef.current.get(pageNo);

      if (!pageSize) return;

      page.style.width = `${pageSize.width * targetScale}px`;
      page.style.height = `${pageSize.height * targetScale}px`;
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

    const activeItem = thumbnailContainer.querySelector<HTMLDivElement>(`[data-thumbnail-page-no="${pageNo}"]`);

    if (!activeItem) return;

    const containerRect = thumbnailContainer.getBoundingClientRect();
    const activeRect = activeItem.getBoundingClientRect();

    const isAbove = activeRect.top < containerRect.top;
    const isBelow = activeRect.bottom > containerRect.bottom;

    if (isAbove || isBelow) {
      thumbnailContainer.scrollTo({
        top: thumbnailContainer.scrollTop + activeRect.top - containerRect.top - thumbnailContainer.clientHeight / 2 + activeRect.height / 2,
        behavior: 'auto',
      });
    }
  }, []);

  const renderPage = useCallback(async (pageNo: number) => {
    const container = containerRef.current;
    const pdf = pdfRef.current;

    if (!container || !pdf) return;
    if (renderedPageSetRef.current.has(pageNo)) return;
    if (renderingPageSetRef.current.has(pageNo)) return;

    const pageWrapper = container.querySelector<HTMLDivElement>(`[data-page-no="${pageNo}"]`);

    const canvasArea = pageWrapper?.querySelector<HTMLDivElement>('[data-page-canvas-area]');

    if (!pageWrapper || !canvasArea) return;

    renderingPageSetRef.current.add(pageNo);

    try {
      const page = await pdf.getPage(pageNo);
      const viewport = page.getViewport({ scale: RENDER_SCALE });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.display = 'block';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.background = '#fff';

      canvasArea.innerHTML = '';
      canvasArea.appendChild(canvas);

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      renderedPageSetRef.current.add(pageNo);
    } finally {
      renderingPageSetRef.current.delete(pageNo);
    }
  }, []);

  const renderThumbnail = useCallback(async (pageNo: number) => {
    const thumbnailContainer = thumbnailRef.current;
    const pdf = pdfRef.current;

    if (!thumbnailContainer || !pdf) return;
    if (renderedThumbnailSetRef.current.has(pageNo)) return;
    if (renderingThumbnailSetRef.current.has(pageNo)) return;

    const thumbnailItem = thumbnailContainer.querySelector<HTMLDivElement>(`[data-thumbnail-page-no="${pageNo}"]`);

    const canvasArea = thumbnailItem?.querySelector<HTMLDivElement>('[data-thumbnail-canvas-area]');

    if (!thumbnailItem || !canvasArea) return;

    renderingThumbnailSetRef.current.add(pageNo);

    try {
      const page = await pdf.getPage(pageNo);
      const viewport = page.getViewport({ scale: THUMBNAIL_SCALE });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.display = 'block';
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.background = '#fff';
      canvas.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.15)';

      canvasArea.innerHTML = '';
      canvasArea.appendChild(canvas);

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      renderedThumbnailSetRef.current.add(pageNo);
    } finally {
      renderingThumbnailSetRef.current.delete(pageNo);
    }
  }, []);

  const scrollToPage = useCallback(
    (pageNo: number) => {
      const container = containerRef.current;
      if (!container) return;

      const target = container.querySelector<HTMLDivElement>(`[data-page-no="${pageNo}"]`);

      if (!target) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const nextTop = container.scrollTop + targetRect.top - containerRect.top - 8;

      container.scrollTo({
        top: nextTop,
        behavior: 'auto',
      });

      renderPage(pageNo);
    },
    [renderPage],
  );

  const createPagePlaceholders = useCallback(async () => {
    const container = containerRef.current;
    const pdf = pdfRef.current;

    if (!container || !pdf) return;

    container.innerHTML = '';
    pageSizeMapRef.current.clear();
    renderedPageSetRef.current.clear();
    renderingPageSetRef.current.clear();

    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
      const page = await pdf.getPage(pageNo);
      const viewport = page.getViewport({ scale: 1 });

      pageSizeMapRef.current.set(pageNo, {
        width: viewport.width,
        height: viewport.height,
      });

      const pageWrapper = document.createElement('div');
      pageWrapper.dataset.pageNo = String(pageNo);
      pageWrapper.style.margin = '0 auto 16px';
      pageWrapper.style.width = `${viewport.width * scaleRef.current}px`;
      pageWrapper.style.height = `${viewport.height * scaleRef.current}px`;
      pageWrapper.style.background = '#fff';
      pageWrapper.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.12)';
      pageWrapper.style.position = 'relative';

      const canvasArea = document.createElement('div');
      canvasArea.dataset.pageCanvasArea = 'true';
      canvasArea.style.width = '100%';
      canvasArea.style.height = '100%';

      const loadingText = document.createElement('div');
      loadingText.innerText = 'Loading...';
      loadingText.style.position = 'absolute';
      loadingText.style.left = '50%';
      loadingText.style.top = '50%';
      loadingText.style.transform = 'translate(-50%, -50%)';
      loadingText.style.fontSize = '12px';
      loadingText.style.color = '#999';

      canvasArea.appendChild(loadingText);
      pageWrapper.appendChild(canvasArea);
      container.appendChild(pageWrapper);
    }
  }, []);

  const createThumbnailPlaceholders = useCallback(() => {
    const thumbnailContainer = thumbnailRef.current;
    const pdf = pdfRef.current;

    if (!thumbnailContainer || !pdf) return;

    thumbnailContainer.innerHTML = '';
    renderedThumbnailSetRef.current.clear();
    renderingThumbnailSetRef.current.clear();

    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
      const pageSize = pageSizeMapRef.current.get(pageNo);

      const thumbnailItem = document.createElement('div');
      thumbnailItem.dataset.thumbnailPageNo = String(pageNo);
      thumbnailItem.style.padding = '6px';
      thumbnailItem.style.marginBottom = '8px';
      thumbnailItem.style.cursor = 'pointer';
      thumbnailItem.style.border = '1px solid transparent';
      thumbnailItem.style.borderRadius = '4px';
      thumbnailItem.style.background = 'transparent';

      const canvasArea = document.createElement('div');
      canvasArea.dataset.thumbnailCanvasArea = 'true';
      canvasArea.style.width = '100%';
      canvasArea.style.background = '#fff';
      canvasArea.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.15)';

      if (pageSize) {
        canvasArea.style.aspectRatio = `${pageSize.width} / ${pageSize.height}`;
      } else {
        canvasArea.style.height = '120px';
      }

      const pageLabel = document.createElement('div');
      pageLabel.innerText = String(pageNo);
      pageLabel.style.marginTop = '4px';
      pageLabel.style.fontSize = '12px';
      pageLabel.style.color = '#666';
      pageLabel.style.textAlign = 'center';

      thumbnailItem.appendChild(canvasArea);
      thumbnailItem.appendChild(pageLabel);
      thumbnailContainer.appendChild(thumbnailItem);

      thumbnailItem.onclick = () => {
        currentPageRef.current = pageNo;
        setCurrentPage(pageNo);
        setPageInputValue(pageNo);
        applyActiveThumbnail(pageNo);
        scrollToPage(pageNo);
        renderThumbnail(pageNo);
      };
    }

    applyActiveThumbnail(1);
  }, [applyActiveThumbnail, scrollToPage, renderThumbnail]);

  const setupPageObserver = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (pageObserverRef.current) {
      pageObserverRef.current.disconnect();
    }

    pageObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target as HTMLDivElement;
          const pageNo = Number(target.dataset.pageNo || 0);

          if (pageNo > 0) {
            renderPage(pageNo);
          }
        });
      },
      {
        root: container,
        rootMargin: '600px 0px',
        threshold: 0.01,
      },
    );

    const pages = Array.from(container.querySelectorAll<HTMLDivElement>('[data-page-no]'));

    pages.forEach((page) => {
      pageObserverRef.current?.observe(page);
    });
  }, [renderPage]);

  const setupThumbnailObserver = useCallback(() => {
    const thumbnailContainer = thumbnailRef.current;
    if (!thumbnailContainer) return;

    if (thumbnailObserverRef.current) {
      thumbnailObserverRef.current.disconnect();
    }

    thumbnailObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target as HTMLDivElement;
          const pageNo = Number(target.dataset.thumbnailPageNo || 0);

          if (pageNo > 0) {
            renderThumbnail(pageNo);
          }
        });
      },
      {
        root: thumbnailContainer,
        rootMargin: '300px 0px',
        threshold: 0.01,
      },
    );

    const thumbnails = Array.from(thumbnailContainer.querySelectorAll<HTMLDivElement>('[data-thumbnail-page-no]'));

    thumbnails.forEach((thumbnail) => {
      thumbnailObserverRef.current?.observe(thumbnail);
    });
  }, [renderThumbnail]);

  const moveToPage = (value: number | null) => {
    if (!value || !pageCount) return;

    const nextPage = Math.min(Math.max(value, 1), pageCount);

    currentPageRef.current = nextPage;
    setCurrentPage(nextPage);
    setPageInputValue(nextPage);
    applyActiveThumbnail(nextPage);
    scrollToPage(nextPage);
    renderThumbnail(nextPage);
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

    const pageSize = pageSizeMapRef.current.get(1);
    if (!pageSize) return;

    const containerWidth = container.clientWidth - 32;
    const nextScale = containerWidth / pageSize.width;

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
      const iframeWindow = iframe.contentWindow;

      if (!iframeWindow) return;

      const removeIframe = () => {
        iframeWindow.removeEventListener('afterprint', removeIframe);

        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      };

      iframeWindow.addEventListener('afterprint', removeIframe);

      setTimeout(() => {
        iframeWindow.focus();
        iframeWindow.print();
      }, 300);
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

      if (pageObserverRef.current) {
        pageObserverRef.current.disconnect();
      }

      if (thumbnailObserverRef.current) {
        thumbnailObserverRef.current.disconnect();
      }

      setLoading(true);
      setCurrentPage(1);
      setPageInputValue(1);
      currentPageRef.current = 1;
      setPageCount(0);
      setScale(DEFAULT_SCALE);
      scaleRef.current = DEFAULT_SCALE;

      pageSizeMapRef.current.clear();
      renderedPageSetRef.current.clear();
      renderingPageSetRef.current.clear();
      renderedThumbnailSetRef.current.clear();
      renderingThumbnailSetRef.current.clear();

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

        await createPagePlaceholders();

        if (cancelled) return;

        createThumbnailPlaceholders();

        if (cancelled) return;

        setupPageObserver();
        setupThumbnailObserver();

        renderPage(1);
        renderThumbnail(1);
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
  }, [url, createPagePlaceholders, createThumbnailPlaceholders, setupPageObserver, setupThumbnailObserver, renderPage, renderThumbnail]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const pages = Array.from(container.querySelectorAll<HTMLDivElement>('[data-page-no]'));

      if (!pages.length) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenterY = containerRect.top + containerRect.height / 2;

      let activePage = 1;
      let minDistance = Number.MAX_SAFE_INTEGER;

      pages.forEach((page) => {
        const pageRect = page.getBoundingClientRect();
        const pageCenterY = pageRect.top + pageRect.height / 2;
        const distance = Math.abs(containerCenterY - pageCenterY);

        if (distance < minDistance) {
          minDistance = distance;
          activePage = Number(page.dataset.pageNo || 1);
        }
      });

      currentPageRef.current = activePage;
      setCurrentPage(activePage);
      setPageInputValue(activePage);
      applyActiveThumbnail(activePage);
      renderThumbnail(activePage);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [applyActiveThumbnail, renderThumbnail]);

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
      if (pageObserverRef.current) {
        pageObserverRef.current.disconnect();
      }

      if (thumbnailObserverRef.current) {
        thumbnailObserverRef.current.disconnect();
      }

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
