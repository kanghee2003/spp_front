import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type React from 'react';
import { useEffect, useState } from 'react';

type MasterRow = {
  id: string;
  name: string;
  type: 'USER' | 'ORG';
  owner: string;
  updatedAt: string;
};

type ExtraColumnMeta = {
  key: string;
  title: string;
  dataIndex: string;
};

type DetailRow = {
  id: string;
  name: string;
  org: string;
  role: string;
  [k: string]: any;
};

type DetailMock = {
  extraColumns: ExtraColumnMeta[];
  rows: DetailRow[];
};

const baseDetailColumns: ColumnsType<DetailRow> = [
  { key: 'name', title: '이름', dataIndex: 'name' },
  { key: 'org', title: '부서', dataIndex: 'org' },
  { key: 'role', title: '권한', dataIndex: 'role' },
];

const detailMockByMasterId: Record<string, DetailMock> = {
  S1: {
    extraColumns: [
      { key: 'empNo', title: '사번', dataIndex: 'empNo' },
      { key: 'email', title: '이메일', dataIndex: 'email' },
    ],
    rows: [
      { id: '1', name: '홍길동', org: '개발', role: 'ADMIN', empNo: '10001', email: 'hong@test.com' },
      { id: '2', name: '김철수', org: '기획', role: 'USER', empNo: '10002', email: 'kim@test.com' },
    ],
  },
  S2: {
    extraColumns: [
      { key: 'orgCd', title: '조직코드', dataIndex: 'orgCd' },
      { key: 'parentOrg', title: '상위부서', dataIndex: 'parentOrg' },
      { key: 'userCnt', title: '사용자수', dataIndex: 'userCnt' },
    ],
    rows: [
      { id: '10', name: '박영희', org: '영업1팀', role: 'USER', orgCd: 'D101', parentOrg: '영업본부', userCnt: 23 },
      { id: '11', name: '이민수', org: '영업2팀', role: 'ADMIN', orgCd: 'D102', parentOrg: '영업본부', userCnt: 51 },
    ],
  },
  S3: {
    extraColumns: [],
    rows: [
      { id: '20', name: '정우성', org: '인사', role: 'USER' },
      { id: '21', name: '한지민', org: '인사', role: 'ADMIN' },
    ],
  },
};

function makeExtraColumns(metas: ExtraColumnMeta[]): ColumnsType<DetailRow> {
  return metas.map((m) => ({ key: m.key, title: m.title, dataIndex: m.dataIndex }));
}

const DynamicTableSample = () => {
  const [masterRows] = useState<MasterRow[]>([
    { id: 'S1', name: '설정 1', type: 'USER', owner: '관리자A', updatedAt: '2026-02-10' },
    { id: 'S2', name: '설정 2', type: 'ORG', owner: '관리자B', updatedAt: '2026-02-09' },
    { id: 'S3', name: '설정 3', type: 'USER', owner: '관리자C', updatedAt: '2026-02-08' },
  ]);

  const [selectedId, setSelectedId] = useState(masterRows[0]?.id ?? '');
  const [detailColumns, setDetailColumns] = useState<ColumnsType<DetailRow>>(baseDetailColumns);
  const [detailRows, setDetailRows] = useState<DetailRow[]>([]);

  useEffect(() => {
    const mock = detailMockByMasterId[selectedId];
    const merged = [...baseDetailColumns, ...makeExtraColumns(mock?.extraColumns ?? [])];
    setDetailColumns(merged);
    setDetailRows(mock?.rows ?? []);
  }, [selectedId]);

  const masterColumns: ColumnsType<MasterRow> = [
    { key: 'name', title: '설정명', dataIndex: 'name' },
    { key: 'type', title: '유형', dataIndex: 'type' },
    { key: 'owner', title: '담당자', dataIndex: 'owner' },
    { key: 'updatedAt', title: '수정일', dataIndex: 'updatedAt' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Table<MasterRow>
        rowKey="id"
        size="small"
        columns={masterColumns}
        dataSource={masterRows}
        pagination={false}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedId ? [selectedId] : [],
          onChange: (keys: React.Key[]) => setSelectedId(String(keys?.[0] ?? '')),
          columnWidth: 0,
          renderCell: () => null,
        }}
        onRow={(r) => ({
          onClick: () => setSelectedId(r.id),
        })}
      />
      <Table<DetailRow> rowKey="id" size="small" columns={detailColumns} dataSource={detailRows} pagination={false} />
    </div>
  );
};

export default DynamicTableSample;
