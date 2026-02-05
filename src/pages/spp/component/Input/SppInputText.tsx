import { Input, type InputProps, message } from 'antd';
import type { ClipboardEventHandler, FocusEventHandler, FormEventHandler, KeyboardEvent, KeyboardEventHandler } from 'react';
import { useRef } from 'react';

export interface SppInputValidate {
  regExp: RegExp;
  message: string;
  delayMs?: number;
}

export interface SppInputTextProps extends InputProps {
  validate?: SppInputValidate;
}

function normalizeRegExp(rx: RegExp) {
  return new RegExp(rx.source, rx.flags.replace('g', ''));
}

function makeOppositeRegExp(allowed: RegExp): RegExp | null {
  const m = allowed.source.match(/^\^\[([^\]]+)\]\*\$$/);
  if (!m) return null;
  return new RegExp(`[^${m[1]}]`, 'g');
}

function isNavKey(e: KeyboardEvent<HTMLInputElement>) {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;

  const k = e.key;
  if (k === 'Shift' || k === 'Control' || k === 'Alt' || k === 'Meta' || k === 'CapsLock') return true;

  return k === 'Backspace' || k === 'Delete' || k === 'Tab' || k === 'Enter' || k === 'Escape' || k.startsWith('Arrow') || k === 'Home' || k === 'End';
}

const SppInputText = (props: SppInputTextProps) => {
  const { validate } = props;

  const warnLockRef = useRef(false);
  const lastValidValueRef = useRef<string>(String((props.value ?? props.defaultValue ?? '') as any));

  const allowedRegExp = validate?.regExp ? normalizeRegExp(validate.regExp) : null;
  const oppositeRegExp = allowedRegExp ? makeOppositeRegExp(allowedRegExp) : null;

  const warn = () => {
    if (!validate) return;
    if (warnLockRef.current) return;

    warnLockRef.current = true;
    message.warning(validate.message);

    window.setTimeout(() => {
      warnLockRef.current = false;
    }, validate.delayMs ?? 800);
  };

  const isValidValue = (v: string) => {
    if (!allowedRegExp) return true;
    if (allowedRegExp.test(v)) return true;

    if (oppositeRegExp) {
      return !oppositeRegExp.test(v);
    }

    return false;
  };

  const prevent = (e: any) => {
    e.preventDefault?.();
    e.stopPropagation?.();
    warn();
  };

  const emitChange = (el: HTMLInputElement, nextValue: string) => {
    el.value = nextValue;
    props.onChange?.({ target: el, currentTarget: el } as any);
  };

  const rollbackToLastValid = (el: HTMLInputElement) => {
    const last = lastValidValueRef.current ?? '';
    if ((el.value ?? '') === last) return;
    warn();
    emitChange(el, last);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    props.onKeyDown?.(e);

    if (!allowedRegExp || e.defaultPrevented) return;
    if (isNavKey(e)) return;

    if (e.key === 'Process' || e.key === 'Unidentified') {
      prevent(e);
      return;
    }

    if (e.key.length === 1) {
      const ok = oppositeRegExp ? !oppositeRegExp.test(e.key) : allowedRegExp.test(e.key);
      if (!ok) prevent(e);
    }
  };

  const handleBeforeInput: FormEventHandler<HTMLInputElement> = (e) => {
    props.onBeforeInput?.(e as any);

    if (!allowedRegExp || (e as any).defaultPrevented) return;

    const ne = (e as any).nativeEvent as InputEvent | undefined;
    const data = (ne as any)?.data as string | null | undefined;
    if (!data) return;

    const ok = oppositeRegExp ? !oppositeRegExp.test(data) : allowedRegExp.test(data);
    if (!ok) prevent(e);
  };

  const handlePaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
    props.onPaste?.(e);

    if (!allowedRegExp || e.defaultPrevented) return;

    const text = e.clipboardData.getData('text') ?? '';
    if (!text) return;
    const ok = oppositeRegExp ? !oppositeRegExp.test(text) : allowedRegExp.test(text);
    if (!ok) prevent(e);
  };

  const handleInput: FormEventHandler<HTMLInputElement> = (e) => {
    props.onInput?.(e as any);

    if (!allowedRegExp || (e as any).defaultPrevented) return;

    const el = e.currentTarget as HTMLInputElement;
    const raw = el.value ?? '';

    if (isValidValue(raw)) {
      lastValidValueRef.current = raw;
      return;
    }
    rollbackToLastValid(el);
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    props.onBlur?.(e);

    if (!allowedRegExp) return;

    const el = e.currentTarget as HTMLInputElement;
    const raw = el.value ?? '';

    if (!isValidValue(raw)) {
      rollbackToLastValid(el);
    } else {
      lastValidValueRef.current = raw;
    }
  };

  return (
    <Input
      {...props}
      onKeyDown={handleKeyDown}
      onBeforeInput={handleBeforeInput}
      onPaste={handlePaste}
      onInput={handleInput}
      onBlur={handleBlur}
      inputMode={validate?.regExp?.source.includes('0-9') ? 'numeric' : props.inputMode}
    />
  );
};

export default SppInputText;
