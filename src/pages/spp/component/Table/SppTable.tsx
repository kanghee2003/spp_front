import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { Key, ReactElement } from 'react';

import { IudType } from '@/type/common.type';
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import type { TablePaginationConfig, TableProps } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { SppEllipsisTooltipCell, withEllipsisNoTitle } from './SppTableEllipsisTooltip';

type ScrollBehaviorType = 'auto' | 'instant' | 'smooth';

interface CustomTableProps<T extends object = any> extends TableProps<T> {
  rowNoFlag?: boolean;
  rowNoDescFlag?: boolean;
  showIudIcon?: boolean;
  selectedRowIndex?: number;
  rowSelectedFlag?: boolean;
  paginationResetKey?: any;
  pagenationFlag?: boolean;
}

interface CustomPageParam {
  page: number;
  pageSize: number;
  pageEditFlag: boolean;
}

const rowNoColumns: ColumnsType<any> = [
  {
    title: 'NO',
    dataIndex: 'rowNo',
    key: 'rowNo',
    align: 'center',
    width: '45px',
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
  render: (value: IudType, row: any) => {
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

const SppTable = forwardRef(<T extends object = any>(props: CustomTableProps<T>, ref: any) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<any>(null);
  const prevDataSourceRef = useRef<any>(null);
  const pagingEnabled = props.pagination !== false;
  const initialPagination = typeof props.pagination === 'object' ? (props.pagination as TablePaginationConfig) : undefined;

  const targetColumns = useMemo(() => {
    const cols = props.columns as any[] | undefined;

    if (props.rowNoFlag === true || props.rowNoDescFlag === true) {
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
  const [paginationParam, setPaginationParam] = useState<CustomPageParam>({
    page: pagingEnabled && initialPagination?.current ? initialPagination.current : 1,
    pageSize: pagingEnabled && initialPagination?.pageSize ? initialPagination.pageSize : 10,
    pageEditFlag: true,
  });
  const [tableHeight, setTableHeight] = useState(800);
  const [selectRowIndex, setSelectRowIndex] = useState<number | undefined>(0);

  const computedTotal = Array.isArray(props.dataSource) ? props.dataSource.length : 0;
  const computedPagination: TablePaginationConfig | false = pagingEnabled
    ? {
        ...(initialPagination ?? {}),
        current: paginationParam.page,
        pageSize: paginationParam.pageSize,
        total: initialPagination?.total ?? computedTotal,
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

  const findTrByKey = (key: Key) => {
    const root = wrapRef.current;
    if (!root) return null;

    const body = root.querySelector<HTMLDivElement>('.ant-table-body');
    if (!body) return null;

    const k = escapeCssAttr(key);
    const tr = body.querySelector<HTMLTableRowElement>(`tr[data-row-key="${k}"]`) ?? body.querySelector<HTMLTableRowElement>(`tr[data-row-key='${k}']`);

    return { body, tr };
  };

  const scrollTrIntoViewNearest = (body: HTMLDivElement, tr: HTMLTableRowElement, opts?: { behavior?: ScrollBehaviorType }) => {
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

    const found = findTrByKey(key);
    if (!found?.body || !found.tr) return false;

    return scrollTrIntoViewNearest(found.body, found.tr, opts);
  };

  const scrollToRowIndex = (index: number, opts?: { behavior?: ScrollBehaviorType }) => {
    const view = Array.isArray(targetDataSource) ? targetDataSource : [];
    const row = view[index];
    if (!row) return false;

    const key = getRowKey(row);
    if (key === undefined || key === null) return false;

    const found = findTrByKey(key);
    if (!found?.body || !found.tr) return false;

    return scrollTrIntoViewNearest(found.body, found.tr, opts);
  };

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
        setSelectRowIndex(undefined);
      },
      scrollToFocusedRow,
      scrollToRowIndex,
    }),
    [targetDataSource, selectRowIndex],
  );

  const setClassName = (record: any, index: number) => {
    return index === props.selectedRowIndex ? 'selected-row' : '';
  };

  const setSelectedClassName = (record: any, index: number) => {
    return index === selectRowIndex ? 'selected-row' : '';
  };

  useEffect(() => {
    const dataSourceChanged = prevDataSourceRef.current !== props.dataSource;
    if (!paginationParam.pageEditFlag && !dataSourceChanged) return;
    prevDataSourceRef.current = props.dataSource;

    const source = Array.isArray(props.dataSource) ? props.dataSource : [];
    const page = paginationParam.page;
    const pageSize = paginationParam.pageSize;
    const start = pagingEnabled ? (page - 1) * pageSize : 0;

    if (pagingEnabled && props.pagenationFlag !== true) {
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

    const viewRows = pagingEnabled ? (props.pagenationFlag === true ? source : source.slice(start, start + pageSize)) : source;

    if (props.rowNoFlag === true && viewRows.length > 0) {
      const array = [
        ...viewRows.map((item: any, idx: number) => {
          item['rowNo'] = start + (idx + 1);
          return item;
        }),
      ];
      setTargetDataSource(array);
      setPaginationParam({ ...paginationParam, pageEditFlag: false });
    } else if (props.rowNoDescFlag === true && viewRows.length > 0) {
      const totalCnt = computedPagination !== false && typeof computedPagination.total === 'number' ? computedPagination.total : source.length;
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
    props.pagenationFlag,
    paginationParam.pageEditFlag,
    paginationParam.page,
    paginationParam.pageSize,
    props.rowNoFlag,
    props.rowNoDescFlag,
    pagingEnabled,
    computedTotal,
    initialPagination?.total,
  ]);

  useEffect(() => {
    if (props.paginationResetKey === undefined) return;

    setPaginationParam((prev) => ({
      ...prev,
      page: 1,
      pageEditFlag: true,
    }));
    setSelectRowIndex(undefined);
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
        onRow={(record, index) => ({
          ...props.onRow,
          onClick: async () => {
            if (props.onRow && (props.onRow?.(record, index) as any).onClick) {
              const result = await (props.onRow?.(record, index) as any).onClick();

              if (result !== false && props.rowSelectedFlag) {
                setSelectRowIndex(index);
              }
            } else if (props.rowSelectedFlag) {
              setSelectRowIndex(index);
            }
          },
        })}
        columns={ellipsisColumns}
        dataSource={targetDataSource}
        pagination={computedPagination}
        onChange={(pagination, filters, sorter, extra) => {
          setPaginationParam({
            page: pagination.current ? pagination.current : 1,
            pageSize: pagination.pageSize ? pagination.pageSize : 10,
            pageEditFlag: true,
          });
          if (props?.onChange) props?.onChange(pagination, filters, sorter, extra);
        }}
        rowClassName={(record, index, indent) => (props.rowSelectedFlag ? setSelectedClassName(record, index) : setClassName(record, index))}
      >
        {props.children}
      </Table>
    </div>
  );
}) as <T extends object = any>(props: CustomTableProps<T> & { ref?: any }) => ReactElement;

export default SppTable;
