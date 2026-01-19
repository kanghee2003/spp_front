import { axiosService } from '@/config/common.axios';
import type { ApiResponse } from '@/type/common.type';
import {
  AutoCompleteOrgPage,
  AutoCompleteOrgPageScheme,
  AutoCompleteUserPage,
  AutoCompleteUserPageScheme,
} from '../../type/cm/AutoComplete.type';

export const AutoCompleteApi = () => {
  const getAutoCompleteUserList = async (q: string, cursor: number, size = 20): Promise<AutoCompleteUserPage> => {
    const response = await axiosService().get<ApiResponse<AutoCompleteUserPage>>(
      '/api/auto-complete/user',
      { params: { q, cursor, size } },
      AutoCompleteUserPageScheme,
    );
    return response.item;
  };

  const getAutoCompleteOrgList = async (q: string, cursor: number, size = 20): Promise<AutoCompleteOrgPage> => {
    const response = await axiosService().get<ApiResponse<AutoCompleteOrgPage>>(
      '/api/auto-complete/org',
      { params: { q, cursor, size } },
      AutoCompleteOrgPageScheme,
    );
    return response.item;
  };

  return { getAutoCompleteUserList, getAutoCompleteOrgList };
};
