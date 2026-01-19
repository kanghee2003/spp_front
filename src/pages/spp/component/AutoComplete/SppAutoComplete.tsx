import { AutoComplete, AutoCompleteProps, Spin } from 'antd';
import { useMemo, useState } from 'react';
import { AutoCompleteService } from '../../service/cm/AutoComplete.service';
import { AutoCompleteMode } from '../../type/cm/AutoComplete.type';

export interface SppAutocompleteProps extends AutoCompleteProps {
  mode?: AutoCompleteMode;
  showName?: boolean;
  size?: 'small' | 'middle' | 'large';
  label?: string;
}

const SppCustomAutoComplete = (props: SppAutocompleteProps) => {
  // mode가 없으면 "기본 AutoComplete"로 동작 (props/options 기반)
  if (props.mode === undefined) {
    return <AutoComplete {...props} />;
  }

  const mode = props.mode;
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Hook 규칙을 지키기 위해 둘 다 선언하고 enabled로 제어
  const userQuery = AutoCompleteService().getAutoCompleteUserList(inputValue, mode === AutoCompleteMode.EMP);
  const orgQuery = AutoCompleteService().getAutoCompleteOrgList(inputValue, mode === AutoCompleteMode.ORG);

  const query = mode === AutoCompleteMode.EMP ? userQuery : orgQuery;

  const options: any[] = useMemo(() => {
    const pages = query.data?.pages ?? [];
    return pages.flatMap((p) => p.items);
  }, [query.data]);

  return (
    <AutoComplete
      open={open}
      onOpenChange={setOpen}
      options={options}
      value={inputValue}
      onChange={(v) => {
        const q = String(v ?? '');
        setInputValue(q);

        // controlled open 모드에서는 입력 시작 시 드롭다운을 직접 열어주는 게 안정적입니다.
        if (!open && q.trim().length > 0) setOpen(true);
      }}
      onPopupScroll={(e) => {
        const el = e.target as HTMLDivElement;
        const threshold = 40;
        const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;

        // 바닥 근처에서 다음 페이지 로드
        if (nearBottom && query.hasNextPage && !query.isFetchingNextPage) {
          query.fetchNextPage();
        }
      }}
      popupRender={(menu) => {
        return (
          <>
            {menu}
            <div style={{ padding: 8, textAlign: 'center' }}>
              {query.isLoading || query.isFetchingNextPage || query.isFetching ? <Spin size="small" /> : !query.hasNextPage ? '마지막 입니다.' : null}
            </div>
          </>
        );
      }}
      placeholder="검색어 입력"
      style={{ width: '150px' }}
    />
  );
};

export default SppCustomAutoComplete;
