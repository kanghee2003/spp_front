import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';

import { IudType } from '@/type/common.type';
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import type { TablePaginationConfig, TableProps } from 'antd';
import { ColumnsType } from 'antd/es/table';

interface CustomTableProps<T extends object = any> extends TableProps<T> {
  rowNoFlag?: boolean;
  rowNoDescFlag?: boolean;
  showIudIcon?: boolean;
  selectedRowIndex?: number;
  rowSelectedFlag?: boolean;
  paginationResetKey?: any;
  /**
   * 서버 페이징 모드
   * - dataSource는 '현재 페이지 데이터'만 전달
   * - 내부에서 slice하지 않고 그대로 렌더
   */
  serverPaging?: boolean;
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

export const iudColums: ColumnsType<any> = [
  {
    title: () => {
      return <EditOutlined />;
    },
    dataIndex: 'iudType',
    key: 'iudType',
    align: 'center',
    width: '40px',
    render: (value: IudType, row) => {
      if (value === IudType.I) return <PlusCircleOutlined />;
      if (value === IudType.U) return <CheckCircleOutlined />;
      if (value === IudType.D) return <DeleteOutlined />;

      return <></>;
    },
  },
];

export const IUD_COLUMN = iudColums[0];

function hasColumnKey(columns: any[] | undefined, key: string) {
  if (!columns) return false;
  return columns
    .map((c) => (c ? (c as any).key : undefined))
    .filter((v) => v !== undefined)
    .includes(key as any);
}

const SppTable = forwardRef(<T extends object = any>(props: CustomTableProps<T>, ref: any) => {
  const tableRef = useRef<any>(null);
  const prevDataSourceRef = useRef<any>(null);
  const pagingEnabled = props.pagination !== false;
  const initialPagination = typeof props.pagination === 'object' ? (props.pagination as TablePaginationConfig) : undefined;

  // rowNoFlag(rowNoDescFlag) 옵션이 켜졌을 때는 "NO" 컬럼을 자동으로 앞에 붙인다.
  // 기존처럼 effect 안에서 지역변수를 재할당하면 렌더 이후 값이 유지되지 않아
  // 컬럼이 실제로 붙지 않는 문제가 생길 수 있어 memo 로 계산한다.
  const targetColumns = useMemo(() => {
    const cols = props.columns as any[] | undefined;

    if (props.rowNoFlag === true || props.rowNoDescFlag === true) {
      if (cols !== undefined && !hasColumnKey(cols, 'rowNo')) {
        return rowNoColumns.concat(cols as any);
      }
    }

    return cols;
  }, [props.columns, props.rowNoFlag, props.rowNoDescFlag]);
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
    }),
    [targetDataSource],
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

    if (pagingEnabled && props.serverPaging !== true) {
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

    const viewRows = pagingEnabled ? (props.serverPaging === true ? source : source.slice(start, start + pageSize)) : source;

    if (props.rowNoFlag === true && viewRows.length > 0) {
      const array = [
        ...viewRows.map((item: any, idx: number) => {
          // serverPaging이면 source가 이미 page 단위지만 rowNo는 전체 기준으로 계산해야 함
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
    props.serverPaging,
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
    <>
      <Table<T>
        ref={tableRef}
        {...props}
        scroll={props.scroll ?? { y: tableHeight }}
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
        columns={targetColumns}
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
    </>
  );
}) as <T extends object = any>(props: CustomTableProps<T> & { ref?: any }) => ReactElement;

export default SppTable;
