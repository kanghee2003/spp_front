import axios, { type AxiosRequestConfig } from 'axios';
import { ZodError, type ZodTypeAny } from 'zod';
import qs from 'qs';
import { ApiResponseSchema } from '@/type/common.type';

export type ReqOptions = AxiosRequestConfig;

export const axiosService = () => {
  const parseOrThrow = <T>(path: string, data: unknown, schema?: ZodTypeAny): T => {
    if (!schema) return data as T;

    try {
      // schema는 "item" 스키마로 받고, 공통 응답(code/message/item)으로 감싸서 검증합니다.
      return ApiResponseSchema(schema).parse(data) as T;
    } catch (e) {
      if (e instanceof ZodError) {
        // react-query는 기본적으로 에러를 "보관"만 하고 화면에 던지지 않아서
        // 개발 중 바로 확인할 수 있게 콘솔에 상세 로그를 남깁니다.
        console.error(`[API 응답 스키마 검증 실패] ${path}`, '\nissues:', e.issues, '\nraw:', data);
      }
      throw e;
    }
  };

  const get = async <T>(path: string, options?: ReqOptions, schema?: ZodTypeAny): Promise<T> => {
    const { data } = await axios.get(path, {
      paramsSerializer: (p) => qs.stringify(p),
      ...options,
    });
    return parseOrThrow<T>(path, data, schema);
  };

  const post = async <T>(path: string, params?: unknown, options?: ReqOptions, schema?: ZodTypeAny): Promise<T> => {
    const { data } = await axios.post(path, params, {
      paramsSerializer: (p) => qs.stringify(p),
      ...options,
    });
    return parseOrThrow<T>(path, data, schema);
  };

  const put = async <T>(path: string, params?: unknown, options?: ReqOptions, schema?: ZodTypeAny): Promise<T> => {
    const { data } = await axios.put(path, params, {
      paramsSerializer: (p) => qs.stringify(p),
      ...options,
    });
    return parseOrThrow<T>(path, data, schema);
  };

  const patch = async <T>(path: string, params?: unknown, options?: ReqOptions, schema?: ZodTypeAny): Promise<T> => {
    const { data } = await axios.patch(path, params, {
      paramsSerializer: (p) => qs.stringify(p),
      ...options,
    });
    return parseOrThrow<T>(path, data, schema);
  };

  const del = async <T>(path: string, options?: ReqOptions, schema?: ZodTypeAny): Promise<T> => {
    const { data } = await axios.delete(path, {
      paramsSerializer: (p) => qs.stringify(p),
      ...options,
    });
    return parseOrThrow<T>(path, data, schema);
  };

  return { get, post, put, patch, del };
};
