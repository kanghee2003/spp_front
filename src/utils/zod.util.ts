import { z } from 'zod';

type Path = Array<string | number>;

interface ValidateRequiredOptions {
  excludePaths?: string[];
  message?: string;
}

const DEFAULT_MESSAGE = '필수 입력 항목이 누락되었습니다.';

const pathToString = (path: Path): string =>
  path.reduce<string>((acc, cur) => {
    if (typeof cur === 'number') {
      return `${acc}[${cur}]`;
    }
    return acc ? `${acc}.${cur}` : cur;
  }, '');

const isEmpty = (v: unknown) => v === null || v === undefined || (typeof v === 'string' && v.trim() === '');

const isExcludedPath = (fullPath: string, excludePaths: string[]) =>
  excludePaths.some((p) => fullPath === p || fullPath.startsWith(`${p}.`) || fullPath.startsWith(`${p}[`));

export const validateRequiredDeep = (value: unknown, ctx: z.RefinementCtx, path: Path = [], options: ValidateRequiredOptions = {}) => {
  const { excludePaths = [], message = DEFAULT_MESSAGE } = options;

  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      validateRequiredDeep(item, ctx, [...path, i], options);
    });
    return;
  }

  if (value && typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      const currentPath = [...path, key];
      const fullPath = pathToString(currentPath);

      if (isExcludedPath(fullPath, excludePaths)) return;

      if (isEmpty(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: currentPath,
          message,
        });
        return;
      }

      validateRequiredDeep(val, ctx, currentPath, options);
    });
  }
};
