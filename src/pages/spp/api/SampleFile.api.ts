import { axiosService } from '@/config/common.axios';
import type { ApiResponse } from '@/type/common.type';
import { SampleFileUploadItemScheme, type SampleFileUploadItem } from '@/pages/spp/type/sample/SampleFileUpload.type';

export const SampleFileApi = () => {
  /**
   * 샘플 파일 업로드
   * - multipart/form-data
   * - field name: file
   */
  const uploadSampleFile = async (file: File) => {
    const form = new FormData();
    form.append('file', file);

    return axiosService().post<ApiResponse<SampleFileUploadItem>>(
      '/api/sample/file/upload',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
      SampleFileUploadItemScheme,
    );
  };

  return { uploadSampleFile };
};