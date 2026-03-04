import React, { useMemo, useRef, useState } from 'react';
import JoditEditor from 'jodit-react';
import type { Jodit } from 'jodit/types';
import 'jodit/es2021/jodit.min.css';
import { useMenuStore } from '@/store/menu.store';

const devUserId = import.meta.env.VITE_DEV_USER_ID;

// headers 기본값을 렌더마다 새 객체로 만들면(config deps가 바뀌어서) 에디터가 자주 재초기화될 수 있음
const EMPTY_HEADERS: Record<string, string> = {};

const getCookie = (name: string) => {
  const found = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return found ? found.split('=')[1] : undefined;
};

/**
 * data:image 제거
 */
const stripDataImages = (html: string) => {
  if (!html) return html;
  return html.replace(/<img\b[^>]*\bsrc=["']data:image\/[^"']*["'][^>]*>/gi, '');
};

/**
 * Word 붙여넣기 HTML 정리
 * - 사용자 스타일(font-size, color, text-align 등)은 유지
 * - Word 전용 쓰레기 요소만 제거
 */
const cleanWordHtml = (html: string) => {
  if (!html) return html;

  return (
    html
      // Word 클래스 제거 (MsoNormal 등)
      .replace(/class="Mso[a-zA-Z0-9]+"/g, '')

      // mso-* 스타일 제거
      .replace(/mso-[^:]+:[^;"]+;?/gi, '')

      // Word 기본 폰트 제거 (Calibri 등)
      .replace(/font-family:[^;"]+;?/gi, '')

      // 빈 span 제거
      .replace(/<span>\s*<\/span>/g, '')

      .trim()
  );
};

const getUploadURI = (systemKey: string) => {
  return import.meta.env.VITE_EDITOR_IMAGE_UPLOAD_URI;
};

export type SppRichEditorProps = {
  /** 초기값만 사용 (typing 중에는 외부에서 value로 다시 주입하지 않음) */
  defaultHtml?: string;
  onChangeHtml?: (html: string) => void;

  uploadUrl?: string;
  withCredentials?: boolean;
  headers?: Record<string, string>;
  readOnly?: boolean;
  height?: number | string;
};

const SppRichEditor = ({
  defaultHtml = '',
  onChangeHtml,
  uploadUrl = getUploadURI(useMenuStore().systemKey),
  withCredentials = true,
  headers,
  readOnly = false,
  height = 520,
}: SppRichEditorProps) => {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const [initialHtml] = useState(() => defaultHtml);
  const editorRef = useRef<Jodit | null>(null);

  // 기본값({})을 destructuring에서 만들면 렌더마다 새 객체가 되어 config가 매번 바뀔 수 있음
  const reqHeaders = headers ?? EMPTY_HEADERS;

  const xsrf = getCookie('XSRF-TOKEN');

  const csrfHeaders = useMemo<Record<string, string>>(() => {
    return {
      ...(devUserId ? { 'X-User-Id': devUserId } : {}),
      ...(xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {}),
    };
  }, [xsrf]);

  /**
   * 붙여넣기 이미지 업로드 (클립보드 파일 → 서버 업로드 → URL 반환)
   */
  const uploadImageFile = async (file: File) => {
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(uploadUrl, {
      method: 'POST',
      body: form,
      credentials: withCredentials ? 'include' : 'same-origin',
      headers: {
        ...reqHeaders,
        ...csrfHeaders,
      },
    });

    const resp = await res.json();

    const url = resp?.item?.url as string | undefined; // 예: /uploads/editor/xxx.png
    const resolvedUrl = url && /^https?:\/\//i.test(url) ? url : url ? `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}` : '';

    return resolvedUrl;
  };

  const config = useMemo(() => {
    return {
      readonly: readOnly,
      height,
      buttons: [
        'bold',
        'italic',
        'underline',
        '|',
        'ul',
        'ol',
        '|',
        'brush',
        'fontsize',
        'paragraph',
        '|',
        'image',
        'table',
        '|',
        'link',
        '|',
        'undo',
        'redo',
        '|',
        'fullsize',
        'source',
      ],

      // 붙여넣기 자체는 허용, Word/HTML 붙여넣기 팝업만 끔
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      processPasteHTML: true,
      cleanHTML: {
        removeEmptyElements: true,
        fillEmptyParagraph: false,
      },

      uploader: {
        url: uploadUrl,
        method: 'POST',
        withCredentials,

        // base64 이미지 삽입 금지 (data:image 용량 증가 방지)
        insertImageAsBase64URI: false,

        headers: {
          ...reqHeaders,
          ...csrfHeaders,
        },
        filesVariableName: () => 'file',
        isSuccess: (resp: any) => resp?.code === 200 && !!resp?.item?.url,
        process: (resp: any) => {
          const url = resp?.item?.url as string | undefined; // 예: /uploads/editor/xxx.png

          const resolvedUrl = url && /^https?:\/\//i.test(url) ? url : url ? `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}` : '';

          return {
            files: resolvedUrl ? [resolvedUrl] : [],
            path: '',
            baseurl: '',
            error: resp?.message ?? '',
            msg: resp?.message ?? '',
          };
        },
        defaultHandlerSuccess: function (data: any) {
          const files: string[] = data?.files ?? [];
          if (!files.length) return;

          const j = (this as any)?.jodit;
          files.forEach((src) => j?.s?.insertImage?.(src));
        },
      },

      events: {
        // 붙여넣기 이미지(file)면: (기본 data:image 삽입을 막고) 업로드 후 URL 삽입
        paste: async (event: ClipboardEvent) => {
          try {
            const items = event.clipboardData?.items;
            if (!items || !items.length) return;

            const imgItem = Array.from(items).find((it) => it.kind === 'file' && it.type.startsWith('image/'));
            if (!imgItem) return;

            const file = imgItem.getAsFile();
            if (!file) return;

            // data:image로 들어가는 기본 paste 막기
            event.preventDefault();

            const resolvedUrl = await uploadImageFile(file);
            if (!resolvedUrl) return;

            editorRef.current?.s?.insertImage?.(resolvedUrl);
          } catch {
            // ignore
          }
        },
      },
    };
  }, [readOnly, height, uploadUrl, withCredentials, reqHeaders, csrfHeaders, API_BASE]);

  return (
    <JoditEditor
      ref={(instance: any) => {
        editorRef.current = instance?.editor ?? null;
      }}
      // 재주입을 막기 위해 initial만 넣음
      value={initialHtml}
      config={config}
      onChange={(html) => {
        let cleaned = stripDataImages(html);
        cleaned = cleanWordHtml(cleaned);

        onChangeHtml?.(cleaned);
      }}
    />
  );
};

export default SppRichEditor;
