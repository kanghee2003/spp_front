import { useCallback } from 'react';
import type { FieldError, FieldErrors } from 'react-hook-form';

import { useMessage } from '@/hook/useMessage';

type AnyErrors = FieldErrors<any> | Record<string, any> | any[] | undefined | null;

function isFieldError(v: any): v is FieldError {
  return !!v && typeof v === 'object' && ('message' in v || 'type' in v);
}

function collectMessages(v: AnyErrors, out: string[]) {
  if (!v) return;

  if (Array.isArray(v)) {
    v.forEach((it) => collectMessages(it as AnyErrors, out));
    return;
  }

  if (isFieldError(v)) {
    if (typeof (v as any).message === 'string' && (v as any).message.trim()) {
      out.push((v as any).message.trim());
    }

    // FieldError 안에 nested error가 섞여있는 케이스도 있어서 안전하게 순회
    Object.keys(v).forEach((k) => {
      if (k === 'message' || k === 'type' || k === 'ref' || k === 'types') return;
      collectMessages((v as any)[k] as AnyErrors, out);
    });
    return;
  }

  if (typeof v === 'object') {
    Object.keys(v as any).forEach((k) => {
      collectMessages((v as any)[k] as AnyErrors, out);
    });
  }
}

export function collectFormErrorMessages(errors: AnyErrors): string[] {
  const out: string[] = [];
  collectMessages(errors, out);

  // 중복 메시지 제거 (순서 유지)
  const seen = new Set<string>();
  return out.filter((m) => {
    if (seen.has(m)) return false;
    seen.add(m);
    return true;
  });
}

/**
 * react-hook-form의 errors(FieldErrors) 전체를 순회하면서
 * message를 발견하는 순서대로 alert를 순차적으로 띄운다.
 *
 * 사용 예)
 *   const alertErrors = useAlertFormErrors();
 *   useEffect(() => { alertErrors(formState.errors); }, [formState.errors]);
 */
export function useAlertFormErrors() {
  const { alertMessage } = useMessage();

  return useCallback(
    async (errors: AnyErrors, title?: string) => {
      const messages = collectFormErrorMessages(errors);
      if (messages.length === 0) return;

      for (const msg of messages) {
        await alertMessage(msg, title);
      }
    },
    [alertMessage],
  );
}
