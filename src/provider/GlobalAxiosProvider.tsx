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

      headers.set(
        'Authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9maWxlVXJsIjoiaHR0cHM6Ly9zd2luZ2Rldi5zaGluaGFuLmNvbS9la3AvbmFtZUNhcmRVUkwvMDFLMFhYWFhYWFhYWFhYWCIsInJvbGVzIjpbeyJyb2xlSWQiOiJSMjczNDEzNzcwMTgzMDAyOSIsInJvbGVOYW1lIjoic3RhbGst7Jew64-ZIO2FjOyKpO2KuDQifSx7InJvbGVJZCI6IlIxMDAwMDAwMDAwMDAwMDAxIiwicm9sZU5hbWUiOiJVU0VSIn1dLCJkZXBhcnRtZW50cyI6W3siZGVwYXJ0bWVudElkIjoiRDYzMzE3MDg2MCIsImRlcGFydG1lbnRObyI6IklNMDgiLCJkZXBhcnRtZW50TmFtZSI6IkRT6rCc67Cc7YyAIiwiZGVwYXJ0bWVudFBhdGgiOiJDMzAwMjIwNjE5L0Q4MTI1Mzg1NDAvRDEyNDIwODU3Ny9ENjQzNzA1NTAyL0Q2MzMxNzA4NjAiLCJkZXBhcnRtZW50TmFtZVBhdGgiOiLsi6DtlZzsnYDtlokv67O467aA67aA7IScL1RlY2jqt7jro7kvVGVjaOq4sO2ajeu2gC9EU-qwnOuwnO2MgCIsImJhc2VEZXBhcnRtZW50WW4iOiJZIn1dLCJvdGhlcldvcmtlcnMiOlt7ImNvbXBhbnlDb2RlIjoiU0giLCJwb3NpdGlvbk5hbWUiOiJT7ISg7J6EIiwiZW1wbG95ZWVOYW1lIjoi7ZmN6ri464-ZIiwiZW1wbG95ZWVObyI6IjIyMTIxOTAzIn1dLCJwZXJzb25hbFBob25lIjoiMDEwLTAwMDAtNTI2NyIsImNvbXBhbnlOYW1lIjoi7Iug7ZWc7J2A7ZaJIiwibWVtbyI6IiIsImVtcGxveWVlTm8iOiIyMzExMTAwOCIsInBvc2l0aW9uTmFtZSI6IiIsIndvcmtMb2NhdGlvbiI6IuyEnOyauO2KueuzhOyLnCDspJHqtawg64Ko64yA66y466GcMTDquLggMjkg67Cx64WE6rSAIDTsuLUiLCJ1bml0VHlwZSI6IkVNUExPWUVFIiwid2ViRW1haWwiOiIqKioqKipAc2hpbmhhbi5jb20iLCJjb21wYW55Tm8iOiJTSCIsImNvbXBhbnlFbWFpbCI6InNoMjMxMTEwMDhAc3dpbmdkZXYuc2hpbmhhbi5jb20iLCJjb21wYW55UGhvbmUiOiI1LTAwMDAiLCJwcm9maWxlSW1hZ2VVcmwiOiIiLCJwYXJlbnRHd0NtcENkIjoiIiwiZGVwYXJ0bWVudE5hbWUiOiIiLCJlbXBsb3llZU5hbWUiOiLquYDrr7ztnawiLCJjaGFyZ2VXb3JrIjoi66y47ISc67CY7Lac7Iuc7Iqk7YWcXG5IU0JDIDnsuLUgLyDsgrzshLHrs7jqtIAgMuy4tSIsImlubmVyTGluZVBob25lIjoiNS0wMDAwIiwicGFyZW50Q29tcGFueUNvZGUiOiIiLCJhYnNlbnRlZWlzbUluZm8iOiIiLCJmYXhOdW1iZXIiOiIiLCJzdWIiOiIyMzExMTAwOCIsImlhdCI6MTc2OTY2NjIzMywiZXhwIjoxNzY5NjY5ODMzfQ.RXJFEeUKzLHNRSJQGhKXPmxhrmYsf0oEGAXO-6g6JZo',
      );

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
