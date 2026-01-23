import { axiosService } from '@/config/common.axios';
import type { ApiResponse } from '@/type/common.type';
import { EditorImageUploadItemScheme, type EditorImageUploadItem } from '@/pages/spp/type/cm/EditorUpload.type';

export const EditorApi = () => {
  /**
   * 에디터 이미지 업로드
   * - multipart/form-data
   * - field name: file
   * - 응답: { code, message, item: { url, originalName, storedName, size } }
   */
  const uploadUri = import.meta.env.VITE_EDITOR_IMAGE_UPLOAD_URI;

  const uploadEditorImage = async (file: File) => {
    const form = new FormData();
    form.append('file', file);

    return axiosService().post<ApiResponse<EditorImageUploadItem>>(
      uploadUri,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
      EditorImageUploadItemScheme,
    );
  };

  return { uploadEditorImage };
};
