export const SYSTEM_KEY_LIST = ['spp', 'etc'] as const;

export type SystemKey = (typeof SYSTEM_KEY_LIST)[number];

export const DEFAULT_SYSTEM_KEY: SystemKey = 'spp';

export const SYSTEM_LABEL_MAP: Record<SystemKey, string> = {
  spp: '문서반출 시스템',
  etc: '개인정보 관리시스템',
};

export const SYSTEM_LINK_LIST = SYSTEM_KEY_LIST.map((systemKey) => ({
  systemKey,
  label: SYSTEM_LABEL_MAP[systemKey],
})) satisfies Array<{ systemKey: SystemKey; label: string }>;

export const PORTAL_BUILD_TARGET = 'portal' as const;

export type AppBuildTarget = SystemKey | typeof PORTAL_BUILD_TARGET;

export const APP_BUILD_TARGET_LIST = [PORTAL_BUILD_TARGET, ...SYSTEM_KEY_LIST] as const;

export const isSystemKey = (value: string): value is SystemKey => {
  return SYSTEM_KEY_LIST.includes(value as SystemKey);
};

export const isAppBuildTarget = (value: string): value is AppBuildTarget => {
  return APP_BUILD_TARGET_LIST.includes(value as AppBuildTarget);
};
