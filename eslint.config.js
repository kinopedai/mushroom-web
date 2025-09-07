// ============================================================
// ESLint Flat Config
// ============================================================

import js from "@eslint/js";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import nextPlugin from "@next/eslint-plugin-next";

import { FlatCompat } from "@eslint/eslintrc";
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  // ============================================================
  // 無視（旧 ignorePatterns）
  // eslint.config.js 自身も対象外に追加している
  // ============================================================
  {
    ignores: [
      "node_modules/",
      ".next/",
      "out/",
      "next-env.d.ts",
      "eslint.config.{js,cjs,mjs,ts}",
    ],
  },

  // ============================================================
  // 旧 extends を取り込み（段階移行）
  // ここは compat で旧 extends をまとめて有効化
  // ============================================================
  ...compat.extends(
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:import/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ),

  // ============================================================
  // 共通設定
  // JS/TS 全般に適用されるルール
  // ============================================================
  {
    files: ["**/*.{js,cjs,mjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooks,
      import: importPlugin,
      "@next/next": nextPlugin,
    },
    settings: {
      "import/resolver": {
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
        typescript: {}, // eslint-import-resolver-typescript
      },
      react: { version: "detect" },
    },
    rules: {
      // 一般品質
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      curly: "error",
      "no-debugger": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // React
      "react/react-in-jsx-scope": "off",
      "react/jsx-key": "error",
      "react/self-closing-comp": "error",
      "react/no-unescaped-entities": "error",

      // import 並び順
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },

  // ============================================================
  // TS/TSX（typed rules）
  // 型関連の厳格ルールを適用
  // ============================================================
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.eslint.json"], // 専用 tsconfig
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // no-unused-vars は TS のものに置き換える
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // ============================================================
  // JS/CJS/MJS では TS固有ルールを無効化
  // （TSでしか意味がないルールはOFFにする）
  // ============================================================
  {
    files: ["**/*.{js,cjs,mjs}"],
    rules: {
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // ============================================================
  // 型宣言ファイルは緩める
  // d.ts はあまり厳しくせず柔軟に
  // ============================================================
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
    },
  },

  // ============================================================
  // eslint.config.js を lint する場合の専用ルール
  // （import/order や no-anonymous-export を無効化）
  // 無視設定と合わせて使えば安心
  // ============================================================
  {
    files: ["eslint.config.{js,cjs,mjs,ts}"],
    rules: {
      "import/order": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
];
