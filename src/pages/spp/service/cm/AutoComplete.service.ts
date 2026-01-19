import { useInfiniteQuery } from '@tanstack/react-query';
import { AutoCompleteApi } from '../../api/cm/AutoComplete.api';

export const AutoCompleteService = () => {
  const getAutoCompleteUserList = (inputValue: string, enabled = true) => {
    return useInfiniteQuery({
      queryKey: ['mock-autocomplete', 'user', inputValue],
      queryFn: ({ pageParam }) => AutoCompleteApi().getAutoCompleteUserList(inputValue, Number(pageParam ?? 1), 20),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined),
      enabled: enabled && inputValue.trim().length > 0,
      staleTime: 0,
    });
  };

  const getAutoCompleteOrgList = (inputValue: string, enabled = true) => {
    return useInfiniteQuery({
      queryKey: ['mock-autocomplete', 'org', inputValue],
      queryFn: ({ pageParam }) => AutoCompleteApi().getAutoCompleteOrgList(inputValue, Number(pageParam ?? 1), 20),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined),
      enabled: enabled && inputValue.trim().length > 0,
      staleTime: 0,
    });
  };

  return { getAutoCompleteUserList, getAutoCompleteOrgList };
};
