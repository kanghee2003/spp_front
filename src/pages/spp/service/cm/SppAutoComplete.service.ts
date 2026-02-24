import { useInfiniteQuery } from '@tanstack/react-query';
import { SppAutoCompleteApi } from '../../api/cm/SppAutoComplete.api';
import type { AutoCompleteQueryArgs } from '../../type/cm/AutoComplete.type';

export const SppAutoCompleteService = () => {
  const getAutoCompleteUserList = (params: AutoCompleteQueryArgs) => {
    const { query: query, enabled = true, size = 20, ...args } = params;
    return useInfiniteQuery({
      queryKey: ['autocomplete', 'user', { query: query, size, ...args }],
      queryFn: ({ pageParam }) => SppAutoCompleteApi().getAutoCompleteUserList({ query: query, cursor: Number(pageParam ?? 0), size, ...args }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined),
      enabled: enabled && query.trim().length > 0,
      staleTime: 0,
    });
  };

  const getAutoCompleteOrgList = (params: AutoCompleteQueryArgs) => {
    const { query: query, enabled = true, size = 20, ...args } = params;
    return useInfiniteQuery({
      queryKey: ['autocomplete', 'org', { q: query, size, ...args }],
      queryFn: ({ pageParam }) => SppAutoCompleteApi().getAutoCompleteOrgList({ query: query, cursor: Number(pageParam ?? 0), size, ...args }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined),
      enabled: enabled && query.trim().length > 0,
      staleTime: 0,
    });
  };

  return { getAutoCompleteUserList, getAutoCompleteOrgList };
};
