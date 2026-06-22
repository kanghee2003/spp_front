import { DEFAULT_SYSTEM_KEY, SYSTEM_KEY_LIST, SystemKey } from './system.constant';

export const SYSTEM_CONFIG = {
  spp: {
    systemKey: 'spp',
    rootPath: '/spp',
    apiBaseUrl: import.meta.env.VITE_SPP_API_BASE_URL || import.meta.env.VITE_API_BASE_URL,
    label: '문서반출 시스템',
  },
  etc: {
    systemKey: 'etc',
    rootPath: '/etc',
    apiBaseUrl: import.meta.env.VITE_ETC_API_BASE_URL || import.meta.env.VITE_API_BASE_URL,
    label: '개인정보 관리시스템',
  },
} as const satisfies Record<
  SystemKey,
  {
    systemKey: SystemKey;
    rootPath: `/${SystemKey}`;
    apiBaseUrl: string;
    label: string;
  }
>;

export const getSystemConfig = (systemKey: SystemKey) => {
  return SYSTEM_CONFIG[systemKey];
};

export const getApiBaseUrlBySystemKey = (systemKey: SystemKey = DEFAULT_SYSTEM_KEY) => {
  return SYSTEM_CONFIG[systemKey].apiBaseUrl;
};

export const SYSTEM_LINK_LIST = SYSTEM_KEY_LIST.map((systemKey) => ({
  systemKey,
  label: SYSTEM_CONFIG[systemKey].label,
})) satisfies Array<{ systemKey: SystemKey; label: string }>;
