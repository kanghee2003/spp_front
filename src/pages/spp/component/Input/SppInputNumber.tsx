import { InputNumber, type InputNumberProps } from 'antd';
import type { ClipboardEventHandler, KeyboardEvent, KeyboardEventHandler } from 'react';

export interface SppInputNumberProps extends Omit<InputNumberProps<string>, 'formatter' | 'parser'> {
  /** 소수점 허용 여부 */
  allowDecimal?: boolean;
  /** 천단위 콤마 표시 여부 */
  useComma?: boolean;
  /** 소수점 허용 시 소수 자릿수 제한 */
  decimalScale?: number;
}

function addComma(s: string) {
  // "1234567" -> "1,234,567"
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function stripNonDigits(s: string) {
  return s.replace(/[^\d]/g, '');
}

function stripToDecimal(s: string) {
  // 숫자/점만 남기고 점은 1개만 허용
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

const SppInputNumber = (props: SppInputNumberProps) => {
  const { allowDecimal = false, useComma = true, controls = false, decimalScale, onKeyDown, onPaste, ...rest } = props;

  const parser = (v?: string | null) => {
    const raw = (v ?? '').replace(/,/g, '');

    if (!allowDecimal) {
      return stripNonDigits(raw);
    }

    const dec = stripToDecimal(raw);
    return limitDecimalScale(dec, decimalScale);
  };

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
    if (i < 0) {
      return useComma ? addComma(dec) : dec;
    }

    const intPart = dec.slice(0, i);
    const fracPart = dec.slice(i + 1);
    const intFmt = useComma ? addComma(intPart) : intPart;
    return `${intFmt}.${fracPart}`;
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (isNavKey(e)) {
      onKeyDown?.(e);
      return;
    }

    // 소수점 허용이면 '.' 1개만
    if (allowDecimal && e.key === '.') {
      if (e.currentTarget.value.includes('.')) e.preventDefault();
      onKeyDown?.(e);
      return;
    }

    // 숫자만
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

    // 소수점은 1개만
    if (!/^\d+(\.\d+)?$/.test(text)) e.preventDefault();
    onPaste?.(e);
  };

  // allowDecimal=false면 precision=0으로 고정 (소수 입력 자체 불가)
  const precision = allowDecimal ? decimalScale : 0;

  return (
    <InputNumber<string> {...rest} stringMode precision={precision} parser={parser} formatter={formatter} onKeyDown={handleKeyDown} onPaste={handlePaste} />
  );
};

export default SppInputNumber;
