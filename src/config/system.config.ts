import { DEFAULT_SYSTEM_KEY, SYSTEM_BASE_CONFIG, type SystemKey } from './system.constant';

export { DEFAULT_SYSTEM_KEY, PORTAL_BUILD_TARGET, SYSTEM_BASE_CONFIG, SYSTEM_KEY_LIST, isAppBuildTarget, isSystemKey } from './system.constant';

export type { AppBuildTarget, SystemKey } from './system.constant';

export const SYSTEM_CONFIG = {
  spp: {
    ...SYSTEM_BASE_CONFIG.spp,
    apiBaseUrl: import.meta.env.VITE_SPP_API_BASE_URL || import.meta.env.VITE_API_BASE_URL,
  },
  etc: {
    ...SYSTEM_BASE_CONFIG.etc,
    apiBaseUrl: import.meta.env.VITE_ETC_API_BASE_URL || import.meta.env.VITE_API_BASE_URL,
  },
} as const satisfies Record<
  SystemKey,
  {
    systemKey: SystemKey;
    rootPath: `/${SystemKey}`;
    apiBaseUrl: string;
    label: string;
    useMockMenu: boolean;
  }
>;

export const getSystemConfig = (systemKey: SystemKey) => {
  return SYSTEM_CONFIG[systemKey];
};

export const getApiBaseUrlBySystemKey = (systemKey: SystemKey = DEFAULT_SYSTEM_KEY) => {
  return SYSTEM_CONFIG[systemKey].apiBaseUrl;
};

export const isMockMenuSystem = (systemKey: SystemKey) => {
  return SYSTEM_CONFIG[systemKey].useMockMenu;
};
