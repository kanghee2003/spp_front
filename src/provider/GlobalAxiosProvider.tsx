import React, { useCallback, useEffect, useState } from 'react';

import axios, { AxiosError, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import qs from 'qs';

import { message } from 'antd';
import { ErrorCode, ErrorResponse } from '@/type/common.type';
import { useLoadingStore } from '@/store/loading.store';

interface GlobalAxiosInterceptorProps {
  children: React.ReactNode;
}

const baseURL = import.meta.env.VITE_API_BASE_URL;
const devUserId = import.meta.env.VITE_DEV_USER_ID;

const getCookie = (name: string) => {
  const found = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return found ? found.split('=')[1] : undefined;
};

const GlobalAxiosProvider = (props: GlobalAxiosInterceptorProps) => {
  const [isReadyAxios, setIsReadyAxios] = useState(false);

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

      if (devUserId) {
        headers.set('X-User-Id', devUserId);
      }

      const xsrf = getCookie('XSRF-TOKEN');
      if (xsrf) {
        headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrf));
      }

      config.headers = headers;
      return config;
    },
    [addLoading, devUserId],
  );

  const onRequestRejected = useCallback((error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }, []);

  const onResponseFulfilled = useCallback(
    (res: AxiosResponse): Promise<AxiosResponse> => {
      res.config.url && removeLoading(res.config.url);

      if (res.data?.code === ErrorCode.INVALID_PARAMETER_ERROR) {
        message.error(res.data.message);
      }
      if (res.data?.code === ErrorCode.BUSINESS_ERROR) {
        message.error(res.data.message);
      }
      if (res.data?.code === ErrorCode.INVALID_SESSION_ERROR) {
        location.replace('/');
      }

      return Promise.resolve({ ...res, data: res.data || {} });
    },
    [removeLoading],
  );

  const onResponseRejected = useCallback(
    (error: AxiosError<ErrorResponse>) => {
      if (error.config?.url) {
        removeLoading(error.config.url);
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
  }, [onRequestFulfilled, onRequestRejected, onResponseFulfilled, onResponseRejected]);

  if (!isReadyAxios) return null;

  return <>{props.children}</>;
};

export default GlobalAxiosProvider;
