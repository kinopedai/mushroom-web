module.exports = {
  // このプロジェクトをESLintのルートにする（親ディレクトリ設定は無視）
  root: true,

  // ベースとなる推奨設定
  extends: [
    'next/core-web-vitals', // Next.js 公式推奨（Core Web Vitals含む）
    'plugin:@typescript-eslint/recommended',// TSの基本ルール（非typedルール）
    'plugin:react/recommended', // Reactの推奨ルール
    'plugin:react/jsx-runtime', // React17+の自動JSX: import React不要にする
    'plugin:import/recommended', // importの妥当性チェック
    'prettier' // Prettierと競合するESLintルールを無効化
  ],

  // デフォルトのパーサ（TS対応）。typedルールは overrides 側で有効化する
  parser: '@typescript-eslint/parser',

  plugins: [
    '@typescript-eslint', // TS向け追加ルール群
    'react', // React向けルール
    'import' // import/order など
  ],

  // Lint対象から除外するパス
  ignorePatterns: [
    'node_modules/', // 外部依存
    '.next/', // Nextビルド成果物
    'out/', // 静的出力
    'next-env.d.ts' // Nextが自動生成する宣言ファイル
  ],

  // ファイル種別ごとの設定上書き
  overrides: [
    // 1) TS/TSX: 型情報ありLint（typed rules）を有効化
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        // typedルールに必要。プロジェクトのtsconfigを参照して型解決する
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: __dirname
      },
      rules: {
        // --- TS品質系（実務で嬉しいやつ） ---
        'no-unused-vars': 'off', // JS版は無効にして…
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }
        ], // …TS版で厳格に
        '@typescript-eslint/consistent-type-imports': 'error', // import type の徹底
        '@typescript-eslint/prefer-nullish-coalescing': 'error', // ?? を推奨
        '@typescript-eslint/prefer-optional-chain': 'error', // ?. を推奨
        '@typescript-eslint/no-unnecessary-type-assertion': 'error', // 不要な as を禁止
        '@typescript-eslint/no-explicit-any': 'warn', // any は当面 warn（必要なら後で error に昇格）

        // --- 一般的な品質 ---
        'prefer-const': 'error',
        'no-var': 'error',
        'eqeqeq': ['error', 'always'],
        'curly': 'error',
        'no-debugger': 'error',
        'no-console': ['warn', { allow: ['warn', 'error'] }],

        // --- React ---
        'react/react-in-jsx-scope': 'off', // React17+で不要
        'react/jsx-key': 'error',
        'react/self-closing-comp': 'error',
        'react/no-unescaped-entities': 'error',

        // --- import 並び/改行 ---
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            'newlines-between': 'always',
            alphabetize: { order: 'asc', caseInsensitive: true }
          }
        ]
      }
    },

    // 2) JS/CJS/MJS: JSは「通常Lint」。typedルールは適用しない
    {
      files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      rules: {
        // JSファイルではTS固有ルールを無効化（念のため）
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
      }
    },

    // 3) 型宣言ファイル（.d.ts）は型関連の厳しめを外す（冗長になりやすい）
    {
      files: ['**/*.d.ts'],
      rules: {
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off'
      }
    }
  ],

  settings: {
    // import の解決（TSパスもOKにする）
    'import/resolver': {
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      typescript: {} // eslint-import-resolver-typescript を使用
    },
    // Reactバージョン自動検出
    react: { version: 'detect' }
  }
};
