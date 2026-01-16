import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';

import fs from 'node:fs';
import path from 'node:path';

// Boundary lint only: src/pages/<system>/... cannot import src/pages/<otherSystem>/...
const pagesRoot = path.resolve(process.cwd(), 'src/pages');
let pageSystems = [];
try {
  pageSystems = fs
    .readdirSync(pagesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
} catch {
  pageSystems = [];
}

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.npm-cache/**', 'eslint.config.js', 'eslint.boundary.config.js'],
  },

  {
    files: ['src/pages/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      // Needed so alias imports (e.g. "@/pages/..." from tsconfig paths) can be resolved
      // and checked by import/no-restricted-paths.
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // pairwise zones: allow self imports, block cross-system imports
      'import/no-restricted-paths': [
        'error',
        {
          zones: pageSystems.flatMap((fromSystem) =>
            pageSystems
              .filter((targetSystem) => targetSystem !== fromSystem)
              .map((targetSystem) => ({
                from: `./src/pages/${fromSystem}`,
                target: `./src/pages/${targetSystem}`,
                message: `${fromSystem} 시스템 코드는 다른 시스템의 pages 코드를 참조할 수 없습니다. 공용 코드는 shared로 이동하세요.`,
              })),
          ),
        },
      ],
    },
  },
];
