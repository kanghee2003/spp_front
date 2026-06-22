import { DEFAULT_SYSTEM_KEY, isSystemKey, SYSTEM_KEY_LIST, SystemKey } from '@/config/system.constant';

type Loader = () => Promise<string>;

const modules = import.meta.glob<string>('/src/styles/systems/*_index.scss', {
  query: '?inline',
  import: 'default',
});

const systemMap: Record<string, Loader> = {};

for (const [path, loader] of Object.entries(modules)) {
  const m = path.match(/\/([^/]+)_index\.scss$/);
  if (!m) continue;
  systemMap[m[1]] = loader as Loader;
}

function ensureStyleTag() {
  let el = document.getElementById('system-style') as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = 'system-style';
    document.head.appendChild(el);
  }
  return el;
}

export async function setSystemCss(systemKey: string) {
  const loader = systemMap[systemKey] ?? systemMap['default'];
  if (!loader) return;

  const css = await loader();
  ensureStyleTag().textContent = css;
}

export const normalizePath = (pathname: string) => {
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
};

export const getSystemBasePath = (systemKey: SystemKey = DEFAULT_SYSTEM_KEY) => `/${systemKey}`;

export const getSystemRootPath = (systemKey: SystemKey = DEFAULT_SYSTEM_KEY) => `${getSystemBasePath(systemKey)}/`;

export const getSystemKeyFromPath = (pathname?: string): SystemKey => {
  try {
    const targetPath = pathname ?? window.location.pathname;
    const seg = targetPath.split('/').filter(Boolean)[0];

    return isSystemKey(seg) ? seg : DEFAULT_SYSTEM_KEY;
  } catch {
    return DEFAULT_SYSTEM_KEY;
  }
};

export const getSystemKeyFromRootPath = (pathname: string): SystemKey | undefined => {
  const normalized = normalizePath(pathname);

  return SYSTEM_KEY_LIST.find((systemKey) => normalized === getSystemBasePath(systemKey));
};

export const isSystemPath = (pathname: string) => {
  const normalized = normalizePath(pathname);

  return SYSTEM_KEY_LIST.some((systemKey) => {
    const systemPath = getSystemBasePath(systemKey);
    return normalized === systemPath || normalized.startsWith(`${systemPath}/`);
  });
};
