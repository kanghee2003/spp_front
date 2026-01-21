import { AutoComplete, AutoCompleteProps, Spin } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
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

  // 옵션 선택 직후 onChange가 한번 더 타면서 다시 open 되는 현상 방지용
  const [suppressNextOpen, setSuppressNextOpen] = useState(false);

  const instanceClsRef = useRef(`spp-ac-${Math.random().toString(36).slice(2, 10)}`);
  const instanceCls = instanceClsRef.current;

  // Hook 규칙을 지키기 위해 둘 다 선언하고 enabled로 제어
  const userQuery = AutoCompleteService().getAutoCompleteUserList({
    query: inputValue,
    enabled: mode === AutoCompleteMode.USER,
  });
  const orgQuery = AutoCompleteService().getAutoCompleteOrgList({
    query: inputValue,
    enabled: mode === AutoCompleteMode.ORG,
  });

  const query = mode === AutoCompleteMode.USER ? userQuery : orgQuery;

  const options: any[] = useMemo(() => {
    const pages = query.data?.pages ?? [];
    const items: any[] = pages.flatMap((p) => p.items ?? []);

    if (mode === AutoCompleteMode.ORG) {
      return items.map((x) => ({
        ...x,
        value: `${x.orgCd} | ${x.orgCd}`,
        label: `${x.orgCd} | ${x.orgCd}`,
        keyValue: x.orgCd,
      }));
    }
    if (mode === AutoCompleteMode.USER) {
      return items.map((x) => ({
        ...x,
        value: `${x.userId} | ${x.gradeNm}`,
        label: `${x.userId} | ${x.gradeNm} | ${x.orgNm}`,
        keyValue: x.userId,
      }));
    }
    return items;
  }, [query.data, mode]);

  // 검색어가 바뀌면 드롭다운 스크롤을 첫 항목으로 올림
  useEffect(() => {
    if (!open) return;

    // 선택 직후(displayValue set)에도 inputValue가 바뀌므로 그때 스크롤 튀는 거 방지
    if (suppressNextOpen) return;

    const t = window.setTimeout(() => {
      const dropdownRoot = document.querySelector(`.${instanceCls}`) as HTMLElement | null;
      if (!dropdownRoot) return;

      const holder =
        (dropdownRoot.querySelector('.rc-virtual-list-holder') as HTMLElement | null) ||
        (dropdownRoot.querySelector('.ant-select-dropdown') as HTMLElement | null) ||
        dropdownRoot;

      holder.scrollTop = 0;
    }, 0);

    return () => window.clearTimeout(t);
  }, [inputValue, open, instanceCls, suppressNextOpen]);

  return (
    <AutoComplete
      {...props}
      open={open}
      onOpenChange={setOpen}
      options={options}
      value={inputValue}
      popupMatchSelectWidth={false}
      onKeyDown={(e) => {
        if (e.key !== 'Enter') return;
        if (!open) return;
        if (!options || options.length === 0) return;

        const nativeEvent: any = (e as any).nativeEvent;
        if (nativeEvent?.isComposing) return;

        const dropdownRoot = document.querySelector(`.${instanceCls}`);
        if (!dropdownRoot) return;

        // 이미 하이라이트된 항목이 있으면, antd 기본 Enter 선택에 맡김(중복 방지)
        const activeEl = dropdownRoot.querySelector('.ant-select-item-option-active') || dropdownRoot.querySelector('.ant-select-item-option-selected');

        if (activeEl) return;

        // 하이라이트가 없을 때만 첫 번째 항목 강제 선택
        e.preventDefault();
        e.stopPropagation();

        const picked: any = options[0];
        const displayValue = picked?.value;
        const keyValue = picked?.keyValue;

        if (displayValue === undefined) return;

        setSuppressNextOpen(true);
        setOpen(false);
        setInputValue(String(displayValue ?? ''));

        if (keyValue !== undefined) props.onChange?.(keyValue);

        props.onSelect?.(displayValue, picked);
      }}
      onChange={(v) => {
        const q = String(v ?? '');
        setInputValue(q);

        // 옵션 선택/Enter 자동선택 후 onChange가 한 번 더 타면서 다시 open 되는 현상 방지
        if (suppressNextOpen) {
          setSuppressNextOpen(false);
          return;
        }

        if (!open && q.trim().length > 0) setOpen(true);
      }}
      onSelect={(val, option) => {
        const opt: any = option as any;
        const keyValue = opt?.keyValue;

        // 선택 직후 onChange로 인한 재오픈 방지
        setSuppressNextOpen(true);
        setOpen(false);

        // input에는 value(표시값) 유지
        setInputValue(String(val ?? ''));

        // RHF에는 keyValue(userId/orgCd)만 전달
        if (keyValue !== undefined) props.onChange?.(keyValue);

        // 외부 onSelect 유지
        props.onSelect?.(val, option);
      }}
      onPopupScroll={(e) => {
        const el = e.target as HTMLDivElement;
        const threshold = 40;
        const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;

        // 스크롤이 마지막에 왔을때 다음페이지 리로드
        if (nearBottom && query.hasNextPage && !query.isFetchingNextPage) {
          query.fetchNextPage();
        }
      }}
      popupRender={(menu) => {
        return (
          <div className={instanceCls} style={{ minWidth: 320 }}>
            {menu}
            <div style={{ padding: 8, textAlign: 'center' }}>
              {query.isLoading || query.isFetchingNextPage || query.isFetching ? <Spin size="small" /> : !query.hasNextPage ? '마지막 입니다.' : null}
            </div>
          </div>
        );
      }}
      placeholder="검색어 입력"
      style={{ width: '150px' }}
    />
  );
};

export default SppCustomAutoComplete;
