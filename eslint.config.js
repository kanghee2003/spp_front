import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

// src/pages 하위 시스템(1레벨 폴더) 목록을 동적으로 수집해서
// 시스템 간 pages 참조 금지 규칙을 자동 생성한다.
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

// 공통/기반 영역은 pages 업무 코드를 참조하면 안 된다.
// apps/pages는 별도 규칙으로 처리한다.
const commonSrcDirs = srcChildDirs.filter((dir) => !['apps', 'pages'].includes(dir));

const pageBoundaryZones = pageSystems.flatMap((systemKey) =>
  pageSystems
    .filter((otherSystem) => otherSystem !== systemKey)
    .map((otherSystem) => ({
      target: `./src/pages/${systemKey}`,
      from: `./src/pages/${otherSystem}`,
      message: `${systemKey} 시스템 코드는 ${otherSystem} 시스템의 pages 코드를 참조할 수 없습니다.`,
    })),
);

const commonBoundaryZones = commonSrcDirs.map((dir) => ({
  target: `./src/${dir}`,
  from: './src/pages',
  message: 'pages 이외의 공통/기반 영역에서는 pages 하위 업무 코드를 참조할 수 없습니다.',
}));

const portalBoundaryZone = {
  target: './src/apps/portal',
  from: './src/pages',
  message: 'portal 영역에서는 pages 하위 업무 코드를 참조할 수 없습니다.',
};

const appBoundaryZones = pageSystems.flatMap((systemKey) =>
  pageSystems
    .filter((otherSystem) => otherSystem !== systemKey)
    .map((otherSystem) => ({
      target: `./src/apps/${systemKey}`,
      from: `./src/pages/${otherSystem}`,
      message: `${systemKey} app 영역에서는 ${otherSystem} 시스템의 pages 코드를 참조할 수 없습니다.`,
    })),
);

const pagesImportPatterns = ['@/pages/**', 'src/pages/**', '../pages/**', '../../pages/**', '../../../pages/**', '../../../../pages/**'];

export default [
  // eslint 자체 설정 파일은 node 전역(process 등)을 사용하므로 lint 대상에서 제외
  { ignores: ['dist/**', 'node_modules/**', '.npm-cache/**', 'eslint.config.js', 'eslint.boundary.config.js'] },

  js.configs.recommended,

  {
    files: ['**/*.ts', '**/*.tsx'],
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
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      // tsconfig paths("@/..." 등) resolve 를 위해 필요
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // 프로토/샘플 단계에서는 any/빈 interface 패턴이 자주 등장하므로 에디터 빨간줄(규칙 위반)만 제거한다.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'react-hooks/set-state-in-effect': 'off',

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      //'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',

      // import/no-restricted-paths는 실제 resolved path 기준으로 금지한다.
      // 1) pages 하위 시스템 간 참조 금지
      // 2) pages 이외 공통/기반 영역에서 pages 참조 금지
      // 3) portal에서 pages 참조 금지
      // 4) apps/<system>에서는 다른 시스템 pages 참조 금지
      'import/no-restricted-paths': [
        'error',
        {
          zones: [...pageBoundaryZones, ...commonBoundaryZones, portalBoundaryZone, ...appBoundaryZones],
        },
      ],
      'prettier/prettier': 'warn',
    },
  },

  // pages 하위 시스템 간 alias import 금지
  ...pageSystems.map((systemKey) => {
    const others = pageSystems.filter((k) => k !== systemKey);
    const blocked = others.flatMap((k) => [`@/pages/${k}/**`, `src/pages/${k}/**`]);

    return {
      files: [`src/pages/${systemKey}/**/*.{ts,tsx}`],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: blocked,
                message: `${systemKey} 시스템 코드는 다른 시스템의 pages 코드를 참조할 수 없습니다.`,
              },
            ],
          },
        ],
      },
    };
  }),

  // pages 이외 공통/기반 영역에서 pages alias/relative import 금지
  ...(commonSrcDirs.length > 0
    ? [
        {
          files: commonSrcDirs.map((dir) => `src/${dir}/**/*.{ts,tsx}`),
          rules: {
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
        },
      ]
    : []),

  // portal에서는 pages 전체 import 금지
  {
    files: ['src/apps/portal/**/*.{ts,tsx}'],
    rules: {
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
  },

  // apps/<system>에서는 자기 pages만 허용하고 다른 시스템 pages는 금지
  ...pageSystems.map((systemKey) => {
    const others = pageSystems.filter((k) => k !== systemKey);
    const blocked = others.flatMap((k) => [`@/pages/${k}/**`, `src/pages/${k}/**`]);

    return {
      files: [`src/apps/${systemKey}/**/*.{ts,tsx}`],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: blocked,
                message: `${systemKey} app 영역에서는 다른 시스템의 pages 코드를 import할 수 없습니다.`,
              },
            ],
          },
        ],
      },
    };
  }),

  prettierConfig,
];
