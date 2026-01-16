import { axiosService } from '@/config/common.axios';
import type { ApiResponse } from '@/type/common.type';
import { Sample1ListRes, Sample1ListScheme, Sample1SaveReq } from '../type/Sample1.type';

export const Sample1Api = () => {
  const getGroupList = async (searchText: string) => {
    const response = await axiosService().get<ApiResponse<Sample1ListRes>>('/api/sample/grp-list', { params: { searchText: searchText } }, Sample1ListScheme);
    return response.item;
  };

  const save = async (param: Sample1ListRes) => {
    const response = await axiosService().post('/api/sample/grp-save', param);
    return response;
  };

  return { getGroupList, save };
};
