import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { Key, ReactElement } from 'react';

import { IudType } from '@/type/common.type';
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Pagination, Table } from 'antd';
import type { TablePaginationConfig, TableProps } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { SppEllipsisTooltipCell, withEllipsisNoTitle } from './SppTableEllipsisTooltip';

type ScrollBehaviorType = 'auto' | 'instant' | 'smooth';

interface SppTableProps<T extends object = any> extends Omit<TableProps<T>, 'pagination'> {
  pagination?: false | TablePaginationConfig;
  rowNoFlag?: boolean;
  rowNoDescFlag?: boolean;
  showIudIcon?: boolean;
  selectedRowIndex?: number;
  rowSelectedFlag?: boolean;
  autoSelectFirstRow?: boolean;
  paginationResetKey?: any;
  paginationFlag?: boolean;
}

interface SppPageParam {
  page: number;
  pageSize: number;
  pageEditFlag: boolean;
}

const rowNoColumns: ColumnsType<any> = [
  {
    title: '순번',
    dataIndex: 'rowNo',
    key: 'rowNo',
    align: 'center',
    width: '60px',
  },
];

export const IUD_COLUMN: any = {
  title: () => {
    return <EditOutlined />;
  },
  dataIndex: 'iudType',
  key: 'iudType',
  align: 'center',
  width: '40px',
  render: (value: IudType) => {
    if (value === IudType.I) return <PlusCircleOutlined />;
    if (value === IudType.U) return <CheckCircleOutlined />;
    if (value === IudType.D) return <DeleteOutlined />;

    return <></>;
  },
};

function hasColumnKey(columns: any[] | undefined, key: string) {
  if (!columns) return false;
  return columns
    .map((c) => (c ? (c as any).key : undefined))
    .filter((v) => v !== undefined)
    .includes(key as any);
}

const SppTable = forwardRef(<T extends object = any>(props: SppTableProps<T>, ref: any) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<any>(null);
  const prevDataSourceRef = useRef<any>(null);
  const autoClickRef = useRef(false);

  const pagingEnabled = props.pagination !== false;
  const initialPagination = typeof props.pagination === 'object' ? (props.pagination as TablePaginationConfig) : undefined;

  const isServerPaging = !!props.paginationFlag && pagingEnabled;

  const targetColumns = useMemo(() => {
    const cols = props.columns as any[] | undefined;

    if (props.rowNoFlag || props.rowNoDescFlag) {
      if (cols !== undefined && !hasColumnKey(cols, 'rowNo')) {
        return rowNoColumns.concat(cols as any);
      }
    }

    return cols;
  }, [props.columns, props.rowNoFlag, props.rowNoDescFlag]);

  const ellipsisColumns = useMemo(() => {
    if (!targetColumns) return targetColumns as any;
    return withEllipsisNoTitle(targetColumns as any);
  }, [targetColumns]);

  const [targetDataSource, setTargetDataSource] = useState<any>();
  const [paginationParam, setPaginationParam] = useState<SppPageParam>({
    page: pagingEnabled && initialPagination?.current ? initialPagination.current : 1,
    pageSize: pagingEnabled && initialPagination?.pageSize ? initialPagination.pageSize : 10,
    pageEditFlag: true,
  });
  const [tableHeight, setTableHeight] = useState(800);

  const [selectRowIndex, setSelectRowIndex] = useState<number | undefined>(-1);

  const computedTotal = Array.isArray(props.dataSource) ? props.dataSource.length : 0;

  const totalCount = typeof initialPagination?.total === 'number' ? initialPagination.total : computedTotal;

  // 서버 페이징에서는 Table 내부 pagination을 끄고(Pagination UI는 별도 렌더)
  //    - Table 내부 pagination을 켜두면 pageSize 기준으로 슬라이싱이 발생해서 append가 "안 보이는" 문제가 생김
  //    - pageSize를 억지로 늘리면 total/pageSize 계산 때문에 페이지(2번)가 사라지는 문제가 생김
  const computedPagination: TablePaginationConfig | false = isServerPaging
    ? false
    : pagingEnabled
      ? {
          ...(initialPagination ?? {}),
          current: paginationParam.page,
          pageSize: paginationParam.pageSize,
          total: totalCount,
          showSizeChanger: true,
        }
      : false;

  const getRowKey = (row: any): Key | undefined => {
    const rk: any = (props as any).rowKey;
    if (typeof rk === 'function') return rk(row);
    if (typeof rk === 'string') return row?.[rk];
    return row?.key;
  };

  const escapeCssAttr = (v: any) => {
    const s = String(v);
    const ce = (globalThis as any).CSS?.escape;
    return ce ? ce(s) : s.replace(/["\\]/g, '\\$&');
  };

  const findBodyAndTrByKey = (key: Key) => {
    const root = wrapRef.current;
    if (!root) return null;

    const body = root.querySelector<HTMLDivElement>('.ant-table-body');
    if (!body) return null;

    const k = escapeCssAttr(key);
    const tr = body.querySelector<HTMLTableRowElement>(`tr[data-row-key="${k}"]`) ?? body.querySelector<HTMLTableRowElement>(`tr[data-row-key='${k}']`);

    if (!tr) return null;
    return { body, tr };
  };

  const scrollTrNearest = (body: HTMLDivElement, tr: HTMLTableRowElement, opts?: { behavior?: ScrollBehaviorType }) => {
    const bodyRect = body.getBoundingClientRect();
    const trRect = tr.getBoundingClientRect();

    const hScrollBarH = Math.max(0, body.offsetHeight - body.clientHeight);
    const visibleTop = bodyRect.top;
    const visibleBottom = bodyRect.bottom - hScrollBarH;

    const EPS = 2;

    if (trRect.top < visibleTop + EPS) {
      const delta = visibleTop - trRect.top + EPS;
      const nextTop = Math.max(0, body.scrollTop - delta);

      if (opts?.behavior === 'smooth') body.scrollTo({ top: nextTop, behavior: 'smooth' });
      else body.scrollTop = nextTop;

      return true;
    }

    if (trRect.bottom > visibleBottom - EPS) {
      const delta = trRect.bottom - visibleBottom + EPS;
      const maxTop = Math.max(0, body.scrollHeight - body.clientHeight);
      const nextTop = Math.min(maxTop, body.scrollTop + delta);

      if (opts?.behavior === 'smooth') body.scrollTo({ top: nextTop, behavior: 'smooth' });
      else body.scrollTop = nextTop;

      return true;
    }

    return true;
  };

  const scrollToFocusedRow = (opts?: { behavior?: ScrollBehaviorType }) => {
    const index = selectRowIndex;
    if (index === undefined || index === null) return false;

    const view = Array.isArray(targetDataSource) ? targetDataSource : [];
    const row = view[index];
    if (!row) return false;

    const key = getRowKey(row);
    if (key === undefined || key === null) return false;

    const found = findBodyAndTrByKey(key);
    if (!found) return false;

    return scrollTrNearest(found.body, found.tr, opts);
  };

  const scrollToRowIndex = (index: number, opts?: { behavior?: ScrollBehaviorType }) => {
    const view = Array.isArray(targetDataSource) ? targetDataSource : [];
    const row = view[index];
    if (!row) return false;

    const key = getRowKey(row);
    if (key === undefined || key === null) return false;

    const found = findBodyAndTrByKey(key);
    if (!found) return false;

    return scrollTrNearest(found.body, found.tr, opts);
  };

  const selectRowIndexByRef = (index: number | undefined) => {
    setSelectRowIndex(index);
    return true;
  };

  const runRowClick = async (record: T, index: number | undefined) => {
    if (index === undefined) return;

    const userRow = (props.onRow?.(record, index) as any) ?? {};
    const userOnClick = userRow?.onClick;

    if (userOnClick) {
      const result = await userOnClick();
      if (result !== false && props.rowSelectedFlag) {
        setSelectRowIndex(index);
      }
    } else if (props.rowSelectedFlag) {
      setSelectRowIndex(index);
    }
  };

  const renderServerPagination = () => {
    if (!isServerPaging) return null;

    const current = initialPagination?.current ?? paginationParam.page ?? 1;
    const pageSize = initialPagination?.pageSize ?? paginationParam.pageSize ?? 10;
    const total = totalCount;

    const pageChange = (page: number, nextPageSize: number) => {
      setPaginationParam((prev) => ({ ...prev, page, pageSize: nextPageSize, pageEditFlag: true }));
      autoClickRef.current = false;

      const p = { ...(initialPagination ?? {}), current: page, pageSize: nextPageSize, total } as TablePaginationConfig;
      if (props?.onChange) props?.onChange(p, {}, {}, { action: 'paginate', currentDataSource: [] } as any);
    };

    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
        <Pagination
          current={current}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          pageSizeOptions={[10, 20, 50, 100]}
          onChange={(page, size) => {
            pageChange(page, size ?? pageSize);
          }}
          onShowSizeChange={(_, size) => {
            pageChange(1, size);
          }}
        />
      </div>
    );
  };

  const setClassName = (record: any, index: number) => {
    return index === props.selectedRowIndex ? 'selected-row' : '';
  };

  const setSelectedClassName = (record: any, index: number) => {
    return index === selectRowIndex ? 'selected-row' : '';
  };

  useEffect(() => {
    if (!pagingEnabled) return;

    const nextPage = initialPagination?.current ?? 1;
    const nextPageSize = initialPagination?.pageSize ?? 10;

    setPaginationParam((prev) => {
      if (prev.page === nextPage && prev.pageSize === nextPageSize) return prev;
      return {
        ...prev,
        page: nextPage,
        pageSize: nextPageSize,
        pageEditFlag: true,
      };
    });
  }, [pagingEnabled, initialPagination?.current, initialPagination?.pageSize]);

  useEffect(() => {
    if (!props.rowSelectedFlag) return;
    if (!props.autoSelectFirstRow) return;

    const view = Array.isArray(targetDataSource) ? targetDataSource : [];
    if (view.length === 0) return;

    if (autoClickRef.current) return;
    autoClickRef.current = true;

    runRowClick(view[0], 0);
  }, [props.rowSelectedFlag, props.autoSelectFirstRow, targetDataSource]);

  useEffect(() => {
    autoClickRef.current = false;
  }, [props.paginationResetKey]);

  useImperativeHandle(
    ref,
    () => ({
      ...(tableRef.current ?? {}),
      getPagedData: () => (Array.isArray(targetDataSource) ? (targetDataSource as T[]) : []),
      resetPagination: () => {
        setPaginationParam((prev) => ({
          ...prev,
          page: 1,
          pageEditFlag: true,
        }));
        setSelectRowIndex(-1);
        autoClickRef.current = false;
      },
      scrollToFocusedRow,
      scrollToRowIndex,
      selectRowIndex: selectRowIndexByRef,
      getSelectedRowIndex: () => selectRowIndex,
    }),
    [targetDataSource, selectRowIndex],
  );

  useEffect(() => {
    const dataSourceChanged = prevDataSourceRef.current !== props.dataSource;
    if (!paginationParam.pageEditFlag && !dataSourceChanged) return;
    prevDataSourceRef.current = props.dataSource;

    const source = Array.isArray(props.dataSource) ? props.dataSource : [];
    const page = paginationParam.page;
    const pageSize = paginationParam.pageSize;
    const start = pagingEnabled ? (page - 1) * pageSize : 0;

    if (pagingEnabled && !props.paginationFlag) {
      const maxPage = Math.max(1, Math.ceil(source.length / pageSize));
      if (page > maxPage) {
        setPaginationParam({
          ...paginationParam,
          page: 1,
          pageEditFlag: true,
        });
        return;
      }
    }

    const viewRows = pagingEnabled ? (props.paginationFlag ? source : source.slice(start, start + pageSize)) : source;

    if (props.rowNoFlag && viewRows.length > 0) {
      const array = [
        ...viewRows.map((item: any, idx: number) => {
          item['rowNo'] = start + (idx + 1);
          return item;
        }),
      ];
      setTargetDataSource(array);
      setPaginationParam({ ...paginationParam, pageEditFlag: false });
    } else if (props.rowNoDescFlag && viewRows.length > 0) {
      const totalCnt = totalCount;
      const array = [
        ...viewRows.map((item: any, idx: number) => {
          item['rowNo'] = totalCnt - (start + idx);
          return item;
        }),
      ];
      setTargetDataSource(array);
      setPaginationParam({ ...paginationParam, pageEditFlag: false });
    } else {
      setTargetDataSource(viewRows);
      setPaginationParam({ ...paginationParam, pageEditFlag: false });
    }
  }, [
    props.dataSource,
    props.paginationFlag,
    paginationParam.pageEditFlag,
    paginationParam.page,
    paginationParam.pageSize,
    props.rowNoFlag,
    props.rowNoDescFlag,
    pagingEnabled,
    totalCount,
  ]);

  useEffect(() => {
    if (props.paginationResetKey === undefined) return;

    setPaginationParam((prev) => ({
      ...prev,
      page: 1,
      pageEditFlag: true,
    }));
    setSelectRowIndex(-1);
    autoClickRef.current = false;
  }, [props.paginationResetKey]);

  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const availableHeight = windowHeight * 0.55;
      setTableHeight(availableHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={wrapRef}>
      <Table<T>
        ref={tableRef}
        {...props}
        tableLayout={props.tableLayout ?? 'fixed'}
        scroll={props.scroll ?? { y: tableHeight }}
        className={[props.className, 'spp-table-ellipsis'].filter(Boolean).join(' ')}
        components={{
          ...(props.components ?? {}),
          body: {
            ...(props.components as any)?.body,
            cell: SppEllipsisTooltipCell,
          },
        }}
        onRow={(record, index) => {
          const userRow = (props.onRow?.(record, index) as any) ?? {};
          return {
            ...userRow,
            onClick: () => runRowClick(record, index),
          };
        }}
        columns={ellipsisColumns}
        dataSource={targetDataSource}
        pagination={computedPagination}
        onChange={(pagination, filters, sorter, extra) => {
          if (!isServerPaging) {
            setPaginationParam({
              page: pagination.current ? pagination.current : 1,
              pageSize: pagination.pageSize ? pagination.pageSize : 10,
              pageEditFlag: true,
            });
            autoClickRef.current = false;
          }
          if (props?.onChange) props?.onChange(pagination, filters, sorter, extra);
        }}
        rowClassName={(record, index, indent) => (props.rowSelectedFlag ? setSelectedClassName(record, index) : setClassName(record, index))}
      >
        {props.children}
      </Table>

      {renderServerPagination()}
    </div>
  );
}) as <T extends object = any>(props: SppTableProps<T> & { ref?: any }) => ReactElement;

export default SppTable;
