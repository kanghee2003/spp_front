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
