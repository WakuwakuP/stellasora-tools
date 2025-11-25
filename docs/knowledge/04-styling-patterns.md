# スタイリングパターンガイド

## 基本方針

shadcn/ui のデザインシステムに従った Tailwind CSS のクラス名を使用し、一貫性のあるスタイリングを実現する。

## デザインシステムのベースクラス

### 背景色

```tsx
export function BackgroundExamples() {
  return (
    <div className="space-y-4">
      <div className="bg-background p-4">
        メインの背景色（通常は白またはダーク）
      </div>
      <div className="bg-card p-4">カード背景色</div>
      <div className="bg-muted p-4">ミュート背景色（グレー系）</div>
      <div className="bg-primary text-primary-foreground p-4">
        プライマリ背景色
      </div>
    </div>
  );
}
```

### テキスト色

```tsx
export function TextColorExamples() {
  return (
    <div className="space-y-2">
      <p className="text-foreground">メインテキスト色</p>
      <p className="text-muted-foreground">ミュートテキスト色</p>
      <p className="text-primary">プライマリテキスト色</p>
      <p className="text-destructive">エラーテキスト色</p>
    </div>
  );
}
```

## レイアウトパターン

### コンテナとスペーシング

```tsx
export function LayoutExample() {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-2xl font-bold">ページタイトル</h1>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-semibold">セクション 1</h2>
              <p className="text-muted-foreground">内容</p>
            </div>
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-semibold">セクション 2</h2>
              <p className="text-muted-foreground">内容</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### フレックスレイアウト

```tsx
export function FlexLayoutExamples() {
  return (
    <div className="space-y-6">
      {/* 横並び（中央寄せ） */}
      <div className="flex items-center justify-center space-x-4">
        <span>左</span>
        <span>中央</span>
        <span>右</span>
      </div>

      {/* 横並び（両端寄せ） */}
      <div className="flex items-center justify-between">
        <span>左寄せ</span>
        <span>右寄せ</span>
      </div>

      {/* 縦並び */}
      <div className="flex flex-col space-y-2">
        <div>アイテム 1</div>
        <div>アイテム 2</div>
        <div>アイテム 3</div>
      </div>
    </div>
  );
}
```

### グリッドレイアウト

```tsx
export function GridLayoutExamples() {
  return (
    <div className="space-y-8">
      {/* 基本的なグリッド */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card rounded-lg border p-4">アイテム 1</div>
        <div className="bg-card rounded-lg border p-4">アイテム 2</div>
        <div className="bg-card rounded-lg border p-4">アイテム 3</div>
      </div>

      {/* 複雑なグリッド */}
      <div className="grid grid-cols-12 gap-4">
        <div className="bg-card col-span-12 rounded-lg border p-4 md:col-span-8">
          メインコンテンツ
        </div>
        <div className="bg-card col-span-12 rounded-lg border p-4 md:col-span-4">
          サイドバー
        </div>
      </div>
    </div>
  );
}
```

## コンポーネントスタイリング

### カードコンポーネントのスタイリング

```tsx
export function StyledCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-lg border shadow-sm transition-shadow hover:shadow-md">
      <div className="p-6">
        <h3 className="text-foreground mb-4 text-lg font-semibold">{title}</h3>
        <div className="text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
```

### ボタンのカスタムスタイリング

```tsx
import { Button } from 'components/ui/button';

export function CustomButton() {
  return (
    <div className="space-x-2">
      {/* gradientボタン */}
      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
        グラデーションボタン
      </Button>

      {/* 影付きボタン */}
      <Button className="shadow-lg transition-shadow hover:shadow-xl">
        影付きボタン
      </Button>

      {/* カスタムサイズ */}
      <Button className="px-8 py-3 text-lg">大きなボタン</Button>
    </div>
  );
}
```

## レスポンシブデザイン

### ブレークポイントの活用

```tsx
export function ResponsiveComponent() {
  return (
    <div className="// モバイル: padding 1rem // sm以上: padding 1.5rem // md以上: padding 2rem // lg以上: padding 3rem p-4 sm:p-6 md:p-8 lg:p-12">
      <h1 className="// モバイル: 20px // sm以上: 24px // md以上: 30px // lg以上: 36px text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
        レスポンシブタイトル
      </h1>

      <div className="// モバイル: 1列 // sm以上: 2列 // lg以上: 3列 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* グリッドアイテム */}
      </div>
    </div>
  );
}
```

### モバイルファーストアプローチ

```tsx
export function MobileFirstExample() {
  return (
    <div className="// モバイル: 縦並び // md以上: 横並び // モバイル: 縦方向スペース // md以上: 縦方向スペースなし // md以上: 横方向スペース flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-6">
      <div className="flex-1">メインコンテンツ</div>
      <div className="w-full md:w-64">サイドバー</div>
    </div>
  );
}
```

## 状態によるスタイリング

### ホバー・フォーカス・アクティブ状態

```tsx
export function InteractiveStyles() {
  return (
    <div className="space-y-4">
      <button className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary active:bg-primary/80 rounded-md px-4 py-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
        インタラクティブボタン
      </button>

      <div className="bg-card hover:border-primary/50 cursor-pointer rounded-lg border p-4 transition-all duration-200 hover:shadow-md">
        ホバー可能なカード
      </div>
    </div>
  );
}
```

### 条件付きスタイリング

```tsx
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';

  const statusClasses = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status]}`}>
      {status === 'active' && 'アクティブ'}
      {status === 'inactive' && '非アクティブ'}
      {status === 'pending' && '保留中'}
    </span>
  );
}
```

## アニメーションとトランジション

### 基本的なトランジション

```tsx
export function AnimatedComponents() {
  return (
    <div className="space-y-4">
      {/* フェードイン効果 */}
      <div className="animate-in fade-in bg-card rounded-lg border p-4 opacity-0 duration-500">
        フェードインコンテンツ
      </div>

      {/* スライドイン効果 */}
      <div className="animate-in slide-in-from-right bg-card translate-x-full rounded-lg border p-4 duration-300">
        スライドインコンテンツ
      </div>

      {/* スケール効果 */}
      <div className="bg-card cursor-pointer rounded-lg border p-4 transition-transform duration-200 hover:scale-105">
        ホバーでスケール
      </div>
    </div>
  );
}
```

### ローディング状態

```tsx
export function LoadingStates() {
  return (
    <div className="space-y-4">
      {/* スピナー */}
      <div className="flex items-center space-x-2">
        <div className="border-primary h-4 w-4 animate-spin rounded-full border-b-2"></div>
        <span>読み込み中...</span>
      </div>

      {/* スケルトン */}
      <div className="space-y-3">
        <div className="bg-muted h-4 animate-pulse rounded"></div>
        <div className="bg-muted h-4 w-3/4 animate-pulse rounded"></div>
        <div className="bg-muted h-4 w-1/2 animate-pulse rounded"></div>
      </div>

      {/* パルス効果 */}
      <div className="bg-muted h-32 w-full animate-pulse rounded-lg"></div>
    </div>
  );
}
```

## フォームスタイリング

### 一貫性のあるフォームレイアウト

```tsx
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Button } from 'components/ui/button';

export function FormStyling() {
  return (
    <form className="mx-auto max-w-md space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          メールアドレス
        </Label>
        <Input
          id="email"
          type="email"
          className="w-full"
          placeholder="your@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          パスワード
        </Label>
        <Input id="password" type="password" className="w-full" />
      </div>

      <Button type="submit" className="w-full">
        ログイン
      </Button>
    </form>
  );
}
```

## エラー状態とバリデーション

```tsx
interface InputFieldProps {
  label: string;
  error?: string;
  // その他のプロパティ
}

export function InputField({ label, error, ...props }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <Label
        className={`text-sm font-medium ${error ? 'text-destructive' : ''}`}
      >
        {label}
      </Label>
      <Input
        className={`w-full ${error ? 'border-destructive focus:ring-destructive' : ''}`}
        {...props}
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
```

## ダークモード対応

```tsx
export function DarkModeExample() {
  return (
    <div className="bg-background text-foreground dark:bg-background dark:text-foreground">
      {/* デザインシステムの色を使用すれば自動的にダークモード対応 */}
      <div className="bg-card rounded-lg border p-4">
        <h2 className="text-foreground">タイトル</h2>
        <p className="text-muted-foreground">説明文</p>
      </div>
    </div>
  );
}
```

## パフォーマンス最適化

### 効率的なクラス名の使用

```tsx
// ❌ 動的なクラス名の組み立て（バンドルサイズ増加）
const dynamicClass = `bg-${color}-500 text-${textColor}-900`;

// ✅ 事前定義されたバリアント
const variants = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
};

export function OptimizedComponent({
  variant = 'primary',
}: {
  variant: keyof typeof variants;
}) {
  return (
    <div className={`rounded px-4 py-2 ${variants[variant]}`}>コンテンツ</div>
  );
}
```
