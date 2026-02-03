import type { ColumnsType } from 'antd/es/table';
import { Tooltip } from 'antd';
import type React from 'react';
import { Children, useLayoutEffect, useRef, useState } from 'react';

type SppTdProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  children?: React.ReactNode;
};

function getCellText(children: React.ReactNode): string | null {
  if (children == null) return '';

  const arr = Children.toArray(children);

  let out = '';
  for (const it of arr) {
    if (it == null) continue;

    if (typeof it === 'string' || typeof it === 'number') {
      out += String(it);
      continue;
    }

    return null;
  }

  return out;
}

function buildEllipsisOption(v: any) {
  if (v === true) return { showTitle: false };
  if (typeof v === 'object' && v) return { showTitle: false, ...v };
  return { showTitle: false };
}

export function withEllipsisNoTitle<T extends object = any>(columns: ColumnsType<T>): ColumnsType<T> {
  const mapColumns = (cols: any[]): any[] => {
    return cols.map((col) => {
      if (!col) return col;

      if (Array.isArray(col.children) && col.children.length > 0) {
        return { ...col, children: mapColumns(col.children) };
      }

      return {
        ...col,
        ellipsis: buildEllipsisOption(col.ellipsis),
      };
    });
  };

  return mapColumns(columns as any) as any;
}

export const SppEllipsisTooltipCell = (props: SppTdProps) => {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const [overflow, setOverflow] = useState(false);

  const text = getCellText(props.children);

  useLayoutEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const measure = () => {
      setOverflow(el.scrollWidth > el.clientWidth + 1);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => ro.disconnect();
  }, [text]);

  return text ? (
    <td {...props}>
      <div className="spp-cell-wrap">
        <Tooltip title={text} open={overflow ? undefined : false} destroyOnHidden getPopupContainer={() => document.body}>
          <span ref={spanRef} className="spp-cell-ellipsis">
            {text}
          </span>
        </Tooltip>
      </div>
    </td>
  ) : (
    <td {...props} />
  );
};
