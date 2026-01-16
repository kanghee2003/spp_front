import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Sample1Api } from '../api/Sample1.api';
import { Sample1ListRes } from '../type/Sample1.type';

/**
 * NOTE
 * - react-query 훅(useQuery/useMutation)은 React component/custom hook 최상단에서만 호출되어야 함
 * - 기존 service 형태는 유지하되, 호출부에서는 Sample1Service.useXXX(...) 형태로 사용
 */
export const Sample1Service = {
  useGroupList: (searchText: string) => {
    return useQuery<Sample1ListRes>({
      queryKey: ['SampleGetGroupList', searchText],
      queryFn: () => Sample1Api().getGroupList(searchText),
      enabled: false,
      select: (response: Sample1ListRes) => {
        return response;
      },
    });
  },

  useSave: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (param: Sample1ListRes) => Sample1Api().save(param),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['SampleGetGroupList'] });
      },
      onError: (err) => {
        console.error(err);
      },
    });
  },
};
