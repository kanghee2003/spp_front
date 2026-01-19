import SppButton from '@/pages/spp/component/Button/SppButton';
import SppModal, { SppModalProps } from '@/pages/spp/component/Modal/SppModal';
import { ExcelUploadHeaderMap, ExcelUploadHeaderKey, ExcelUploadList, ExcelUploadListScheme, ExcelUploadRow } from '@/pages/spp/type/excel/ExcelUpload.type';
import { Alert, Space, Typography, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

export interface ExcelUploadPopupProps extends SppModalProps {
  onUploaded?: (list: ExcelUploadList) => void;
}

const requiredHeaders: ExcelUploadHeaderKey[] = ['empNo', 'empName', 'orgCd', 'orgNm'];

const ExcelUploadPopup = (props: ExcelUploadPopupProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ExcelUploadRow[]>([]);

  const canOk = rows.length > 0 && !error;

  const sampleLink = useMemo(() => {
    return (
      <a href="/sample-excel/ExcelUploadSample.xlsx" download>
        샘플 엑셀 다운로드
      </a>
    );
  }, []);

  const parseExcel = async (file: File) => {
    setError(null);
    setRows([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames?.[0];
      if (!sheetName) throw new Error('엑셀 시트가 없습니다.');

      const sheet = workbook.Sheets[sheetName];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false }) as any;
      if (!rawRows || rawRows.length < 2) throw new Error('데이터가 없습니다.');

      const headerRow = (rawRows[0] ?? []).map((v) => String(v ?? '').trim());
      const headerIndexMap = new Map<string, number>();
      headerRow.forEach((h, idx) => {
        if (h) headerIndexMap.set(h, idx);
      });

      // 유연 모드: 헤더 순서 무관, 컬럼명만 맞으면 통과
      const missing = requiredHeaders.filter((k) => !headerIndexMap.has(ExcelUploadHeaderMap[k]));
      if (missing.length > 0) {
        throw new Error(`필수 컬럼이 누락되었습니다: ${missing.join(', ')}`);
      }

      const list: ExcelUploadRow[] = rawRows
        .slice(1)
        .filter((r) => Array.isArray(r) && r.some((v) => String(v ?? '').trim().length > 0))
        .map((r) => {
          const obj: any = {};
          requiredHeaders.forEach((k) => {
            const colName = ExcelUploadHeaderMap[k];
            const idx = headerIndexMap.get(colName) as number;
            obj[k] = String(r[idx] ?? '').trim();
          });
          return obj as ExcelUploadRow;
        });

      const parsed = ExcelUploadListScheme.safeParse(list);
      if (!parsed.success) {
        const first = parsed.error.issues?.[0];
        throw new Error(first?.message ?? '스키마 검증에 실패했습니다.');
      }

      setRows(parsed.data);
      message.success(`업로드 데이터 ${parsed.data.length}건을 확인했습니다.`);
    } catch (e: any) {
      const msg = e?.message ?? '엑셀 파싱 중 오류가 발생했습니다.';
      setError(msg);
      message.error(msg);
    }
  };

  return (
    <SppModal
      {...props}
      okButtonProps={{ ...(props.okButtonProps ?? {}), disabled: !canOk }}
      onOk={(e) => {
        if (!canOk) return;
        props.onUploaded?.(rows);
        props.onOk?.(e);
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Typography.Text>
          {sampleLink}
        </Typography.Text>

        <Upload
          accept=".xlsx,.xls"
          fileList={fileList}
          beforeUpload={(file) => {
            setFileList([file]);
            parseExcel(file as any);
            return false; // auto upload 막기
          }}
          onRemove={() => {
            setFileList([]);
            setRows([]);
            setError(null);
          }}
          maxCount={1}
        >
          <SppButton type="default">엑셀 파일 선택</SppButton>
        </Upload>

        <Typography.Text type="secondary">
          필수 컬럼: {requiredHeaders.join(', ')} (헤더 순서 무관)
        </Typography.Text>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        {!error && rows.length > 0 ? <Alert type="success" showIcon message={`검증 완료: ${rows.length}건`} /> : null}
      </Space>
    </SppModal>
  );
};

export default ExcelUploadPopup;
