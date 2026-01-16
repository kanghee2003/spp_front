import { useMemo, useState } from 'react';

import { Card, Typography } from 'antd';
import type { TablePaginationConfig } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import SppTable from '@/pages/spp/component/Table/SppTable';

type Row = { id: number; name: string; role: string };

const data: Row[] = [
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'User' },
];

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns: ColumnsType<Row> = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Role', dataIndex: 'role' },
  ];

  const pagination: TablePaginationConfig = {
    current: page,
    pageSize,
    total: data.length,
    showSizeChanger: true,
  };

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [page, pageSize]);

  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Users
      </Typography.Title>
      <SppTable<Row>
        rowKey="id"
        rowNoFlag
        pagination={pagination}
        columns={columns}
        dataSource={pagedData}
        onChange={(p) => {
          setPage(p.current ? p.current : 1);
          setPageSize(p.pageSize ? p.pageSize : 10);
        }}
      />
    </Card>
  );
}
