import axios, { AxiosRequestConfig, AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';

export type DownloadAxiosOptions = {
  method?: 'GET' | 'POST';
  params?: Record<string, any>;
  data?: any;
  withCredentials?: boolean;
  filename?: string; // 강제 파일명 (서버 파일명 무시)
  headers?: Record<string, string>;
  axiosConfig?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params' | 'data' | 'responseType' | 'withCredentials' | 'headers'>;
};

type ApiErrorResponse = {
  code?: number;
  item?: unknown;
  message?: string;
};

export async function downloadFile(url: string, opts: DownloadAxiosOptions = {}) {
  const { method = 'GET', params, data, withCredentials = true, filename: forcedFilename, headers, axiosConfig } = opts;

  try {
    const res = await axios.request<Blob>({
      url,
      method,
      params,
      data,
      responseType: 'blob',
      withCredentials,
      headers,
      ...axiosConfig,
    });

    const contentType = getHeader(res.headers, 'content-type');

    // 서버가 200으로 JSON 에러를 내려주는 경우 방어
    if (contentType?.includes('application/json')) {
      const text = await res.data.text();
      const json = parseError<ApiErrorResponse>(text);
      const message = json?.message || '파일 다운로드 중 오류가 발생했습니다.';
      showErrorMessage(message);
      throw new Error(message);
    }

    const cd = getHeader(res.headers, 'content-disposition');
    const filename = forcedFilename ?? getFilenameFromContentDisposition(cd) ?? guessFilenameFromContentType(contentType);

    triggerBrowserDownload(res.data, filename);
  } catch (error: any) {
    const message = await extractDownloadErrorMessage(error);

    if (message) {
      showErrorMessage(message);
      throw new Error(message);
    }

    const fallbackMessage = '파일 다운로드 중 오류가 발생했습니다.';
    showErrorMessage(fallbackMessage);
    throw error;
  }
}

/** ----------------- helpers ----------------- */

function getHeader(headers: AxiosResponseHeaders | RawAxiosResponseHeaders | undefined, name: string): string | null {
  if (!headers) return null;
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
  const value = key ? (headers as any)[key] : null;
  return typeof value === 'string' ? value : null;
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
}

function getFilenameFromContentDisposition(cd: string | null): string | null {
  if (!cd) return null;

  // filename*=UTF-8''...
  const star = cd.match(/filename\*\s*=\s*([^;]+)/i);
  if (star?.[1]) {
    const v = star[1].trim().replace(/(^"|"$)/g, '');
    const utf8 = v.match(/UTF-8''(.+)/i);
    const raw = (utf8?.[1] ?? v).replace(/(^"|"$)/g, '');
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  // filename="..."
  const normal = cd.match(/filename\s*=\s*([^;]+)/i);
  if (normal?.[1]) return normal[1].trim().replace(/(^"|"$)/g, '');

  return null;
}

function guessFilenameFromContentType(ct: string | null): string {
  // fallback
  if (!ct) return 'download.xlsx';
  if (ct.includes('spreadsheetml')) return 'download.xlsx';
  if (ct.includes('ms-excel')) return 'download.xls';
  if (ct.includes('pdf')) return 'download.pdf';
  if (ct.includes('json')) return 'download.json';
  return 'download.bin';
}
async function extractDownloadErrorMessage(error: any): Promise<string | null> {
  const data = error?.response?.data;
  const contentType = getHeader(error?.response?.headers, 'content-type');

  if (data instanceof Blob) {
    const text = await data.text();

    if (contentType?.includes('application/json') || text.startsWith('{')) {
      const json = parseError<ApiErrorResponse>(text);
      return json?.message || text || null;
    }

    return text || null;
  }

  if (typeof data === 'string') {
    const json = parseError<ApiErrorResponse>(data);
    return json?.message || data;
  }

  if (typeof data === 'object' && data) {
    return data.message || null;
  }

  return error?.message || null;
}

function parseError<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function showErrorMessage(message: string) {
  // 네 공통 메시지 함수로 교체
  // 예: message.error(message);
  // 예: SppMessage.error(message);
  console.error(message);
}
