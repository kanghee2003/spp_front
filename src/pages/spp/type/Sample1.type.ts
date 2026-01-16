import { z } from 'zod';
import { IudType } from '../../../type/common.type';

/**
 * SampleOut 런타임 검증 스키마
 * - 날짜(LocalDateTime)는 프론트에서는 string으로 받는 형태(ISO 문자열)
 */

/* ================================== SCHEME =========================================== */
export const Sample1ListSearchScheme = z.object({
  searchText: z.string({ required_error: '검색어를 입력해 주세요.' }).trim().min(1, '검색어를 입력해 주세요.'),
});

export const Sample1Scheme = z.object({
  comGrpCdSeq: z.number().nullish(),
  cmGrpCd: z.string().nullish(),
  cmGrpNm: z.string().nullish(),
  cmGrpDesc: z.string().nullish(),
  useFlag: z.boolean().nullish(),
  ref01: z.string().nullish(),
  ref02: z.string().nullish(),
  ref03: z.string().nullish(),
  ref04: z.string().nullish(),
  ref05: z.string().nullish(),
  ref06: z.string().nullish(),
  ref07: z.string().nullish(),
  ref08: z.string().nullish(),
  ref09: z.string().nullish(),
  ref10: z.string().nullish(),
  ref11: z.string().nullish(),
  ref12: z.string().nullish(),
  ref13: z.string().nullish(),
  ref14: z.string().nullish(),
  ref15: z.string().nullish(),
  strDate: z.string().nullish(),
  iudType: z.nativeEnum(IudType).nullish(),
  uuid: z.string(),
});

export const Sample1ListScheme = z.array(Sample1Scheme);

export const Sample1SaveScheme = z.object({
  list: z.array(Sample1Scheme),
});

/* ================================== TYPE =========================================== */
export type Sample1ListSearchReq = z.infer<typeof Sample1ListSearchScheme>;

export type Sample1Res = z.infer<typeof Sample1Scheme>;
export type Sample1ListRes = z.infer<typeof Sample1ListScheme>;
export type Sample1SaveReq = z.infer<typeof Sample1SaveScheme>;
