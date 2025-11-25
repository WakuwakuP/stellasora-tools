# 実装リファレンスドキュメント

このディレクトリには、Ridar Gallery の実装時に参照するためのガイドドキュメントが含まれています。

## 📖 ドキュメント一覧

### コンポーネント関連

#### [01. Server Component 実装ガイド](./01-server-components.md)

- Server Component の実装パターン
- データ取得を含む Server Component
- エラーハンドリング
- 認証状態による条件分岐
- 条件付きレンダリング

#### [02. Client Component 実装ガイド](./02-client-components.md)

- Client Component が必要な場合
- State Management パターン
- useEffect、useContext の活用
- Server Component と Client Component の組み合わせ
- パフォーマンス最適化

#### [03. shadcn/ui コンポーネント活用ガイド](./03-ui-components.md)

- 基本的なコンポーネント（Button、Input、Card等）
- レイアウトコンポーネント
- フォームコンポーネント
- ナビゲーションコンポーネント
- 新しいコンポーネントの追加方法

#### [04. スタイリングパターンガイド](./04-styling-patterns.md)

- デザインシステムのベースクラス
- レイアウトパターン
- レスポンシブデザイン
- 状態によるスタイリング
- アニメーションとトランジション

### データ操作関連

#### [05. キャッシュシステムガイド](./05-cache-system.md)

- キャッシュキーの設計原則
- キャッシュタグの設計
- キャッシュの実装パターン
- キャッシュの無効化
- パフォーマンス最適化

#### [06. Server Actions 実装ガイド](./06-server-actions.md)

- CRUD 操作の実装パターン
- 認証と認可
- エラーハンドリング
- バッチ処理・条件付き操作
- バリデーション

#### [07. データ取得パターンガイド](./07-data-fetching.md)

- 基本的な取得パターン
- 条件付き取得・検索機能
- ページネーション
- 集計データの取得
- 関連データの並列取得

### テスト関連

#### [08. テスト環境セットアップガイド](./08-test-setup.md)

- Vitest を使ったテスト環境設定
- グローバルセットアップ
- モック設定（NextAuth、Prisma、キャッシュ）
- テストユーティリティ
- 環境変数の設定

#### [09. コンポーネントテストガイド](./09-component-testing.md)

- Server Component のテスト
- Client Component のテスト
- ユーザーインタラクションのテスト
- 状態管理のテスト
- アクセシビリティのテスト

#### [10. Server Actions テスト実装ガイド](./10-server-actions-testing.md)

- 基本的なテスト構造
- CRUD 操作のテスト
- エラーハンドリングのテスト
- 複雑な操作のテスト
- パフォーマンステスト

#### [11. モック戦略とユーティリティガイド](./11-mocking-strategies.md)

- 外部依存のモック
- 認証関連のモック
- データベースモック
- キャッシュ関連のモック
- データファクトリー

### Storybook関連

#### [12. Storybook 環境設定ガイド](./12-storybook-setup.md)

- Storybook の基本構成
- main.ts と preview.ts の設定
- テーマ切り替えデコレーター
- 認証モック・Prisma モック
- コンポーネント分類

#### [13. UI コンポーネント Story 作成ガイド](./13-ui-stories.md)

- 基本的な Story 構造
- Meta オブジェクトの定義
- Default、Variants、States Story のパターン
- Input、Card、Dialog コンポーネントの Story 例
- アクセシビリティ Story

#### [14. アプリケーションコンポーネント Story 作成ガイド](./14-app-stories.md)

- アプリケーションコンポーネントの Story 構造
- 認証・コンテンツ・イベント関連コンポーネント Story
- フォーム・レイアウトコンポーネント Story
- データ状態別 Story（Loading、Error、Empty）
- action の活用・デコレーターの活用

#### [15. Storybook テストとアクセシビリティガイド](./15-storybook-testing.md)

- インタラクションテスト
- アクセシビリティテスト
- レスポンシブデザインのテスト
- パフォーマンステスト
- ビジュアルリグレッションテスト

## 🎯 実装時の基本方針

### 1. コンポーネント設計

- **Server Component 優先**: 可能な限り Server Component として実装
- **shadcn/ui 活用**: UI は再実装せず shadcn/ui コンポーネントを使用
- **型安全性**: TypeScript の型定義を適切に設定

### 2. データ操作

- **キャッシュ戦略**: 取得パラメータを含むキー設計
- **タグ管理**: 更新影響範囲を考慮したタグ設定
- **無効化**: safeRevalidateTag() による適切なキャッシュ無効化

### 3. テスト

- **包括的テスト**: Server Actions、コンポーネント、ユーザーインタラクション
- **モック活用**: 外部依存は適切にモック
- **エラーケース**: 正常系だけでなくエラーケースもテスト

### 4. ドキュメンテーション

- **Storybook**: コンポーネントの使用例と状態を文書化
- **自動生成**: autodocs タグによる自動ドキュメント生成

## 🚀 クイックスタート

### 新しいコンポーネントの作成手順

1. **コンポーネント実装**

   ```tsx
   // Server Component として作成
   export default async function NewPage() {
     const data = await getDataFromServer();
     return <NewComponent data={data} />;
   }
   ```

2. **データ操作実装**

   ```typescript
   'use server';
   // キャッシュキーとタグを適切に設定
   const cachedFunction = unstable_cache(
     fetchFunction,
     [CacheKeys.newData(userId)],
     { tags: [CacheTags.newData(userId)] }
   );
   ```

3. **テスト作成**

   ```typescript
   // コンポーネントとServer Actionsの両方をテスト
   describe('NewComponent', () => {
     it('should render correctly', () => {
       // テスト実装
     });
   });
   ```

4. **Storybook作成**
   ```typescript
   // 各種状態とバリアントを網羅
   export const Default: Story = {
     args: {
       /* props */
     },
   };
   ```

## 🛠 開発フロー

1. **フォーマット**: コード変更後は必ず `yarn format` を実行
2. **ビルド確認**: `yarn build` でビルドエラーがないことを確認
3. **テスト実行**: `yarn test:run` で全テストが通ることを確認
4. **Storybook確認**: `yarn build-storybook` でストーリーブックがビルドできることを確認

## 📋 チェックリスト

新機能実装時のチェックリスト：

- [ ] Server Component として実装（必要な場合のみ Client Component）
- [ ] shadcn/ui コンポーネントを活用
- [ ] 絶対パス（baseUrl）でのインポート
- [ ] 適切なキャッシュキーとタグの設定
- [ ] Server Actions のエラーハンドリング
- [ ] 包括的なテストの作成
- [ ] Storybook の Story 作成
- [ ] フォーマットの実行（`yarn format`）
- [ ] ビルド確認（`yarn build`）
- [ ] テスト実行（`yarn test:run`）

## 📝 注意事項

- **フォーマット必須**: どんな小さな変更でもフォーマットは必須
- **設定ファイル変更禁止**: 特別な指示がない限り tsconfig.json, next.config.ts などの設定ファイルは変更しない
- **日本語対応**: UI テキスト、エラーメッセージは日本語で記述
