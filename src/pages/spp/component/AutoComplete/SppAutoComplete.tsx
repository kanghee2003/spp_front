import { AutoComplete, AutoCompleteProps, Spin } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AutoCompleteApi } from '../../api/cm/AutoComplete.api';
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

  // input에 보이는 값(표시값)
  const [displayValue, setDisplayValue] = useState('');

  // 서버 조회에 쓰는 검색어(타이핑 값)
  const [searchValue, setSearchValue] = useState('');

  // 옵션 선택 직후 onChange가 한번 더 타면서 다시 open 되는 현상 방지용
  const [suppressNextOpen, setSuppressNextOpen] = useState(false);

  const instanceClsRef = useRef(`spp-ac-${Math.random().toString(36).slice(2, 10)}`);
  const instanceCls = instanceClsRef.current;

  // 초기 keyValue 동기화 중복 방지
  const lastSyncedKeyRef = useRef<string | null>(null);

  const userQuery = AutoCompleteService().getAutoCompleteUserList({
    query: searchValue,
    enabled: mode === AutoCompleteMode.USER,
  });
  const orgQuery = AutoCompleteService().getAutoCompleteOrgList({
    query: searchValue,
    enabled: mode === AutoCompleteMode.ORG,
  });

  const query = mode === AutoCompleteMode.USER ? userQuery : orgQuery;

  const options: any[] = useMemo(() => {
    const pages = query.data?.pages ?? [];
    const items: any[] = pages.flatMap((p) => p.items ?? []);

    const rowStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: '100%',
    };

    const colStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    };

    const sepStyle = { opacity: 0.4 };

    if (mode === AutoCompleteMode.ORG) {
      return items.map((x) => ({
        ...x,
        value: `${x.orgCd} | ${x.orgNm}`,
        keyValue: x.orgCd,
        label: (
          <div style={rowStyle}>
            <span style={{ ...colStyle }}>{x.orgCd}</span>
            <span style={sepStyle}>|</span>
            <span style={{ ...colStyle }}>{x.orgNm}</span>
          </div>
        ),
      }));
    }

    if (mode === AutoCompleteMode.USER) {
      return items.map((x) => ({
        ...x,
        value: `${x.userId} | ${x.gradeNm}`,
        keyValue: x.userId,
        label: (
          <div style={rowStyle}>
            <span style={{ ...colStyle }}>{x.userId}</span>
            <span style={sepStyle}>|</span>
            <span style={{ ...colStyle }}>{x.gradeNm}</span>
            <span style={sepStyle}>|</span>
            <span style={{ ...colStyle, flex: '1 1 auto' }}>{x.orgNm}</span>
          </div>
        ),
      }));
    }

    return items;
  }, [query.data, mode]);

  /**
   *  RHF에서 value로 넘어오는 값은 keyValue(userId/orgCd) 만 존재
   * -> API로 1번 조회해서 상세를 찾고, 표시값(displayValue)을 세팅한다.
   * -> 이때 searchValue는 건드리지 않아서, 표시값으로 검색이 재실행되는 문제를 막는다.
   */
  useEffect(() => {
    const raw = props.value;
    if (raw === undefined || raw === null) return;

    const key = String(raw).trim();
    if (key.length === 0) return;

    // 이미 동일 key 동기화했으면 다시 안 함
    if (lastSyncedKeyRef.current === key) return;

    // 사용자가 타이핑 중이면(검색 중이면) 덮어쓰지 않음
    if (searchValue && searchValue.trim().length > 0) return;

    let cancelled = false;

    const syncDisplay = async () => {
      try {
        if (mode === AutoCompleteMode.USER) {
          const res = await AutoCompleteApi().getAutoCompleteUserList({
            query: key,
            cursor: 1,
            size: 20,
          });

          const items: any[] = res?.items ?? [];
          const hit = items.find((x) => String(x?.userId ?? '').trim() === key) ?? null;

          if (cancelled) return;

          lastSyncedKeyRef.current = key;

          if (!hit) {
            // 못 찾으면 key만 보여줌
            setDisplayValue(key);
            return;
          }

          setDisplayValue(`${hit.userId} | ${hit.gradeNm}`);
          return;
        }

        if (mode === AutoCompleteMode.ORG) {
          const res = await AutoCompleteApi().getAutoCompleteOrgList({
            query: key,
            cursor: 1,
            size: 20,
          });

          const items: any[] = res?.items ?? [];
          const hit = items.find((x) => String(x?.orgCd ?? '').trim() === key) ?? null;

          if (cancelled) return;

          lastSyncedKeyRef.current = key;

          if (!hit) {
            setDisplayValue(key);
            return;
          }

          setDisplayValue(`${hit.orgCd} | ${hit.orgNm}`);
        }
      } catch (e) {
        if (cancelled) return;
        lastSyncedKeyRef.current = key;
        setDisplayValue(key);
      }
    };

    syncDisplay();

    return () => {
      cancelled = true;
    };
  }, [props.value, mode]);

  // 검색어가 바뀌면 드롭다운 스크롤을 첫 항목으로 올림 (searchValue 기준)
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
  }, [searchValue, open, instanceCls, suppressNextOpen]);

  return (
    <AutoComplete
      {...props}
      open={open}
      onOpenChange={setOpen}
      options={options}
      value={displayValue}
      popupMatchSelectWidth={false}
      onKeyDown={(e) => {
        if (e.key !== 'Enter') return;
        if (!open) return;
        if (!options || options.length === 0) return;

        const nativeEvent: any = (e as any).nativeEvent;
        if (nativeEvent?.isComposing) return;

        const dropdownRoot = document.querySelector(`.${instanceCls}`);
        if (!dropdownRoot) return;

        const activeEl = dropdownRoot.querySelector('.ant-select-item-option-active') || dropdownRoot.querySelector('.ant-select-item-option-selected');

        if (activeEl) return;

        e.preventDefault();
        e.stopPropagation();

        const picked: any = options[0];
        const pickedDisplayValue = picked?.value;
        const keyValue = picked?.keyValue;

        if (pickedDisplayValue === undefined) return;

        setSuppressNextOpen(true);
        setOpen(false);

        // 표시값 세팅
        setDisplayValue(String(pickedDisplayValue ?? ''));
        // 검색어는 비워서 불필요한 재조회 방지
        setSearchValue('');

        if (keyValue !== undefined) props.onChange?.(keyValue);
        props.onSelect?.(pickedDisplayValue, picked);
      }}
      onChange={(v) => {
        const q = String(v ?? '');

        // 표시값은 입력값 그대로
        setDisplayValue(q);

        // 옵션 선택/Enter 자동선택 후 onChange가 한 번 더 타면서 다시 open 되는 현상 방지
        if (suppressNextOpen) {
          setSuppressNextOpen(false);
          return;
        }

        // 사용자가 입력 시작하면 초기 동기화 다시 허용(다음 value 변경 시)
        lastSyncedKeyRef.current = null;

        // 입력을 전부 지우면 RHF 값도 초기화
        if (q.trim().length === 0) {
          setSearchValue('');
          setOpen(false);
          props.onChange?.(undefined as any);
          return;
        }

        // 사용자가 타이핑하는 값만 서버 검색어로 사용
        setSearchValue(q);

        if (!open && q.trim().length > 0) setOpen(true);
      }}
      onSelect={(val, option) => {
        const opt: any = option as any;
        const keyValue = opt?.keyValue;

        setSuppressNextOpen(true);
        setOpen(false);

        // input에는 표시값 유지
        setDisplayValue(String(val ?? ''));
        // 검색어는 비워서 불필요한 재조회 방지
        setSearchValue('');

        // RHF에는 keyValue만 전달
        if (keyValue !== undefined) props.onChange?.(keyValue);

        props.onSelect?.(val, option);
      }}
      onPopupScroll={(e) => {
        const el = e.target as HTMLDivElement;
        const threshold = 40;
        const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;

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
