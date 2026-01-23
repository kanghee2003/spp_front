import { z } from 'zod';

/**
 * 에디터 이미지 업로드 응답(item) 스키마
 * 백엔드: { code: 200, message: null, item: { url, originalName, storedName, size } }
 */
export const EditorImageUploadItemScheme = z.object({
  url: z.string(),
  originalName: z.string().nullable().optional(),
  storedName: z.string().nullable().optional(),
  size: z.number().nullable().optional(),
});

export type EditorImageUploadItem = z.infer<typeof EditorImageUploadItemScheme>;
