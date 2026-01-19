import { z } from 'zod';

/* ================================== SCHEME =========================================== */
export const AutoCompleteUserItemScheme = z
  .object({
    value: z.string(),
    userId: z.string(),
    gradeCd: z.string(),
    gradeNm: z.string(),
    orgCd: z.string(),
    orgNm: z.string(),
    telNo: z.string(),
  })
  .strict();

export const AutoCompleteOrgItemScheme = z
  .object({
    value: z.string(),
    orgCd: z.string(),
    orgNm: z.string(),
  })
  .strict();

export const createAutoCompletePageScheme = <T extends z.ZodTypeAny>(itemScheme: T) => {
  return z
    .object({
      items: z.array(itemScheme),
      nextCursor: z.number().int().nullable(),
      hasMore: z.boolean(),
    })
    .strict();
};

export const AutoCompleteUserPageScheme = createAutoCompletePageScheme(AutoCompleteUserItemScheme);
export const AutoCompleteOrgPageScheme = createAutoCompletePageScheme(AutoCompleteOrgItemScheme);

/* ================================== TYPE =========================================== */
export type AutoCompleteUserItem = z.infer<typeof AutoCompleteUserItemScheme>;
export type AutoCompleteOrgItem = z.infer<typeof AutoCompleteOrgItemScheme>;
export type AutoCompleteUserPage = z.infer<typeof AutoCompleteUserPageScheme>;
export type AutoCompleteOrgPage = z.infer<typeof AutoCompleteOrgPageScheme>;

export enum AutoCompleteMode {
  EMP,
  ORG,
}
