import { Pagination, Table } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useMemo, useState } from 'react';
import SppTable from '../../component/Table/SppTable';

type Row = {
  id: string;
  name: string;
  dept: string;
  amount: number;
};

function asNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function SppTableWithFooterFixedInLayout() {
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
  });

  const data: Row[] = useMemo(
    () =>
      Array.from({ length: 200 }, (_, i) => ({
        id: String(i + 1),
        name: `사용자${i + 1}`,
        dept: i % 2 ? '개발' : '기획',
        amount: (i + 1) * 10,
      })),
    [],
  );

  const total = data.length;

  const pageData = useMemo(() => {
    const current = pagination.current ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const start = (current - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, pagination.current, pagination.pageSize]);

  const totalSum = useMemo(() => data.reduce((a, r) => a + asNumber(r.amount), 0), [data]);

  const columns: ColumnsType<Row> = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', width: 120, align: 'center' },
      { title: '이름', dataIndex: 'name', width: 220, align: 'center' },
      { title: '부서', dataIndex: 'dept', width: 220, align: 'center' },
      { title: '금액', dataIndex: 'amount', width: 160, align: 'right' },
    ],
    [],
  );

  const xWidth = 120 + 220 + 220 + 160;

  const footerRow = useMemo(() => ({ __footer: true, id: '합계', amount: totalSum.toLocaleString() }), [totalSum]);

  const footerColumns: ColumnsType<any> = useMemo(
    () =>
      (columns as any).map((c: any) => ({
        ...c,
        title: null,
        render: (value: any, record: any, index: number) => {
          const v = c.render ? c.render(value, record, index) : value;
          if (!record?.__footer) return v;
          return <div style={{ fontWeight: 600 }}>{v}</div>;
        },
      })),
    [columns],
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <SppTable<Row> rowKey="id" columns={columns} dataSource={pageData} pagination={false} tableLayout="fixed" scroll={{ y: '100%', x: xWidth }} />
        </div>
      </div>

      <div style={{ flex: '0 0 auto', background: '#fff' }}>
        <SppTable<any>
          rowKey={() => 'footer'}
          columns={footerColumns}
          dataSource={[footerRow]}
          pagination={false}
          showHeader={false}
          tableLayout="fixed"
          scroll={{ x: xWidth }}
          className="spp-footer-table"
        />

        <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={total}
            showSizeChanger
            onChange={(current, pageSize) => {
              setPagination((p) => ({ ...p, current, pageSize, total }));
            }}
            onShowSizeChange={(_, pageSize) => {
              setPagination((p) => ({ ...p, current: 1, pageSize, total }));
            }}
          />
        </div>
      </div>

      <style>{`
        .spp-footer-table .ant-table {
          margin: 0;
        }
        .spp-footer-table .ant-table-container::before,
        .spp-footer-table .ant-table-container::after {
          display: none;
        }

        .spp-footer-table .ant-table-tbody > tr > td {
          border-top: 2px solid #d9d9d9;
          border-bottom: 1px solid #f0f0f0;
        }
      `}</style>
    </div>
  );
}
