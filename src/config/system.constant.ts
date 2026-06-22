export const PORTAL_BUILD_TARGET = 'portal' as const;

export const SYSTEM_KEY_LIST = ['spp', 'etc'] as const;

export type SystemKey = (typeof SYSTEM_KEY_LIST)[number];

export const DEFAULT_SYSTEM_KEY: SystemKey = 'spp';

export type AppBuildTarget = typeof PORTAL_BUILD_TARGET | SystemKey;

export const isSystemKey = (value: string): value is SystemKey => {
  return SYSTEM_KEY_LIST.includes(value as SystemKey);
};

export const isAppBuildTarget = (value: string): value is AppBuildTarget => {
  return value === PORTAL_BUILD_TARGET || isSystemKey(value);
};
