# UI コンポーネント Story 作成ガイド

## 基本的な Story 構造

### Meta オブジェクトの定義

```typescript
// src/components/ui/button.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button', // Storybook 内での階層
  component: Button, // 対象コンポーネント
  tags: ['autodocs'], // 自動ドキュメント生成を有効化
  parameters: {
    layout: 'centered', // レイアウト設定
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
      description: 'ボタンのスタイルバリアント',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'ボタンのサイズ',
    },
    disabled: {
      control: 'boolean',
      description: 'ボタンを無効にするかどうか',
    },
    onClick: {
      action: 'clicked',
      description: 'クリック時のコールバック関数',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;
```

## 基本的な Story パターン

### Default Story

```typescript
// デフォルトの Story
export const Default: Story = {
  args: {
    children: 'Button',
  },
};
```

### バリアント表示の Story

```typescript
// バリアント表示の Story
export const Variants: Story = {
  args: {
    children: "Button",
  },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Button {...args} variant="default">Default</Button>
      <Button {...args} variant="destructive">Destructive</Button>
      <Button {...args} variant="outline">Outline</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="link">Link</Button>
    </div>
  ),
};
```

### サイズ表示の Story

```typescript
// サイズ表示の Story
export const Sizes: Story = {
  args: {
    children: "Button",
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="default">Default</Button>
      <Button {...args} size="lg">Large</Button>
      <Button {...args} size="icon">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </Button>
    </div>
  ),
};
```

### 状態表示の Story

```typescript
// 状態表示の Story
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <span className="w-20 text-sm">Normal:</span>
        <Button>Normal Button</Button>
      </div>
      <div className="flex gap-2 items-center">
        <span className="w-20 text-sm">Disabled:</span>
        <Button disabled>Disabled Button</Button>
      </div>
      <div className="flex gap-2 items-center">
        <span className="w-20 text-sm">Loading:</span>
        <Button disabled>
          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </Button>
      </div>
    </div>
  ),
};
```

## Input コンポーネントの Story 例

### 基本的な Input

```typescript
// src/components/ui/input.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { Label } from './label';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "テキストを入力してください",
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="input-with-label">ラベル付きInput</Label>
      <Input id="input-with-label" {...args} />
    </div>
  ),
  args: {
    placeholder: "テキストを入力してください",
  },
};

export const Types: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label>テキスト</Label>
        <Input type="text" placeholder="テキストを入力" />
      </div>
      <div className="space-y-2">
        <Label>メールアドレス</Label>
        <Input type="email" placeholder="email@example.com" />
      </div>
      <div className="space-y-2">
        <Label>パスワード</Label>
        <Input type="password" placeholder="パスワード" />
      </div>
      <div className="space-y-2">
        <Label>数値</Label>
        <Input type="number" placeholder="123" />
      </div>
      <div className="space-y-2">
        <Label>電話番号</Label>
        <Input type="tel" placeholder="090-1234-5678" />
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label>通常</Label>
        <Input placeholder="通常の状態" />
      </div>
      <div className="space-y-2">
        <Label>無効</Label>
        <Input placeholder="無効な状態" disabled />
      </div>
      <div className="space-y-2">
        <Label>値あり</Label>
        <Input value="入力済みの値" readOnly />
      </div>
      <div className="space-y-2">
        <Label>エラー</Label>
        <Input placeholder="エラー状態" className="border-destructive focus-visible:ring-destructive" />
        <p className="text-sm text-destructive">エラーメッセージ</p>
      </div>
    </div>
  ),
};
```

## Card コンポーネントの Story 例

```typescript
// src/components/ui/card.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>カードタイトル</CardTitle>
        <CardDescription>カードの説明文がここに表示されます。</CardDescription>
      </CardHeader>
      <CardContent>
        <p>カードの内容がここに表示されます。追加のテキストやコンテンツを配置できます。</p>
      </CardContent>
      <CardFooter>
        <Button>アクション</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithoutDescription: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>シンプルなカード</CardTitle>
      </CardHeader>
      <CardContent>
        <p>説明のないシンプルなカードです。</p>
      </CardContent>
    </Card>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>ステータス付きカード</CardTitle>
          <Badge variant="secondary">NEW</Badge>
        </div>
        <CardDescription>バッジを含むカードの例です。</CardDescription>
      </CardHeader>
      <CardContent>
        <p>ステータスやカテゴリを示すバッジを表示できます。</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline">キャンセル</Button>
        <Button>確認</Button>
      </CardFooter>
    </Card>
  ),
};

export const Layout: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>カード 1</CardTitle>
        </CardHeader>
        <CardContent>
          <p>複数カードのレイアウト例</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>カード 2</CardTitle>
        </CardHeader>
        <CardContent>
          <p>グリッドレイアウトでの表示</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>カード 3</CardTitle>
        </CardHeader>
        <CardContent>
          <p>レスポンシブ対応</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
```

## Dialog コンポーネントの Story 例

```typescript
// src/components/ui/dialog.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from './button';
import { Label } from './label';
import { Input } from './input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>ダイアログを開く</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>確認</DialogTitle>
          <DialogDescription>
            この操作を実行してもよろしいですか？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">キャンセル</Button>
          <Button>実行</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithForm: Story = {
  render: () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>フォームダイアログ</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>プロフィール編集</DialogTitle>
            <DialogDescription>
              プロフィール情報を編集してください。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="名前を入力"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline">キャンセル</Button>
            <Button>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

export const Alert: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">削除</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>削除の確認</DialogTitle>
          <DialogDescription>
            この操作は元に戻すことができません。本当にアイテムを削除しますか？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">キャンセル</Button>
          <Button variant="destructive">削除する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
```

## Input OTP コンポーネントの Story 例

```typescript
// src/components/ui/input-otp.stories.tsx
import { type Meta, type StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "./button";
import { Label } from "./label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./input-otp";

const meta: Meta<typeof InputOTP> = {
  title: "UI/Input OTP",
  component: InputOTP,
  tags: ["autodocs"],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof InputOTP>;

// 基本的な使用例
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <div className="space-y-4">
        <div>
          <Label>認証コードを入力</Label>
        </div>
        <InputOTP maxLength={6} value={value} onChange={setValue}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <Button className="w-full" disabled={value.length !== 6}>
          ログイン
        </Button>
        <p className="text-sm text-muted-foreground">
          入力値: {value}
        </p>
      </div>
    );
  },
};

// 数字のみのパターン
export const Pattern: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <div className="space-y-4">
        <div>
          <Label>数字のみ入力可能</Label>
        </div>
        <InputOTP
          maxLength={6}
          pattern="^[0-9]+$"
          value={value}
          onChange={setValue}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p className="text-sm text-muted-foreground">
          入力値: {value}
        </p>
      </div>
    );
  },
};

// カスタム長さ
export const CustomLength: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <div className="space-y-4">
        <div>
          <Label>4桁のPINコードを入力</Label>
        </div>
        <InputOTP maxLength={4} value={value} onChange={setValue}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
        <Button className="w-full" disabled={value.length !== 4}>
          確認
        </Button>
      </div>
    );
  },
};
```

## アクセシビリティ Story 例

### フォーカス管理の Story

```typescript
export const FocusManagement: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">フォーカス管理</h3>
        <div className="space-y-2">
          <Button>最初のボタン</Button>
          <Button>2番目のボタン</Button>
          <Button>3番目のボタン</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          タブキーでフォーカスを移動してください
        </p>
      </div>
    );
  },
};
```

### キーボード操作の Story

```typescript
export const KeyboardNavigation: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">キーボード操作</h3>
        <div className="flex gap-2">
          <Button onClick={() => alert('Enterキーでも動作します')}>
            Enter キーでアクティベート
          </Button>
          <Button onClick={() => alert('スペースキーでも動作します')}>
            Space キーでアクティベート
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter キーまたは Space キーでボタンを実行できます
        </p>
      </div>
    );
  },
};
```

## ベストプラクティス

### Story の命名規則

```typescript
// ✅ 良い例
export const Default: Story = {}; // 基本例
export const Variants: Story = {}; // バリアント表示
export const Sizes: Story = {}; // サイズ表示
export const States: Story = {}; // 状態表示
export const WithLabel: Story = {}; // 機能付き
export const Loading: Story = {}; // ローディング状態
export const Error: Story = {}; // エラー状態
export const Interactive: Story = {}; // インタラクティブ

// ❌ 悪い例
export const Story1: Story = {}; // 意味不明
export const TestStory: Story = {}; // テスト用は避ける
export const Component: Story = {}; // 曖昧
```

### argTypes の効果的な使用

```typescript
argTypes: {
  // セレクトコントロール
  variant: {
    control: { type: 'select' },
    options: ['primary', 'secondary', 'danger'],
    description: '表示バリアント',
  },

  // ブールコントロール
  disabled: {
    control: 'boolean',
    description: '無効状態',
  },

  // テキストコントロール
  placeholder: {
    control: 'text',
    description: 'プレースホルダーテキスト',
  },

  // アクション
  onClick: {
    action: 'clicked',
    description: 'クリックイベント',
  },

  // レンジコントロール
  size: {
    control: { type: 'range', min: 10, max: 100, step: 5 },
    description: 'サイズ',
  },
}
```
