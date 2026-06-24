import React, { useCallback, useEffect, useState } from 'react';

import axios, { AxiosError, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import qs from 'qs';

import { message } from 'antd';
import { ErrorCode, ErrorResponse } from '@/type/common.type';
import { useLoadingStore } from '@/store/loading.store';
import { useAuthStore } from '@/store/auth.store';
import { getApiBaseUrlBySystemKey } from '@/config/system.config';
import { DEFAULT_SYSTEM_KEY, SystemKey } from '@/config/system.constant';
import { useMenuStore } from '@/store/menu.store';
import { useMdiStore } from '@/store/mdi.store';

interface GlobalAxiosInterceptorProps {
  children: React.ReactNode;
  apiSystemKey?: SystemKey;
}

const getCookie = (name: string) => {
  const found = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return found ? found.split('=')[1] : undefined;
};

const GlobalAxiosProvider = (props: GlobalAxiosInterceptorProps) => {
  const [isReadyAxios, setIsReadyAxios] = useState(false);
  const baseURL = getApiBaseUrlBySystemKey(props.apiSystemKey ?? DEFAULT_SYSTEM_KEY);

  const addLoading = useLoadingStore((state) => state.add);
  const removeLoading = useLoadingStore((state) => state.remove);

  const onRequestFulfilled = useCallback(
    (config: InternalAxiosRequestConfig) => {
      // loading
      const showLoading = (config.headers as any)?.showLoading;
      if (showLoading === undefined || showLoading === true) {
        addLoading(config?.url ? config.url : '');
      }

      const headers = AxiosHeaders.from(config.headers);

      const xsrf = getCookie('XSRF-TOKEN');
      if (xsrf) {
        headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrf));
      }

      const token = useAuthStore.getState().token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const mdiState = useMdiStore.getState();
      const activeViewKey = mdiState.activeKey;
      const activeTabKey = mdiState.getViewActiveTab(activeViewKey);
      const menuId = activeTabKey ?? activeViewKey;

      if (menuId) {
        headers.set('CURRENT_MENU_ID', 'menuId');
      }

      const url = config.url ?? '';
      const isAbsoluteUrl = /^https?:\/\//i.test(url);
      if (!isAbsoluteUrl) {
        config.baseURL = baseURL;
      }

      config.headers = headers;
      return config;
    },
    [addLoading, baseURL],
  );

  const onRequestRejected = useCallback((error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }, []);

  const onResponseFulfilled = useCallback(
    (res: AxiosResponse): Promise<AxiosResponse> => {
      res.config.url && removeLoading(res.config.url);

      return Promise.resolve({ ...res, data: res.data || {} });
    },
    [removeLoading],
  );

  const onResponseRejected = useCallback(
    (error: AxiosError<ErrorResponse>) => {
      if (error.config?.url) {
        removeLoading(error.config.url);
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
    [removeLoading],
  );

  useEffect(() => {
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

    const reqId = axios.interceptors.request.use(onRequestFulfilled, onRequestRejected);
    const resId = axios.interceptors.response.use(onResponseFulfilled, onResponseRejected);

    setIsReadyAxios(true);

    return () => {
      axios.interceptors.request.eject(reqId);
      axios.interceptors.response.eject(resId);
    };
  }, [baseURL, onRequestFulfilled, onRequestRejected, onResponseFulfilled, onResponseRejected]);

  if (!isReadyAxios) return null;

  return <>{props.children}</>;
};

export default GlobalAxiosProvider;
