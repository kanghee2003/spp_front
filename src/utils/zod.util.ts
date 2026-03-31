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

const isEmpty = (value: unknown): boolean => value === null || value === undefined || (typeof value === 'string' && value.trim() === '');

const isExcludedPath = (fullPath: string, excludePaths: string[]): boolean => {
  const lastKey = fullPath.split('.').pop();

  return excludePaths.some((p) => {
    if (fullPath === p || fullPath.startsWith(`${p}.`) || fullPath.startsWith(`${p}[`)) {
      return true;
    }

    if (lastKey === p) {
      return true;
    }

    return false;
  });
};

export const validateRequiredDeep = (value: unknown, ctx: z.RefinementCtx, path: Path = [], options: ValidateRequiredOptions = {}): void => {
  const { excludePaths = [], message = DEFAULT_MESSAGE } = options;

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      validateRequiredDeep(item, ctx, [...path, index], options);
    });
    return;
  }

  if (value && typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      const currentPath = [...path, key];
      const fullPath = pathToString(currentPath);

      if (isExcludedPath(fullPath, excludePaths)) {
        return;
      }

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
