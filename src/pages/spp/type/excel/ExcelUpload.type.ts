import { z } from 'zod';

/**
 * Excel 업로드 전용 스키마 (3~5개 컬럼)
 * - 유연 모드: 헤더 순서가 달라도, 컬럼명이 일치하면 통과
 */

export const ExcelUploadRowScheme = z
  .object({
    empNo: z.string().trim().min(1, 'empNo는 필수입니다.'),
    empName: z.string().trim().min(1, 'empName은 필수입니다.'),
    orgCd: z.string().trim().min(1, 'orgCd는 필수입니다.'),
    orgNm: z.string().trim().min(1, 'orgNm은 필수입니다.'),
  })
  .strict();

export const ExcelUploadListScheme = z.array(ExcelUploadRowScheme);

export type ExcelUploadRow = z.infer<typeof ExcelUploadRowScheme>;
export type ExcelUploadList = z.infer<typeof ExcelUploadListScheme>;

export const ExcelUploadHeaderMap = {
  empNo: 'empNo',
  empName: 'empName',
  orgCd: 'orgCd',
  orgNm: 'orgNm',
} as const;

export type ExcelUploadHeaderKey = keyof typeof ExcelUploadHeaderMap;
