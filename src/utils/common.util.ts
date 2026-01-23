export const toBool = (v?: string) => (v ?? '').toLowerCase() === 'true';
export const normalize = (url?: string) => (url ? url.replace(/\/$/, '') : '');
