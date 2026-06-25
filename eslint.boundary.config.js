import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// Boundary lint only:
// 1. src/pages/<system>/... cannot import src/pages/<otherSystem>/...
// 2. src 하위의 공통/기반 영역은 src/pages/** 를 import할 수 없다.
// 3. src/apps/portal 은 src/pages/** 를 import할 수 없다.
// 4. src/apps/<system> 은 자기 pages만 허용하고 다른 system pages는 import할 수 없다.
const srcRoot = path.resolve(process.cwd(), 'src');
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

let srcChildDirs = [];
try {
  srcChildDirs = fs
    .readdirSync(srcRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
} catch {
  srcChildDirs = [];
}

const commonSrcDirs = srcChildDirs.filter((dir) => !['apps', 'pages'].includes(dir));

const lifecycleEvent = process.env.npm_lifecycle_event ?? '';
const targetSystemKey = lifecycleEvent.startsWith('lint:boundary:')
  ? lifecycleEvent.replace('lint:boundary:', '')
  : null;

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

const pagesImportPatterns = ['@/pages/**', 'src/pages/**', '../pages/**', '../../pages/**', '../../../pages/**', '../../../../pages/**'];

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
            message: `${systemKey} 시스템 코드는 ${otherSystem} 시스템의 pages 코드를 참조할 수 없습니다.`,
          })),
        },
      ],

      'no-restricted-imports': [
        'error',
        {
          patterns: otherSystems.map((otherSystem) => ({
            group: [`@/pages/${otherSystem}/**`, `src/pages/${otherSystem}/**`],
            message: `${systemKey} 시스템 코드는 ${otherSystem} 시스템의 pages 코드를 참조할 수 없습니다.`,
          })),
        },
      ],
    },
  };
}

function createAppBoundaryConfig(systemKey) {
  const otherSystems = pageSystems.filter((targetSystem) => targetSystem !== systemKey);

  return {
    files: [`src/apps/${systemKey}/**/*.{ts,tsx}`],
    ...basePageConfig,
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: otherSystems.map((otherSystem) => ({
            target: `./src/apps/${systemKey}`,
            from: `./src/pages/${otherSystem}`,
            message: `${systemKey} app 영역에서는 ${otherSystem} 시스템의 pages 코드를 참조할 수 없습니다.`,
          })),
        },
      ],

      'no-restricted-imports': [
        'error',
        {
          patterns: otherSystems.map((otherSystem) => ({
            group: [`@/pages/${otherSystem}/**`, `src/pages/${otherSystem}/**`],
            message: `${systemKey} app 영역에서는 ${otherSystem} 시스템의 pages 코드를 import할 수 없습니다.`,
          })),
        },
      ],
    },
  };
}

const commonAreaBoundaryConfig =
  commonSrcDirs.length > 0
    ? {
        files: commonSrcDirs.map((dir) => `src/${dir}/**/*.{ts,tsx}`),
        ...basePageConfig,
        rules: {
          'import/no-restricted-paths': [
            'error',
            {
              zones: commonSrcDirs.map((dir) => ({
                target: `./src/${dir}`,
                from: './src/pages',
                message: 'pages 이외의 공통/기반 영역에서는 pages 하위 업무 코드를 참조할 수 없습니다.',
              })),
            },
          ],

          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: pagesImportPatterns,
                  message: 'pages 이외의 공통/기반 영역에서는 pages 하위 업무 코드를 import할 수 없습니다.',
                },
              ],
            },
          ],
        },
      }
    : null;

const portalBoundaryConfig = {
  files: ['src/apps/portal/**/*.{ts,tsx}'],
  ...basePageConfig,
  rules: {
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/apps/portal',
            from: './src/pages',
            message: 'portal 영역에서는 pages 하위 업무 코드를 참조할 수 없습니다.',
          },
        ],
      },
    ],

    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: pagesImportPatterns,
            message: 'portal 영역에서는 pages 하위 업무 코드를 import할 수 없습니다.',
          },
        ],
      },
    ],
  },
};

const targetIgnorePatterns =
  targetSystemKey && pageSystems.includes(targetSystemKey)
    ? [
        ...pageSystems
          .filter((systemKey) => systemKey !== targetSystemKey)
          .map((systemKey) => `src/pages/${systemKey}/**/*`),
        ...pageSystems
          .filter((systemKey) => systemKey !== targetSystemKey)
          .map((systemKey) => `src/apps/${systemKey}/**/*`),
        'src/apps/portal/**/*',
      ]
    : [];

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.npm-cache/**',
      'eslint.config.js',
      'eslint.boundary.config.js',
      ...targetIgnorePatterns,
    ],
  },

  ...pageSystems.map(createBoundaryConfig),

  ...pageSystems.map(createAppBoundaryConfig),

  portalBoundaryConfig,

  ...(commonAreaBoundaryConfig ? [commonAreaBoundaryConfig] : []),
];
