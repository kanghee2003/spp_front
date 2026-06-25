import axios, { AxiosError, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import qs from 'qs';
import { message } from 'antd';

import { ErrorCode, ErrorResponse } from '@/type/common.type';
import { useLoadingStore } from '@/store/loading.store';
import { useAuthStore } from '@/store/auth.store';
import { useMdiStore } from '@/store/mdi.store';
import { getApiBaseUrlBySystemKey } from '@/config/system.config';
import { DEFAULT_SYSTEM_KEY, SystemKey } from '@/config/system.constant';

type GlobalAxiosInterceptorState = {
  requestId?: number;
  responseId?: number;
};

const globalAxiosState = globalThis as typeof globalThis & {
  __GLOBAL_AXIOS_INTERCEPTORS__?: GlobalAxiosInterceptorState;
};

const getCookie = (name: string) => {
  const found = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return found ? found.split('=')[1] : undefined;
};

const getAccessToken = () => {
  const storeToken = useAuthStore.getState().token;

  if (storeToken) {
    return storeToken;
  }

  const persistedAuth = sessionStorage.getItem('auth-storage');

  if (!persistedAuth) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(persistedAuth);
    return parsed?.state?.token;
  } catch {
    return undefined;
  }
};

const setAxiosDefaults = (baseURL: string) => {
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = baseURL;

  axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
  axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

  axios.defaults.transitional = {
    clarifyTimeoutError: true,
    forcedJSONParsing: true,
    silentJSONParsing: true,
  };

  axios.defaults.paramsSerializer = (params) => {
    return qs.stringify(params, { arrayFormat: 'brackets' });
  };
};

export const setupGlobalAxios = (apiSystemKey: SystemKey = DEFAULT_SYSTEM_KEY) => {
  const baseURL = getApiBaseUrlBySystemKey(apiSystemKey);

  setAxiosDefaults(baseURL);

  const interceptorState = globalAxiosState.__GLOBAL_AXIOS_INTERCEPTORS__ ?? {};

  if (interceptorState.requestId !== undefined) {
    axios.interceptors.request.eject(interceptorState.requestId);
  }

  if (interceptorState.responseId !== undefined) {
    axios.interceptors.response.eject(interceptorState.responseId);
  }

  interceptorState.requestId = axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const showLoading = (config.headers as any)?.showLoading;

      if (showLoading === undefined || showLoading === true) {
        useLoadingStore.getState().add(config?.url ? config.url : '');
      }

      const headers = AxiosHeaders.from(config.headers);

      const xsrf = getCookie('XSRF-TOKEN');
      if (xsrf) {
        headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrf));
      }

      const token = getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const mdiState = useMdiStore.getState();
      const activeViewKey = mdiState.activeKey;
      const activeTabKey = mdiState.getViewActiveTab(activeViewKey);
      const menuId = activeTabKey ?? activeViewKey;

      if (menuId) {
        headers.set('CURRENT_MENU_ID', menuId);
      }

      const url = config.url ?? '';
      const isAbsoluteUrl = /^https?:\/\//i.test(url);

      if (!isAbsoluteUrl) {
        config.baseURL = baseURL;
      }

      config.headers = headers;

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    },
  );

  interceptorState.responseId = axios.interceptors.response.use(
    (res: AxiosResponse): Promise<AxiosResponse> => {
      res.config.url && useLoadingStore.getState().remove(res.config.url);

      return Promise.resolve({ ...res, data: res.data || {} });
    },
    (error: AxiosError<ErrorResponse>) => {
      if (error.config?.url) {
        useLoadingStore.getState().remove(error.config.url);
      }

      if (
        error?.response?.data?.code === ErrorCode.INVALID_PARAMETER_ERROR ||
        error?.response?.data?.code === ErrorCode.BUSINESS_ERROR ||
        error?.response?.data?.code === ErrorCode.BAD_REQUEST
      ) {
        message.error(error?.response?.data.message);
      }

      if (error?.response?.data?.code === ErrorCode.INVALID_SESSION_ERROR) {
        useAuthStore.getState().clearToken();

        if (window.location.pathname !== '/') {
          window.location.replace('/');
        }
      }

      return Promise.reject(error);
    },
  );
};
