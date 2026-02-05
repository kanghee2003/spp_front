import type React from 'react';
import { Button, Empty, Input, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useRef, useState } from 'react';
import { generateUuidV4 } from '@/utils/common.util';

const { Text } = Typography;

type AnyRow = Record<string, any>;
const INTERNAL_ROW_KEY = '__rowKey';

function generateKey<T extends AnyRow>(row: T): T {
  if ((row as any)?.[INTERNAL_ROW_KEY]) return row;
  return { ...row, [INTERNAL_ROW_KEY]: generateUuidV4() } as T;
}

function normalizeRowsWithStableKeys<T extends AnyRow>(value: T[], keysRef: React.MutableRefObject<string[]>): T[] {
  const keys = keysRef.current;

  if (keys.length < value.length) {
    while (keys.length < value.length) keys.push(generateUuidV4());
  } else if (keys.length > value.length) {
    keys.splice(value.length);
  }

  return value.map((row, i) => {
    const existing = (row as any)?.[INTERNAL_ROW_KEY];
    const k = existing ? String(existing) : keys[i];
    if (existing && String(existing) === k) return row;
    return { ...row, [INTERNAL_ROW_KEY]: k } as T;
  });
}

/* =========================
 * Clipboard Parsers
 * ========================= */
function parseExcelClipboard(e: React.ClipboardEvent): string[][] {
  const dt = e.clipboardData;
  if (!dt) return [];

  const html = dt.getData('text/html');
  if (html && html.includes('<table')) {
    const grid = parseGridFromHtmlTable(html);
    if (grid.length) return grid;
  }

  const text = dt.getData('text/plain') || '';
  return parseTsvWithQuotesAndNewlines(text);
}

function parseGridFromHtmlTable(html: string): string[][] {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    if (!table) return [];

    const rows: string[][] = [];
    const trList = Array.from(table.querySelectorAll('tr'));

    for (const tr of trList) {
      const cells = Array.from(tr.querySelectorAll('td,th')).map((cell) => {
        const htmlStr = (cell as HTMLElement).innerHTML ?? '';
        const normalizedHtml = htmlStr
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
          .replace(/<p[^>]*>/gi, '')
          .replace(/<\/p>/gi, '');

        const tmp = doc.createElement('div');
        tmp.innerHTML = normalizedHtml;

        return (tmp.textContent ?? '')
          .replace(/\u00a0/g, ' ')
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .split('\u000b')
          .join('\n');
      });

      rows.push(cells);
    }

    while (rows.length && rows[rows.length - 1].every((c) => c === '')) rows.pop();
    return rows;
  } catch {
    return [];
  }
}

function parseTsvWithQuotesAndNewlines(text: string): string[][] {
  const s = (text ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\u000b').join('\n');

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let i = 0;
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = '';
  };

  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  while (i < s.length) {
    const ch = s[i];

    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      if (cell.length === 0) {
        inQuotes = true;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }

    if (ch === '\t') {
      pushCell();
      i += 1;
      continue;
    }

    if (ch === '\n') {
      pushCell();
      pushRow();
      i += 1;
      continue;
    }

    cell += ch;
    i += 1;
  }

  pushCell();
  pushRow();

  while (rows.length && rows[rows.length - 1].every((c) => c === '')) rows.pop();
  return rows;
}

/* =========================
 * Grid Apply
 * ========================= */
function applyGridToRows<T extends AnyRow>(args: {
  rows: T[];
  grid: string[][];
  startRow: number;
  startCol: number;
  colKeys: (keyof T)[];
  createRow: () => T;
}): T[] {
  const { rows, grid, startRow, startCol, colKeys, createRow } = args;

  const next = rows.slice();

  for (let r = 0; r < grid.length; r++) {
    const rowIndex = startRow + r;

    while (rowIndex >= next.length) {
      next.push(generateKey(createRow()));
    }

    const target = { ...next[rowIndex] };

    for (let c = 0; c < grid[r].length; c++) {
      const colIndex = startCol + c;
      if (colIndex < 0 || colIndex >= colKeys.length) continue;

      const key = colKeys[colIndex];
      const raw = grid[r][c];

      (target as any)[key] = raw;
    }

    next[rowIndex] = target;
  }

  return next;
}

export type ExcelPasteUploadColumn<T extends object> = {
  title: React.ReactNode;
  dataIndex: keyof T;
  width?: number | string;
  placeholder?: string;
  visible?: boolean;
};

export type ExcelPasteUploadTableProps<T extends object> = {
  value: T[];
  onChange: (next: T[]) => void;
  columns: ExcelPasteUploadColumn<T>[];
  createRow: () => T;
  defaultAnchor?: { row: number; col: number };
  frozenFirstRowFlag?: boolean;
};

const SppExcelEditTable = <T extends AnyRow>(props: ExcelPasteUploadTableProps<T>) => {
  const { value, onChange, columns, createRow, frozenFirstRowFlag = false } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const keysRef = useRef<string[]>([]);
  const anchorRef = useRef<{ row: number; col: number }>(props.defaultAnchor ?? { row: 0, col: 0 });

  const [rowsState, setRowsState] = useState<T[]>(() => value as T[]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [structVersion, setStructVersion] = useState(0);

  useEffect(() => {
    setRowsState(normalizeRowsWithStableKeys(value as T[], keysRef));
  }, [value]);

  /* =========================
   * Commit 분리
   * ========================= */
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  const commitStructural = (next: T[]) => {
    const normalized = normalizeRowsWithStableKeys(next, keysRef);
    setRowsState(normalized);
    onChange(normalized);

    setStructVersion((v) => v + 1);
  };

  const commitTyping = (next: T[]) => {
    setRowsState(next);

    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = window.setTimeout(() => {
      const normalized = normalizeRowsWithStableKeys(next, keysRef);
      onChange(normalized);
      debounceTimerRef.current = null;
    }, 200);
  };

  const visibleCols = useMemo(() => columns.filter((c) => c.visible !== false), [columns]);
  const colKeys = useMemo(() => visibleCols.map((c) => c.dataIndex), [visibleCols]);

  const firstRowKey = rowsState.length ? String((rowsState[0] as any)[INTERNAL_ROW_KEY]) : null;

  const rowSelection = {
    selectedRowKeys,
    columnWidth: 48,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (record: T) => ({
      disabled: !!frozenFirstRowFlag && firstRowKey != null && String((record as any)[INTERNAL_ROW_KEY]) === firstRowKey,
    }),
  } as const;

  const selectedCount = (() => {
    if (!selectedRowKeys.length) return 0;
    if (!frozenFirstRowFlag) return selectedRowKeys.length;
    if (firstRowKey == null) return selectedRowKeys.length;
    return selectedRowKeys.filter((k) => String(k) !== firstRowKey).length;
  })();

  const tableColumns: ColumnsType<T> = visibleCols.map((c, colIndex) => ({
    title: c.title,
    dataIndex: c.dataIndex as string,
    key: String(c.dataIndex),
    width: c.width,
    onCell: (_row: T, rowIndex?: number) => ({
      onClick: () => {
        if (typeof rowIndex === 'number') {
          anchorRef.current = { row: rowIndex, col: colIndex };
        }
      },
    }),
    render: (_: any, record: T, rowIndex: number) => {
      const key = c.dataIndex;
      const v = String((record as any)[key] ?? '');
      const multiline = v.includes('\n');

      const cellKey = `${String((record as any)[INTERNAL_ROW_KEY])}_${String(key)}_${structVersion}`;

      const setAt = (nv: string) => {
        const next = rowsState.slice();
        next[rowIndex] = { ...next[rowIndex], [key]: nv } as T;
        commitTyping(next);
      };

      return multiline ? (
        <Input.TextArea
          key={cellKey}
          defaultValue={v}
          placeholder={c.placeholder}
          rows={2} // ✅ Virtual 호환: 고정 높이
          onFocus={() => {
            anchorRef.current = { row: rowIndex, col: colIndex };
          }}
          onChange={(e) => setAt(e.target.value)}
        />
      ) : (
        <Input
          key={cellKey}
          defaultValue={v}
          placeholder={c.placeholder}
          onFocus={() => {
            anchorRef.current = { row: rowIndex, col: colIndex };
          }}
          onChange={(e) => setAt(e.target.value)}
        />
      );
    },
  }));

  const onPaste: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    const active = document.activeElement as HTMLElement | null;

    if (!active || !rootRef.current || !rootRef.current.contains(active)) return;

    const tag = active.tagName;
    const isInputLike = tag === 'INPUT' || tag === 'TEXTAREA';
    if (!isInputLike) return;

    const dt = e.clipboardData;
    const plain = dt?.getData('text/plain') || '';
    const html = dt?.getData('text/html') || '';
    if (!plain && !html) return;

    const looksSingle = !/[\t\n\r]/.test(plain);
    const hasHtmlTable = !!html && html.includes('<table');

    if (looksSingle && !hasHtmlTable) return;

    e.preventDefault();

    const grid = parseExcelClipboard(e);
    const anchor = anchorRef.current ?? { row: 0, col: 0 };

    const nextRows = applyGridToRows<T>({
      rows: rowsState,
      grid,
      startRow: anchor.row,
      startCol: anchor.col,
      colKeys,
      createRow: () => generateKey(createRow()),
    });

    commitStructural(nextRows);
  };

  const deleteBtnDisabled = frozenFirstRowFlag ? rowsState.length <= 1 : false;

  return (
    <div ref={rootRef} onPaste={onPaste} style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <Text type="secondary">선택 {selectedCount}건</Text>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            size="small"
            onClick={() => {
              commitStructural([...rowsState, generateKey(createRow())]);
            }}
          >
            행 추가
          </Button>

          <Button
            size="small"
            danger
            disabled={deleteBtnDisabled}
            onClick={() => {
              if (selectedCount <= 0) {
                message.warning('삭제할 행을 체크해 주세요.');
                return;
              }

              const firstKey = firstRowKey;
              const deletable = new Set(selectedRowKeys.map((k) => String(k)).filter((k) => !(frozenFirstRowFlag && firstKey != null && k === firstKey)));

              if (deletable.size === 0) {
                message.warning('삭제할 수 있는 행이 없습니다.');
                return;
              }

              const next = rowsState.filter((row, idx) => {
                if (frozenFirstRowFlag && idx === 0) return true;
                const k = String((row as any)[INTERNAL_ROW_KEY]);
                return !deletable.has(k);
              });

              commitStructural(next);
              setSelectedRowKeys([]);
            }}
          >
            행 삭제
          </Button>
        </div>
      </div>

      <Table<T>
        rowKey={INTERNAL_ROW_KEY as any}
        rowSelection={rowSelection as any}
        columns={tableColumns}
        dataSource={rowsState}
        pagination={false}
        size="small"
        virtual
        scroll={{ y: 520, x: true }}
        locale={{
          emptyText: <Empty description="데이터가 없습니다. '행 추가'로 행을 만든 뒤 입력/붙여넣기 하세요." />,
        }}
      />
    </div>
  );
};

export default SppExcelEditTable;
