import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';

import fs from 'node:fs';
import path from 'node:path';

import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

// src/pages 하위 시스템(1레벨 폴더) 목록을 동적으로 수집해서
// "내 시스템 폴더는 다른 시스템 폴더를 import 할 수 없다" 규칙을 자동 생성한다.
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
  // eslint 자체 설정 파일은 node 전역(process 등)을 사용하므로 lint 대상에서 제외
  { ignores: ['dist/**', 'node_modules/**', '.npm-cache/**', 'eslint.config.js'] },

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
      // (시스템 경계 강제는 eslint.boundary.config.js 로 별도 수행)
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'react-hooks/set-state-in-effect': 'off',

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      //'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'react-hooks/rules-of-hooks': 'off',

      // pages 하위는 시스템(폴더) 경계를 넘어서 import 금지
      // 예: src/pages/spp/** 는 src/pages/etc/** 또는 다른 시스템 폴더를 참조하면 안됨
      'import/no-restricted-paths': [
        'error',
        {
          // NOTE: target 을 src/pages 전체로 걸면 "자기 시스템 내부" 경로도 함께 매칭돼서 오탐이 발생할 수 있음.
          // 따라서 "(from) 내 시스템" -> "(target) 다른 시스템 폴더" 형태로 pairwise zone 을 만든다.
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
      'prettier/prettier': 'warn',
    },
  },
  {
    files: ['src/provider/GlobalAxiosProvider.tsx'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },

  // import/no-restricted-paths 는 resolver 상황에 따라(alias 등) 놓칠 수 있어
  // "@/pages/<otherSystem>/**" 와 같은 alias import 도 확실히 막는다.
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
                message: `${systemKey} 시스템 코드는 다른 시스템의 pages 코드를 참조할 수 없습니다. 공용 코드는 shared로 이동하세요.`,
              },
            ],
          },
        ],
      },
    };
  }),

  prettierConfig,
];
