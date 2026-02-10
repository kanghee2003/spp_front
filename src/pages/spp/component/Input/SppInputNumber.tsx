import { InputNumber, type InputNumberProps } from 'antd';
import type { ClipboardEventHandler, KeyboardEvent, KeyboardEventHandler } from 'react';
import { useEffect, useRef } from 'react';

export interface SppInputNumberProps extends Omit<InputNumberProps<number>, 'formatter' | 'parser' | 'stringMode'> {
  /** 소수점 허용 여부 */
  allowDecimal?: boolean;
  /** 천단위 콤마 표시 여부 */
  useComma?: boolean;
  /** 소수점 허용 시 소수 자릿수 제한 */
  decimalScale?: number;
}

function addComma(s: string) {
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function sanitizeText(raw: string, allowDecimal: boolean, decimalScale?: number) {
  const noComma = (raw ?? '').replace(/,/g, '');

  if (!allowDecimal) {
    return noComma.replace(/[^\d]/g, '');
  }

  const cleaned = noComma.replace(/[^\d.]/g, '');
  const i = cleaned.indexOf('.');
  const oneDot = i < 0 ? cleaned : cleaned.slice(0, i + 1) + cleaned.slice(i + 1).replace(/\./g, '');

  if (decimalScale == null) return oneDot;

  const j = oneDot.indexOf('.');
  if (j < 0) return oneDot;

  const intPart = oneDot.slice(0, j);
  const fracPart = oneDot.slice(j + 1).slice(0, Math.max(0, decimalScale));
  return `${intPart}.${fracPart}`;
}

function isNavKey(e: KeyboardEvent<HTMLInputElement>) {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;

  const k = e.key;
  return k === 'Backspace' || k === 'Delete' || k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Tab' || k === 'Enter' || k === 'Home' || k === 'End';
}

function isAllowedInsertedText(text: string, allowDecimal: boolean) {
  if (!text) return true;
  if (!allowDecimal) return /^\d+$/.test(text);

  return text === '.' || /^\d+$/.test(text) || /^\d+(\.\d+)?$/.test(text);
}

const SppInputNumber = (props: SppInputNumberProps) => {
  const { allowDecimal = false, useComma = true, decimalScale, controls = false, onKeyDown, onPaste, onChange, ...rest } = props;

  const inputNumberRef = useRef<any>(null);

  const parser = (v?: string) => {
    const text = sanitizeText(v ?? '', allowDecimal, decimalScale);
    return text ? Number(text) : Number.NaN;
  };

  const formatter = (v?: number | string) => {
    if (v == null) return '';

    const text = sanitizeText(String(v), allowDecimal, decimalScale);
    if (!text) return '';

    if (!allowDecimal) return useComma ? addComma(text) : text;

    const i = text.indexOf('.');
    if (i < 0) return useComma ? addComma(text) : text;

    const intFmt = useComma ? addComma(text.slice(0, i)) : text.slice(0, i);
    return `${intFmt}.${text.slice(i + 1)}`;
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    // composing일 때 key가 Process 등으로 들어오는 케이스가 있어 여기서 막으면 숫자도 안 쳐질 수 있음.
    // 실제 차단은 beforeinput(native)에서 한다.
    if (isNavKey(e)) {
      onKeyDown?.(e);
      return;
    }

    if (!allowDecimal && e.key.length === 1 && !/^\d$/.test(e.key)) e.preventDefault();
    if (allowDecimal && e.key.length === 1 && !/^\d$/.test(e.key) && e.key !== '.') e.preventDefault();

    onKeyDown?.(e);
  };

  const handlePaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
    const text = e.clipboardData.getData('text');

    if (!allowDecimal) {
      if (!/^\d+$/.test(text)) e.preventDefault();
      onPaste?.(e);
      return;
    }

    if (!/^\d+(\.\d+)?$/.test(text)) e.preventDefault();
    onPaste?.(e);
  };

  useEffect(() => {
    const refObj = inputNumberRef.current;

    const root: HTMLElement | null = (refObj?.nativeElement as HTMLElement | undefined) ?? (refObj as HTMLElement | null) ?? null;

    const input = (root?.querySelector('input') as HTMLInputElement | null) ?? (root?.querySelector('.ant-input-number-input') as HTMLInputElement | null);

    if (!input) return;

    const onBeforeInputNative = (ev: Event) => {
      const e = ev as InputEvent;

      // 삭제는 통과
      if (typeof e.inputType === 'string' && e.inputType.startsWith('delete')) return;

      const text = e.data ?? '';

      // 한글/자음/기호 등 차단
      if (text && !isAllowedInsertedText(text, allowDecimal)) {
        e.preventDefault();
        return;
      }

      // '.' 1개만
      if (allowDecimal && text === '.' && input.value.includes('.')) {
        e.preventDefault();
      }
    };

    const onInputNative = () => {
      const raw = input.value ?? '';
      const safe = sanitizeText(raw, allowDecimal, decimalScale);
      if (raw !== safe) input.value = safe;
    };

    input.addEventListener('beforeinput', onBeforeInputNative as any, true);
    input.addEventListener('input', onInputNative, true);

    return () => {
      input.removeEventListener('beforeinput', onBeforeInputNative as any, true);
      input.removeEventListener('input', onInputNative, true);
    };
  }, [allowDecimal, decimalScale]);

  const precision = allowDecimal ? decimalScale : 0;

  return (
    <InputNumber<number>
      {...rest}
      ref={inputNumberRef}
      controls={controls}
      precision={precision}
      parser={parser}
      formatter={formatter}
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onChange={(v) => {
        // number | null
        onChange?.(v);
      }}
    />
  );
};

export default SppInputNumber;
