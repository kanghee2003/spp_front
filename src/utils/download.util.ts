// utils/downloadFileAxios.ts
import axios, { AxiosRequestConfig, AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';

export type DownloadAxiosOptions = {
  method?: 'GET' | 'POST';
  params?: Record<string, any>;
  data?: any; // POST body
  withCredentials?: boolean;
  filename?: string; // 강제 파일명 (서버 파일명 무시)
  headers?: Record<string, string>;
  axiosConfig?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params' | 'data' | 'responseType' | 'withCredentials' | 'headers'>;
};

export async function downloadFile(url: string, opts: DownloadAxiosOptions = {}) {
  const { method = 'GET', params, data, withCredentials = true, filename: forcedFilename, headers, axiosConfig } = opts;

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

  const cd = getHeader(res.headers, 'content-disposition');
  const filename = forcedFilename ?? getFilenameFromContentDisposition(cd) ?? guessFilenameFromContentType(getHeader(res.headers, 'content-type'));

  triggerBrowserDownload(res.data, filename);
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
