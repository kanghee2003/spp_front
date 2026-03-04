import { z } from 'zod';

export const makePageReqScheme = <S extends z.ZodRawShape>(searchScheme: z.ZodObject<S>) =>
  searchScheme
    .merge(
      z.object({
        page: z.number().int().min(1),
        pageSize: z.number().int().min(1),
      }),
    )
    .strict();

export const makePageResScheme = <T extends z.ZodTypeAny>(itemScheme: T) =>
  z
    .object({
      items: z.array(itemScheme),
      page: z.number().int(),
      pageSize: z.number().int(),
      totalCount: z.number().int(),
    })
    .strict();
