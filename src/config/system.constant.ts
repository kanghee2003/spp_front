export const PORTAL_BUILD_TARGET = 'portal' as const;

export const SYSTEM_BASE_CONFIG = {
  spp: {
    systemKey: 'spp',
    rootPath: '/spp',
    label: '문서반출 시스템',
    useMockMenu: true,
  },
  nis: {
    systemKey: 'nis',
    rootPath: '/nis',
    label: '개인정보 관리시스템',
    useMockMenu: true,
  },
} as const;

export type SystemKey = keyof typeof SYSTEM_BASE_CONFIG;

export const SYSTEM_KEY_LIST = Object.keys(SYSTEM_BASE_CONFIG) as SystemKey[];

export const DEFAULT_SYSTEM_KEY: SystemKey = 'spp';

export type AppBuildTarget = typeof PORTAL_BUILD_TARGET | SystemKey;

export const isSystemKey = (value: string): value is SystemKey => {
  return value in SYSTEM_BASE_CONFIG;
};

export const isAppBuildTarget = (value: string): value is AppBuildTarget => {
  return value === PORTAL_BUILD_TARGET || isSystemKey(value);
};
