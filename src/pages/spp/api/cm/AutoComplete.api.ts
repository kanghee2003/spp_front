import { axiosService } from '@/config/common.axios';
import type { ApiResponse } from '@/type/common.type';
import {
  AutoCompleteOrgPage,
  AutoCompleteOrgPageScheme,
  AutoCompleteSearchParams,
  AutoCompleteUserPage,
  AutoCompleteUserPageScheme,
} from '../../type/cm/AutoComplete.type';

export const AutoCompleteApi = () => {
  const getAutoCompleteUserList = async (params: AutoCompleteSearchParams): Promise<AutoCompleteUserPage> => {
    const response = await axiosService().get<ApiResponse<AutoCompleteUserPage>>(
      '/api/auto-complete/user',
      { params: { ...params } },
      AutoCompleteUserPageScheme,
    );
    return response.item;
  };

  const getAutoCompleteOrgList = async (params: AutoCompleteSearchParams): Promise<AutoCompleteOrgPage> => {
    const response = await axiosService().get<ApiResponse<AutoCompleteOrgPage>>('/api/auto-complete/org', { params: { ...params } }, AutoCompleteOrgPageScheme);
    return response.item;
  };

  return { getAutoCompleteUserList, getAutoCompleteOrgList };
};
