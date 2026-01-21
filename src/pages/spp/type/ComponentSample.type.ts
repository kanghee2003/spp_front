import { z } from 'zod';
import { AutoCompleteOption, IudType } from '../../../type/common.type';

/**
 * SampleOut 런타임 검증 스키마
 * - 날짜(LocalDateTime)는 프론트에서는 string으로 받는 형태(ISO 문자열)
 */

/* ================================== SCHEME =========================================== */
export const ExcelUploadRowScheme = z
  .object({
    empNo: z.number().min(1, '사번은 필수입니다.'),
    empName: z.string().trim().min(1, '성명은 필수입니다.'),
    orgCd: z.string().trim().min(1, '조직코드는 필수입니다.'),
    orgNm: z.string().trim().min(1, '조직명은 필수입니다.'),
  })
  .strict();

export const ExcelUploadListScheme = z.array(ExcelUploadRowScheme);
/* ================================== TYPE =========================================== */
export interface ComponentSampleOptions extends AutoCompleteOption {
  seq: number;
}

export type ExcelUploadRow = z.infer<typeof ExcelUploadRowScheme>;
export type ExcelUploadList = z.infer<typeof ExcelUploadListScheme>;
