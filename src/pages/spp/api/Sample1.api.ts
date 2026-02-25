import { axiosService } from '@/config/common.axios';
import type { ApiResponse } from '@/type/common.type';
import { Sample1ListPageRes, Sample1ListPageScheme, Sample1ListRes, Sample1ListScheme, Sample1ListSearchPageReq, Sample1SaveReq } from '../type/Sample1.type';

export const Sample1Api = () => {
  const getGroupList = async (searchText: string) => {
    const response = await axiosService().get<ApiResponse<Sample1ListRes>>('/sample/grp-list', { params: { searchText: searchText } }, Sample1ListScheme);
    return response.item;
  };

  const getGroupListPage = async (param: Sample1ListSearchPageReq) => {
    const response = await axiosService().get<ApiResponse<Sample1ListPageRes>>('/sample/grp-list-page', { params: param }, Sample1ListPageScheme);
    return response.item;
  };

  const save = async (param: Sample1ListRes) => {
    const response = await axiosService().post('/sample/grp-save', param);
    return response;
  };

  return { getGroupList, getGroupListPage, save };
};
