export { v4 as generateUuidV4 } from 'uuid';
export const toBool = (v?: string) => (v ?? '').toLowerCase() === 'true';
export const normalize = (url?: string) => (url ? url.replace(/\/$/, '') : '');

export const isValidIpv4 = (value: string) => {
  const s = value.trim();
  const m = s.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;

  for (let i = 1; i <= 4; i++) {
    const part = m[i];

    // 선행0 불허(정책): "0"은 OK, "00", "01"은 불허
    if (part.length > 1 && part.startsWith('0')) return false;

    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return false;
  }
  return true;
};
