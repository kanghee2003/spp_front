import { useCallback, useRef } from 'react';
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
 * message를 발견하는 순서대로 alert를 띄운다.
 *
 * - 기본: 첫 번째 에러만 1개 띄운다. (사용자 UX 개선)
 * - 가드: 같은 메시지가 연속으로 들어오면 중복 alert를 막는다.
 *
 * 사용 예)
 *   const alertErrors = useAlertFormErrors();
 *   useEffect(() => { alertErrors(formState.errors); }, [formState.errors]);
 */
export function useAlertFormErrors() {
  const { alertMessage } = useMessage();

  // ✅ 동일 메시지 연속 호출 방지 (렌더/validation 반복 시 팝업 도배 방지)
  const lastMessageRef = useRef<string | null>(null);
  const lastShownAtRef = useRef<number>(0);

  return useCallback(
    async (errors: AnyErrors, title?: string) => {
      const messages = collectFormErrorMessages(errors);
      if (messages.length === 0) return;

      const first = messages[0];
      const now = Date.now();

      // ✅ 가드 1) 완전히 동일한 메시지가 연속으로 들어오면 스킵
      // ✅ 가드 2) (옵션) 너무 짧은 시간 내 반복 호출도 스킵 (예: 300ms)
      const TOO_SOON_MS = 300;

      if (lastMessageRef.current === first && now - lastShownAtRef.current < TOO_SOON_MS) {
        return;
      }

      lastMessageRef.current = first;
      lastShownAtRef.current = now;

      await alertMessage(first, title);
    },
    [alertMessage],
  );
}
