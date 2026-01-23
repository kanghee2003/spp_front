import React, { useMemo, useState } from 'react';
import JoditEditor from 'jodit-react';
import 'jodit/es2021/jodit.min.css';

const devUserId = import.meta.env.VITE_DEV_USER_ID;

// headers 기본값을 렌더마다 새 객체로 만들면(config deps가 바뀌어서) 에디터가 자주 재초기화될 수 있음
const EMPTY_HEADERS: Record<string, string> = {};

const getCookie = (name: string) => {
  const found = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return found ? found.split('=')[1] : undefined;
};

export type RichEditorProps = {
  /** 초기값만 사용 (typing 중에는 외부에서 value로 다시 주입하지 않음) */
  defaultHtml?: string;
  onChangeHtml?: (html: string) => void;

  uploadUrl?: string;
  withCredentials?: boolean;
  headers?: Record<string, string>;
  readOnly?: boolean;
  height?: number | string;
};

const RichEditor = ({
  defaultHtml = '',
  onChangeHtml,
  uploadUrl = import.meta.env.VITE_EDITOR_IMAGE_UPLOAD_URI,
  withCredentials = true,
  headers,
  readOnly = false,
  height = 520,
}: RichEditorProps) => {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const [initialHtml] = useState(() => defaultHtml);

  // 기본값({})을 destructuring에서 만들면 렌더마다 새 객체가 되어 config가 매번 바뀔 수 있음
  const reqHeaders = headers ?? EMPTY_HEADERS;

  const xsrf = getCookie('XSRF-TOKEN');
  const csrfHeaders: Record<string, string> = {
    ...(devUserId ? { 'X-User-Id': devUserId } : {}),
    ...(xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {}),
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
      uploader: {
        url: uploadUrl,
        method: 'POST',
        withCredentials,
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
    };
  }, [readOnly, height, uploadUrl, withCredentials, reqHeaders, xsrf]);

  return (
    <JoditEditor
      // 재주입을 막기 위해 initial만 넣음
      value={initialHtml}
      config={config}
      onChange={(html) => onChangeHtml?.(html)}
    />
  );
};

export default RichEditor;
