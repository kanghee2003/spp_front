import { z } from 'zod';

/**
 * 샘플 파일 업로드 응답(item) 스키마
 * 백엔드: { code: 200, message: null, item: { originalName, storedName, size } }
 */
export const SampleFileUploadItemScheme = z.object({
  originalName: z.string().nullable().optional(),
  storedName: z.string().nullable().optional(),
  size: z.number().nullable().optional(),
});

export type SampleFileUploadItem = z.infer<typeof SampleFileUploadItemScheme>;
