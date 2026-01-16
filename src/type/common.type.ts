import { z } from 'zod';
import { DefaultOptionType } from 'antd/es/select';

/**
 * 공통 API 응답 스키마
 * - 백엔드 응답은 JSON이라 런타임에 타입이 보장되지 않으므로 zod로 검증합니다.
 * - (code, message, item) 형태를 가정합니다.
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => {
  // strict(): 정의되지 않은 필드가 섞여 들어오는 케이스도 빨리 잡기 위함
  return z
    .object({
      code: z.number(),
      message: z.string().nullable(),
      item: itemSchema,
    })
    .strict();
};

export interface ApiResponse<T> {
  item: T;
  message: string | null;
  code: number;
}

export interface ErrorResponse {
  message: string;
  code: number;
}

export enum ErrorCode {
  BUSINESS_ERROR = 400,
  AUTHORIZATION_ERROR = 401,
  INVALID_PARAMETER_ERROR = 452,
  INVALID_SESSION_ERROR = 453,
}

export enum IudType {
  I = 'I',
  U = 'U',
  D = 'D',
}

export interface CodeResponse {
  label: string;
  value: string;
}

export interface SessionUserInfo {
  userId: string;
  userName: string;
  admFlag: boolean;
}

export interface CommonCode {
  [key: string]: string[];
}

export interface CommonCodeMap {
  [key: string]: { [key: string]: string };
}

export interface AutoCompleteOption extends DefaultOptionType {}
