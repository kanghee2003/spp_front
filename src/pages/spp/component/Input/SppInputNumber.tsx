import { InputNumber, type InputNumberProps } from 'antd';
import type { ClipboardEventHandler, CompositionEventHandler, KeyboardEvent, KeyboardEventHandler } from 'react';
import { useRef } from 'react';

export interface SppInputNumberProps extends Omit<InputNumberProps<string>, 'formatter' | 'parser'> {
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

function stripNonDigits(s: string) {
  return s.replace(/[^\d]/g, '');
}

function stripToDecimal(s: string) {
  const cleaned = s.replace(/[^\d.]/g, '');
  const i = cleaned.indexOf('.');
  if (i < 0) return cleaned;
  return cleaned.slice(0, i + 1) + cleaned.slice(i + 1).replace(/\./g, '');
}

function limitDecimalScale(s: string, scale?: number) {
  if (scale == null) return s;
  const i = s.indexOf('.');
  if (i < 0) return s;
  const intPart = s.slice(0, i);
  const fracPart = s.slice(i + 1).slice(0, Math.max(0, scale));
  return `${intPart}.${fracPart}`;
}

function isNavKey(e: KeyboardEvent<HTMLInputElement>) {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;

  const k = e.key;
  return k === 'Backspace' || k === 'Delete' || k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Tab' || k === 'Enter' || k === 'Home' || k === 'End';
}

function sanitizeValue(input: string, allowDecimal: boolean, decimalScale?: number) {
  const raw = (input ?? '').replace(/,/g, '');

  if (!allowDecimal) {
    return stripNonDigits(raw);
  }

  const dec = stripToDecimal(raw);
  return limitDecimalScale(dec, decimalScale);
}

const SppInputNumber = (props: SppInputNumberProps) => {
  const {
    allowDecimal = false,
    useComma = true,
    controls = false,
    decimalScale,
    onKeyDown,
    onPaste,
    onChange,
    onCompositionStart,
    onCompositionUpdate,
    onCompositionEnd,
    ...rest
  } = props;

  const composingRef = useRef(false);

  const parser = (v?: string | null) => sanitizeValue(v ?? '', allowDecimal, decimalScale);

  const formatter = (v?: string | number | null) => {
    const raw = v == null ? '' : String(v);
    if (!raw) return '';

    const normalized = raw.replace(/,/g, '');

    if (!allowDecimal) {
      const digits = stripNonDigits(normalized);
      return useComma ? addComma(digits) : digits;
    }

    const dec = limitDecimalScale(stripToDecimal(normalized), decimalScale);

    const i = dec.indexOf('.');
    if (i < 0) return useComma ? addComma(dec) : dec;

    const intPart = dec.slice(0, i);
    const fracPart = dec.slice(i + 1);
    const intFmt = useComma ? addComma(intPart) : intPart;
    return `${intFmt}.${fracPart}`;
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    // IME 조합중이면 아예 막기 (한글/일본어 등)
    if ((e as any).isComposing || composingRef.current) {
      e.preventDefault();
      onKeyDown?.(e);
      return;
    }

    if (isNavKey(e)) {
      onKeyDown?.(e);
      return;
    }

    if (allowDecimal && e.key === '.') {
      if (e.currentTarget.value.includes('.')) e.preventDefault();
      onKeyDown?.(e);
      return;
    }

    if (!/^\d$/.test(e.key)) e.preventDefault();
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

  const handleChange = (v: string | null) => {
    // InputNumber는 parser/formatter가 있어도, IME/모바일에서 이상 값이 한번 들어오는 경우가 있음.
    const saniValue = sanitizeValue(v ?? '', allowDecimal, decimalScale);
    onChange?.(saniValue);
  };

  const handleCompositionStart: CompositionEventHandler<HTMLInputElement> = (e) => {
    // 조합 시작 = 한글 입력 시작 -> 차단
    composingRef.current = true;
    e.preventDefault();
    onCompositionStart?.(e);
  };

  const handleCompositionUpdate: CompositionEventHandler<HTMLInputElement> = (e) => {
    // 조합 업데이트도 차단
    e.preventDefault();
    onCompositionUpdate?.(e);
  };

  const handleCompositionEnd: CompositionEventHandler<HTMLInputElement> = (e) => {
    // 조합 종료 후에도 값이 들어올 수 있으니, 즉시 조합 플래그 끄고 차단
    composingRef.current = false;
    e.preventDefault();
    onCompositionEnd?.(e);
  };

  return (
    <InputNumber<string>
      {...rest}
      stringMode
      controls={controls}
      precision={allowDecimal ? decimalScale : 0}
      parser={parser}
      formatter={formatter}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onCompositionStart={handleCompositionStart}
      onCompositionUpdate={handleCompositionUpdate}
      onCompositionEnd={handleCompositionEnd}
      onChange={handleChange}
    />
  );
};

export default SppInputNumber;
