import { Card, Typography } from 'antd';
import { useMemo, useState } from 'react';

import SppExcelEditTable, { type ExcelPasteUploadColumn } from '../../component/Table/SppExcelEditTable';

const { Title, Paragraph, Text } = Typography;

type UploadRow = {
  itemCode: string;
  itemName: string;
  qty: string;
  remark: string;
};

function createRow(): UploadRow {
  return { itemCode: '', itemName: '', qty: '', remark: '' };
}

export default function ExcelPasteUploadSample() {
  const [rows, setRows] = useState<UploadRow[]>(() => [createRow()]);

  const columns = useMemo<ExcelPasteUploadColumn<UploadRow>[]>(() => {
    return [
      { title: '품목코드', dataIndex: 'itemCode', width: 160, placeholder: 'A열' },
      { title: '품목명', dataIndex: 'itemName', width: 240, placeholder: 'B열' },
      { title: '수량', dataIndex: 'qty', width: 120, placeholder: 'C열' },
      { title: '비고', dataIndex: 'remark', width: 280, placeholder: 'D열' },
    ];
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Card>
        <Title level={4} style={{ marginTop: 0 }}>
          엑셀 붙여넣기
        </Title>

        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          - 보이는 컬럼 순서대로(A~) 붙여넣기 값이 매핑
          <br />- 붙여넣기 행 수가 현재 데이터보다 많으면 자동으로 행이 추가
          <br />- 단일 값 붙여넣기(탭/개행 없음)는 기본 Input 붙여넣기를 허용
          <br />- 엑셀에서 복사(Ctrl+C) → 표의 셀 클릭 → 붙여넣기(Ctrl+V). (포커스가 input에 있을 때만 적용)
        </Paragraph>
        <Text type="secondary"></Text>
        <SppExcelEditTable<UploadRow> value={rows} onChange={setRows} columns={columns} createRow={createRow} frozenFirstRowFlag={false} />
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Title level={5} style={{ marginTop: 0 }}>
          현재 값 미리보기(디버그)
        </Title>
        <pre style={{ margin: 0, maxHeight: 220, overflow: 'auto' }}>{JSON.stringify(rows, null, 2)}</pre>
      </Card>
    </div>
  );
}
