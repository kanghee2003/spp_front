import { z } from 'zod';

/**
 * Excel 업로드 전용 스키마 (3~5개 컬럼)
 * - Popup에서 rowScheme을 전달받아, zod 선언 순서대로 값만 검증합니다.
 */

export const ExcelUploadRowScheme = z
  .object({
    empNo: z.number().min(1, '사번은 필수입니다.'),
    empName: z.string().trim().min(1, '성명은 필수입니다.'),
    orgCd: z.string().trim().min(1, '조직코드는 필수입니다.'),
    orgNm: z.string().trim().min(1, '조직명은 필수입니다.'),
  })
  .strict();

export const ExcelUploadListScheme = z.array(ExcelUploadRowScheme);

export type ExcelUploadRow = z.infer<typeof ExcelUploadRowScheme>;
export type ExcelUploadList = z.infer<typeof ExcelUploadListScheme>;
