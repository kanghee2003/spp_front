import SppButton from '@/pages/spp/component/Button/SppButton';
import SppModal, { SppModalProps } from '@/pages/spp/component/Modal/SppModal';

import { Alert, Input, Space, Typography, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { z } from 'zod';

export interface ExcelUploadPopupProps extends SppModalProps {
  rowScheme: z.ZodObject<any>;
  onUploaded?: (list: any) => void;

  startRow?: number;
  startCol?: number;
}

const ExcelUploadPopup = (props: ExcelUploadPopupProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rawRows, setRawRows] = useState<any[][]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canOk = fileList.length > 0;

  const sampleLink = useMemo(() => {
    return (
      <a href="/sample-excel/ExcelUploadSample.xlsx" download>
        샘플 엑셀 다운로드
      </a>
    );
  }, []);

  const loadExcel = async (file: File) => {
    setError(null);
    setRawRows([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames?.[0];
      if (!sheetName) throw new Error('엑셀 시트가 없습니다.');

      const sheet = workbook.Sheets[sheetName];

      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: '',
        blankrows: true,
      }) as any;

      if (!rows || rows.length < 1) throw new Error('데이터가 없습니다.');

      setRawRows(rows);
    } catch (e: any) {
      const msg = e?.message ?? '엑셀 파싱 중 오류가 발생했습니다.';
      setError(msg);
      message.error(msg);
    }
  };

  const validateAndBuildList = () => {
    setError(null);

    const startRow = Math.max(0, props.startRow ?? 1);
    const startCol = Math.max(0, props.startCol ?? 0);

    const rowScheme = props.rowScheme;
    const shape: Record<string, z.ZodTypeAny> = (rowScheme as any)?._def?.shape?.() ?? (rowScheme as any).shape;
    const keys = Object.keys(shape ?? {});
    if (keys.length === 0) {
      const msg = '스키마 정보가 올바르지 않습니다.';
      setError(msg);
      message.error(msg);
      return null;
    }

    if (!rawRows || rawRows.length <= startRow) {
      const msg = '엑셀 데이터가 없습니다.';
      setError(msg);
      message.error(msg);
      return null;
    }

    const unwrapSchema = (s: z.ZodTypeAny) => {
      let cur: z.ZodTypeAny = s;
      while (true) {
        if (cur instanceof z.ZodOptional) {
          cur = cur._def.innerType;
          continue;
        }
        if (cur instanceof z.ZodNullable) {
          cur = cur._def.innerType;
          continue;
        }
        if (cur instanceof z.ZodDefault) {
          cur = cur._def.innerType;
          continue;
        }
        if (cur instanceof z.ZodEffects) {
          cur = cur._def.schema;
          continue;
        }
        break;
      }
      return cur;
    };

    const isOptionalLike = (s: z.ZodTypeAny) => {
      return s instanceof z.ZodOptional || s instanceof z.ZodNullable || s instanceof z.ZodDefault;
    };

    const normalizeValue = (schema: z.ZodTypeAny, raw: any) => {
      const empty = raw === null || raw === undefined || String(raw).trim() === '';
      if (empty && isOptionalLike(schema)) return undefined;

      const base = unwrapSchema(schema);
      if (base instanceof z.ZodString) return String(raw ?? '').trim();
      if (base instanceof z.ZodNumber) {
        if (typeof raw === 'number') return raw;
        const n = Number(String(raw ?? '').trim());
        return n;
      }

      return raw;
    };

    const list: any[] = [];

    for (let rIdx = startRow; rIdx < rawRows.length; rIdx++) {
      const row = rawRows[rIdx] ?? [];

      const dataCells = Array.isArray(row) ? row.slice(startCol, startCol + keys.length) : [];
      const isEmpty = dataCells.length === 0 || dataCells.every((v) => String(v ?? '').trim().length === 0);
      if (isEmpty) continue;

      const obj: any = {};

      for (let cIdx = 0; cIdx < keys.length; cIdx++) {
        const key = keys[cIdx];
        const fieldSchema = shape[key] as z.ZodTypeAny;

        const raw = row[startCol + cIdx];
        const value = normalizeValue(fieldSchema, raw);

        const parsed = fieldSchema.safeParse(value);
        if (!parsed.success) {
          const issue = parsed.error.issues?.[0];

          const msg = `${rIdx + 1}행 ${startCol + cIdx + 1}열(${key}): ${issue?.message ?? '검증 실패'}`;
          setError(msg);
          message.error(msg);
          return null;
        }

        obj[key] = parsed.data;
      }

      list.push(obj);
    }

    return list as any;
  };

  return (
    <SppModal
      {...props}
      okButtonProps={{ ...(props.okButtonProps ?? {}), disabled: !canOk }}
      onOk={(e) => {
        if (!canOk) return;
        const list = validateAndBuildList();
        if (!list) return;

        props.onUploaded?.(list);
        props.onOk?.(e);

        setFileList([]);
        setRawRows([]);
        setError(null);

        if (fileInputRef.current) fileInputRef.current.value = '';
      }}
      onCancel={(e) => {
        props.onCancel?.(e);

        setFileList([]);
        setRawRows([]);
        setError(null);

        if (fileInputRef.current) fileInputRef.current.value = '';
      }}
    >
      <Space vertical={true} style={{ width: '100%' }}>
        <Typography.Text>{sampleLink}</Typography.Text>

        <Space.Compact style={{ width: '100%' }}>
          <Input readOnly placeholder="엑셀 파일을 선택해 주세요." value={fileList?.[0]?.name ?? ''} />
          <input
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={async (ev) => {
              const file = ev.target.files?.[0];
              if (!file) return;
              setFileList([{ uid: file.name, name: file.name, status: 'done', originFileObj: file } as any]);
              await loadExcel(file);
            }}
          />
          <SppButton
            type="default"
            onClick={() => {
              fileInputRef.current?.click();
            }}
          >
            파일 선택
          </SppButton>
          <SppButton
            type="default"
            disabled={fileList.length === 0}
            onClick={() => {
              setFileList([]);
              setRawRows([]);
              setError(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          >
            제거
          </SppButton>
        </Space.Compact>

        {error ? <Alert type="error" showIcon message={error} /> : null}
      </Space>
    </SppModal>
  );
};

export default ExcelUploadPopup;
