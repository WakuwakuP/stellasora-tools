# Copilot Instructions

このドキュメントは、GitHub Copilotがこのリポジトリでサポートする際に参照するための指針です。

## コンテキスト別の指示

### 🤖 コード生成・PR作成時のみ

**※以下の指示はコードを生成する場合、またはPRを作成する場合にのみ適用してください。コードレビュー時には適用しません。**

#### 必須事項

1. **指示がない場合のconfigの変更不可**: 特別に指示がない場合に tsconfig.json next.config.ts など設定に関わるファイルを編集しないでください。
2. **PRやコメントを日本語にする**
3. **【重要】コード変更後は必ずフォーマットを実行する**: 任意のファイルを変更した後は、**必ず** `yarn format` を実行してください。PRを作成する前に必ず `yarn format:check` でフォーマットが正しく適用されていることを確認してください。
4. **baseUrlを使った絶対パスでのインポート**: `tsconfig.json`で`baseUrl: "./src"`が設定されているため、src配下のファイルをインポートする際は相対パスではなく絶対パスを使用してください。
5. **【重要】Linear Issue IDのPRタイトルへの自動付与**: 作業開始時および PR作成/更新時は、必ずLinear Issue IDをPRタイトルの先頭に付けてください。

   **実行手順**:
   1. **作業開始時（最優先）**: `get_issue_comments`を使ってissue commentを確実に取得してLinear Issue IDを抽出
   2. **Linear botコメントの形式**: `<p><a href="https://linear.app/.../issue/[PROJECT]-###/...">[PROJECT]-### タイトル</a></p>`
   3. **抽出パターン**: `[A-Z]+-\d+` 形式で Linear Issue ID を抽出
   4. **PR title更新**: 見つかったIDを必ずPRタイトルの先頭に付ける

   **更新タイミング**:
   - 作業開始時に即座に実行（report_progressの1回目で必ず更新）
   - プランニング後のPR本文更新時にも確認・更新

#### フォーマットの徹底

コードの変更を行った場合は、**どんな小さな変更でも**、以下の手順を必ず実行してください：

1. **変更後にフォーマットを実行**:

   ```bash
   yarn format
   ```

2. **フォーマット確認**:

   ```bash
   yarn format:check
   ```

   このコマンドが成功することを確認してからコミットしてください。

3. **リントチェック**:
   ```bash
   yarn lint
   ```

フォーマットが適用されていないコードは受け入れられません。必ずこの手順を守ってください。

#### ビルド・テスト要件

変更を加えた後は、必ず以下のコマンドが正常に動作し、ビルドが成功する状態でコミットを作成して下さい。

**⚠️ 重要**: いかなる変更を行った場合でも、最初に必ず `yarn format` を実行してからビルドやテストに進んでください。

##### 必須実行項目（この順序で実行）

1. **フォーマット**

   ```bash
   yarn format
   ```

2. **ビルド**

   ```bash
   yarn build
   ```

3. **テスト**

   ```bash
   yarn test
   ```

4. **Storybookビルド**
   ```bash
   yarn build-storybook
   ```

### 👀 コードレビュー時のみ

**※以下の指示はコードレビューを行う場合にのみ適用してください。コード生成時には適用しません。**

- TypeScriptの型安全性を確認する
- パフォーマンスへの影響を評価する
- セキュリティ上の問題がないか確認する
- コードの可読性と保守性を評価する
- shadcn/uiコンポーネントの適切な使用を確認する
- baseUrlを使った絶対パスインポートが正しく使用されているか確認する

## 共通事項（全てのコンテキストで適用）

### UI コンポーネントライブラリ

このプロジェクトでは **shadcn/ui** を導入しています。

#### 推奨事項

1. **既存のコンポーネントを優先使用**: 新しいUIを作成する際は、まず上記のshadcn/uiコンポーネントの使用を検討してください
2. **一貫したスタイリング**: カスタムスタイルが必要な場合も、shadcn/uiのデザインシステムに合わせてください
3. **アクセシビリティ**: shadcn/uiコンポーネントは既にアクセシビリティが考慮されているため、カスタマイズする際もこれを維持してください

#### 新しいコンポーネントの追加

新しいshadcn/uiコンポーネントが必要な場合は、以下のコマンドを実行してください。

例) 必要なコンポーネント button

```bash
yarn dlx shadcn@latest add button
```

### 画面の作成

**事前作成済みのデザインを参照する**: /v0/\* に事前に作成したUIの実装があります。画面の作成をするときは同じ見た目になるようにしてください。

### CI チェック項目

Actionsが自動実行されないため、以下のCIチェック項目を手動で確認してください：

#### Test

```bash
yarn test:run
```

#### Lint & Format

```bash
yarn lint
yarn format:check
```

#### Chromatic (Storybookビルドチェックのみ)

```bash
yarn build-storybook
```

### ドキュメント・ナレッジベース

実装時に参照するための包括的なドキュメントを `/docs/knowledge/` に作成しています。

#### コンポーネント関連

- [01-server-components.md](/docs/knowledge/01-server-components.md) - Server Component の実装パターン、エラーハンドリング、条件付きレンダリング
- [02-client-components.md](/docs/knowledge/02-client-components.md) - Client Component の実装、State Management、React Hooks の活用
- [03-ui-components.md](/docs/knowledge/03-ui-components.md) - shadcn/ui コンポーネントの使用例、レイアウト、フォーム
- [04-styling-patterns.md](/docs/knowledge/04-styling-patterns.md) - Tailwind CSS スタイリング、レスポンシブデザイン、アニメーション

#### データ操作関連

- [05-cache-system.md](/docs/knowledge/05-cache-system.md) - キャッシュシステムの設計、CacheKeys と CacheTags、無効化パターン
- [06-server-actions.md](/docs/knowledge/06-server-actions.md) - Server Actions の CRUD 実装、認証・認可、エラーハンドリング
- [07-data-fetching.md](/docs/knowledge/07-data-fetching.md) - データ取得パターン、検索、ページネーション、集計処理

#### テスト関連

- [08-test-setup.md](/docs/knowledge/08-test-setup.md) - Vitest テスト環境設定、モック設定
- [09-component-testing.md](/docs/knowledge/09-component-testing.md) - React コンポーネントのテスト手法
- [10-server-actions-testing.md](/docs/knowledge/10-server-actions-testing.md) - Server Actions のテスト実装
- [11-mocking-strategies.md](/docs/knowledge/11-mocking-strategies.md) - モック戦略とテストユーティリティ

#### Storybook関連

- [12-storybook-setup.md](/docs/knowledge/12-storybook-setup.md) - Storybook 環境設定と基本構造
- [13-ui-stories.md](/docs/knowledge/13-ui-stories.md) - UI コンポーネントの Story 作成
- [14-app-stories.md](/docs/knowledge/14-app-stories.md) - アプリケーションコンポーネントの Story 作成
- [15-storybook-testing.md](/docs/knowledge/15-storybook-testing.md) - Storybook でのテストとアクセシビリティ

#### 概要

- [README.md](/docs/knowledge/README.md) - 実装方針、クイックスタート、開発フロー

### 参照ガイドライン

#### 参照タイミング

- **実装時には関連するドキュメントを必ず参照する**
  - コンポーネント作成時：コンポーネント関連ドキュメント（01-04）
  - データ操作実装時：データ操作関連ドキュメント（05-07）
  - テスト作成時：テスト関連ドキュメント（08-11）
  - Storybook 作成時：Storybook関連ドキュメント（12-15）

#### 参照時の出力フォーマット

- ドキュメントを参照したら、以下のフォーマットで出力すること：

  ```
  📖{ドキュメント名}を読み込みました
  ```

  例：

  ```
  📖Server Component 実装ガイドを読み込みました
  📖キャッシュシステムガイドを読み込みました
  📖テスト実装ガイドを読み込みました
  ```
