import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Sample1Api } from '../api/Sample1.api';
import { Sample1ListPageRes, Sample1ListRes } from '../type/Sample1.type';

/**
 * NOTE
 * - react-query 훅(useQuery/useMutation)은 React component/custom hook 최상단에서만 호출되어야 함
 * - 기존 service 형태는 유지하되, 호출부에서는 Sample1Service.useXXX(...) 형태로 사용
 */
export const Sample1Service = () => {
  const queryClient = useQueryClient();
  const getGroupList = (searchText: string) => {
    return useQuery<Sample1ListRes>({
      queryKey: ['SampleGetGroupList', searchText],
      queryFn: () => Sample1Api().getGroupList(searchText),
      enabled: false,
      select: (response: Sample1ListRes) => {
        return response;
      },
    });
  };

  const getGroupListPage = (searchText: string, page: number, pageSize: number) => {
    return useQuery<Sample1ListPageRes>({
      queryKey: ['SampleGetGroupListPage', searchText, page, pageSize],
      queryFn: () => Sample1Api().getGroupListPage(searchText, page, pageSize),
      enabled: false,
      select: (response: Sample1ListPageRes) => {
        return response;
      },
    });
  };

  const save = () => {
    return useMutation({
      mutationFn: (param: Sample1ListRes) => Sample1Api().save(param),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['SampleGetGroupList'] });
        queryClient.invalidateQueries({ queryKey: ['SampleGetGroupListPage'] });
      },
      onError: (err) => {
        console.error(err);
      },
    });
  };

  return { getGroupList, getGroupListPage, save };
};
