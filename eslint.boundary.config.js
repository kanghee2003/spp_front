import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// Boundary lint only:
// src/pages/<system>/... can import its own src/pages/<system>/...
// src/pages/<system>/... cannot import another src/pages/<otherSystem>/...
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

const basePageConfig = {
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
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
};

function createBoundaryConfig(systemKey) {
  const otherSystems = pageSystems.filter((targetSystem) => targetSystem !== systemKey);

  return {
    files: [`src/pages/${systemKey}/**/*.{ts,tsx}`],
    ...basePageConfig,
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: otherSystems.map((otherSystem) => ({
            target: `./src/pages/${systemKey}`,
            from: `./src/pages/${otherSystem}`,
            message: `${systemKey} 시스템 코드는 ${otherSystem} 시스템의 pages 코드를 참조할 수 없습니다. 공용 코드는 shared로 이동하세요.`,
          })),
        },
      ],

      // Alias imports, e.g. @/pages/etc/..., are blocked per source system.
      // Self imports, e.g. SPP -> @/pages/spp/..., are allowed.
      'no-restricted-imports': [
        'error',
        {
          patterns: otherSystems.map((otherSystem) => ({
            group: [`@/pages/${otherSystem}/**`, `src/pages/${otherSystem}/**`],
            message: `${systemKey} 시스템 코드는 ${otherSystem} 시스템의 pages 코드를 참조할 수 없습니다. 공용 코드는 shared로 이동하세요.`,
          })),
        },
      ],
    },
  };
}

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.npm-cache/**', 'eslint.config.js', 'eslint.boundary.config.js'],
  },

  ...pageSystems.map(createBoundaryConfig),
];
