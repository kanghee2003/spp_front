import { joinFiles } from '@/utils/common.util';
import { z } from 'zod';

/**
 * 샘플 파일 업로드 응답(item) 스키마
 * 백엔드: { code: 200, message: null, item: { title, seq, fileCount, files: [...] } }
 */
export const SampleFileUploadItemScheme = z
  .object({
    originalName: z.string().nullable().optional(),
    storedName: z.string().nullable().optional(),
    size: z.number().nullable().optional(),
  })
  .strict();

export const SampleFileUploadResultScheme = z
  .object({
    title: z.string().nullable().optional(),
    seq: z.number().int().nullable().optional(),
    fileCount: z.number().int().nullable().optional(),
    files: z.array(SampleFileUploadItemScheme).nullable().optional(),
  })
  .strict();

export const SampleFileUploadFormSchema = z
  .object({
    title: z.string().trim().min(1, 'title은 필수입니다.'),
    seq: z.number().int('정수만 입력하세요.').nullable(),
    files1: z.instanceof(File).nullable(),
    files2: z.instanceof(File).nullable(),
  })
  .superRefine((val, ctx) => {
    const merged = joinFiles(val.files1, val.files2);
    if ((merged ?? []).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['files1'],
        message: '파일을 1개 이상 선택해 주세요.',
      });
    }
  });
export type SampleFileUploadItem = z.infer<typeof SampleFileUploadItemScheme>;
export type SampleFileUploadResult = z.infer<typeof SampleFileUploadResultScheme>;

export type SampleFileUploadFormValues = z.infer<typeof SampleFileUploadFormSchema>;
