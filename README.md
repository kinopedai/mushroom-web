# キノコ狩り記録システム

## 概要

キノコ狩り愛好家のための採取記録管理システム。Next.js + React + TypeScriptで構築。

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ブラウザで http://localhost:3000 を開く
```

## 技術スタック

- **フレームワーク**: Next.js 15
- **言語**: TypeScript
- **UI**: React 19
- **スタイリング**: SCSS
- **アイコン**: Lucide React
- **状態管理**: React hooks
- **データ永続化**: localStorage
- **コード品質**: ESLint + Prettier
- **型チェック**: TypeScript strict mode

## 開発コマンド

```bash
npm run dev       # 開発サーバー起動
npm run build     # プロダクションビルド
npm run start     # プロダクションサーバー起動
npm run lint      # ESLint実行（チェックのみ）
npm run lint:fix  # ESLint実行（自動修正付き）
```

## コード品質管理

### ESLint + Prettier

- **ESLint**: コード品質とバグ検出
- **Prettier**: コードフォーマット統一
- **設定レベル**: 実務標準（企業レベル）

### 主要なルール

- TypeScript strict mode
- React Hooks最適化
- Import文の自動整理
- 複雑度制限（関数50行以下、ネスト3層以下）
- 未使用変数・import検出

### 開発時の推奨フロー

```bash
# コード修正後
npm run lint:fix  # 自動修正可能な問題を修正
npm run lint      # 残りの問題をチェック
```

## 環境要件

- Node.js 18.0.0 以上
- npm 8.0.0 以上

## 学習目的

このプロジェクトは**リファクタリング学習用**として設計されています

1. **初期状態**: 意図的に悪いコード実装
2. **学習過程**: 段階的なリファクタリング・機能追加
3. **最終目標**: 保守性の高いクリーンなコード

### 学習項目

- コードレビューとリファクタリング技術
- TypeScript型安全性の活用
- React Hooksの最適化
- ESLint/Prettierによる品質管理
- 設計パターンの適用
- 機能追加
