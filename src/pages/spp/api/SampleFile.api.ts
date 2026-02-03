import { axiosService } from '@/config/common.axios';
import type { ApiResponse } from '@/type/common.type';
import { SampleFileUploadResultScheme, type SampleFileUploadResult } from '@/pages/spp/type/sample/SampleFileUpload.type';

export const SampleFileApi = () => {
  const uploadSampleFiles = async (files: File[], title: string, seq?: number | null) => {
    const form = new FormData();

    (files ?? []).forEach((f) => {
      form.append('files', f);
    });

    form.append('title', title ?? '');
    if (seq !== null && seq !== undefined) {
      form.append('seq', String(seq));
    }

    return axiosService().post<ApiResponse<SampleFileUploadResult>>(
      '/sample/file/upload',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
      SampleFileUploadResultScheme,
    );
  };

  return { uploadSampleFiles };
};
