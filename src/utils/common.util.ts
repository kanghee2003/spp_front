export { v4 as generateUuidV4 } from 'uuid';
export const toBool = (v?: string) => (v ?? '').toLowerCase() === 'true';
export const normalize = (url?: string) => (url ? url.replace(/\/$/, '') : '');

export const joinFiles = (a: File | null, b: File | null) => {
  const list = [a, b].filter((v): v is File => !!v);
  if (list.length === 0) return null;

  // 중복 제거(이름+사이즈+lastModified 기준)
  const seen = new Set<string>();
  const uniq: File[] = [];
  for (const f of list) {
    const key = `${f.name}-${f.size}-${f.lastModified}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(f);
  }

  return uniq;
};
