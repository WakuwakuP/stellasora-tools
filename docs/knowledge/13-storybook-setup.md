# Storybook 環境設定ガイド

## 基本構成

このプロジェクトでは Storybook を使用してコンポーネントの開発とドキュメント化を行っている。

## Storybook 設定

### main.ts 設定

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y', // アクセシビリティテスト
    '@storybook/addon-viewport', // レスポンシブテスト
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag', // autodocs タグが付いたストーリーで自動ドキュメント生成
  },
  staticDirs: ['../public'],
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
};

export default config;
```

### preview.ts 設定

```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered', // デフォルトレイアウト
    docs: {
      toc: true, // 目次を表示
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
      },
      defaultViewport: 'desktop',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background text-foreground">
        <Story />
      </div>
    ),
  ],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
```

## テーマ切り替えデコレーター

### withTailwindTheme デコレーター

```javascript
// .storybook/withTailwindTheme.decorator.js
import { useEffect } from 'react';

export const withTailwindTheme = (Story, context) => {
  const { theme } = context.globals;

  useEffect(() => {
    const htmlElement = document.documentElement;

    // 既存のテーマクラスを削除
    htmlElement.classList.remove('light', 'dark');

    // 新しいテーマクラスを追加
    htmlElement.classList.add(theme);
  }, [theme]);

  return (
    <div className={`${theme} bg-background text-foreground`}>
      <Story />
    </div>
  );
};
```

## 認証モック

### MockAuth コンポーネント

```tsx
// .storybook/MockAuth.tsx
import { ReactNode } from 'react';

interface MockAuthProps {
  children: ReactNode;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  } | null;
}

export const MockAuth = ({ children, user = null }: MockAuthProps) => {
  // 認証コンテキストのモック提供
  const mockSession = user ? { user, expires: '' } : null;

  return (
    <div data-testid="mock-auth" data-user={user ? user.id : 'anonymous'}>
      {children}
    </div>
  );
};

// デフォルトユーザー
export const defaultMockUser = {
  id: '1',
  name: '田中太郎',
  email: 'tanaka@example.com',
  image: 'https://via.placeholder.com/100x100',
};
```

### Prisma モック

```typescript
// .storybook/__mocks__/prisma.ts
export const mockPrisma = {
  user: {
    findUnique: async () => ({
      id: '1',
      name: '田中太郎',
      email: 'tanaka@example.com',
      image: 'https://via.placeholder.com/100x100',
    }),
  },
  event: {
    findMany: async () => [
      {
        id: '1',
        name: '社内イベント',
        description: 'チームビルディングイベント',
        date: new Date('2024-01-01'),
        status: 'ACTIVE',
        _count: { contents: 10, eventAccesses: 5 },
      },
    ],
  },
  content: {
    findMany: async () => [
      {
        id: '1',
        title: 'サンプル画像',
        type: 'PHOTO',
        fileUrl: 'https://via.placeholder.com/300x200',
        thumbnailUrl: 'https://via.placeholder.com/150x100',
        createdAt: new Date(),
      },
    ],
  },
};
```

## コンポーネント分類

### 階層構造

```
stories/
├── UI/                    # 基本UIコンポーネント
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   └── ...
├── Forms/                 # フォーム関連コンポーネント
│   ├── LoginForm/
│   ├── EventForm/
│   └── ...
├── Layout/                # レイアウトコンポーネント
│   ├── Header/
│   ├── Navigation/
│   └── ...
├── Feature/               # 機能別コンポーネント
│   ├── Event/
│   ├── Content/
│   └── ...
└── Pages/                 # ページコンポーネント
    ├── Home/
    ├── Events/
    └── ...
```

### タイトル命名規則

```typescript
// UI コンポーネント
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  // ...
};

// フォームコンポーネント
const meta: Meta<typeof EventForm> = {
  title: 'Forms/EventForm',
  // ...
};

// 機能別コンポーネント
const meta: Meta<typeof EventCard> = {
  title: 'Feature/Event/EventCard',
  // ...
};

// ページコンポーネント
const meta: Meta<typeof HomePage> = {
  title: 'Pages/Home',
  // ...
};
```

## Story ファイルの基本テンプレート

### UI コンポーネント用テンプレート

```typescript
// src/components/ui/[component].stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { [Component] } from './[component]';

const meta: Meta<typeof [Component]> = {
  title: 'UI/[Component]',
  component: [Component],
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // プロパティの制御設定
  },
};

export default meta;
type Story = StoryObj<typeof [Component]>;

export const Default: Story = {
  args: {
    // デフォルトプロパティ
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex gap-4">
      {/* バリアント表示 */}
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {/* 状態表示 */}
    </div>
  ),
};
```

### アプリケーションコンポーネント用テンプレート

```typescript
// src/components/[feature]/[component].stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { [Component] } from './[component]';
import { MockAuth, defaultMockUser } from '.storybook/MockAuth';

const meta: Meta<typeof [Component]> = {
  title: 'Feature/[Feature]/[Component]',
  component: [Component],
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockAuth user={defaultMockUser}>
        <Story />
      </MockAuth>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof [Component]>;

export const Default: Story = {
  args: {
    // モックデータ
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    error: 'データの読み込みに失敗しました',
  },
};

export const Empty: Story = {
  args: {
    data: [],
  },
};
```

## パラメータ設定

### レイアウト設定

```typescript
// 中央配置（UIコンポーネント向け）
parameters: {
  layout: 'centered',
}

// 全画面（ページコンポーネント向け）
parameters: {
  layout: 'fullscreen',
}

// パディング付き
parameters: {
  layout: 'padded',
}
```

### 背景設定

```typescript
parameters: {
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: '#ffffff' },
      { name: 'dark', value: '#1a1a1a' },
      { name: 'gray', value: '#f5f5f5' },
    ],
  },
}
```

### ビューポート設定

```typescript
parameters: {
  viewport: {
    defaultViewport: 'mobile',
  },
}
```

## 開発ワークフロー

### Storybook 実行コマンド

```bash
# 開発モードで起動
yarn storybook

# ビルド
yarn build-storybook

# ビルドされたStorybookを確認
npx http-server storybook-static
```

### Story 作成の手順

1. **コンポーネントの作成**

   ```bash
   # コンポーネントファイルを作成
   src/components/ui/new-component.tsx
   ```

2. **Story ファイルの作成**

   ```bash
   # 同じディレクトリにStoryファイルを作成
   src/components/ui/new-component.stories.tsx
   ```

3. **基本 Story の実装**
   - Meta オブジェクトの設定
   - Default Story の作成
   - 必要に応じてバリアント Story を追加

4. **Storybook での確認**

   ```bash
   yarn storybook
   ```

5. **ドキュメントの確認**
   - autodocs が正しく生成されているか確認
   - プロパティの説明が適切に表示されているか確認

## ベストプラクティス

### Story 命名規則

- **Default**: 基本的な使用例
- **Variants**: 複数のバリアントを並べて表示
- **Sizes**: サイズ違いを表示
- **States**: 状態（hover, disabled, loading等）を表示
- **Interactive**: インタラクティブな動作を確認
- **WithData**: データ付きの表示例
- **Loading**: ローディング状態
- **Error**: エラー状態
- **Empty**: 空状態

### コンポーネント分類

```typescript
// ✅ 良い例
title: 'UI/Button'; // UIコンポーネント
title: 'Forms/EventForm'; // フォーム
title: 'Feature/Event/Card'; // 機能別コンポーネント
title: 'Pages/Home'; // ページ

// ❌ 悪い例
title: 'Components/Button'; // 曖昧
title: 'Button'; // 階層なし
```

### args と argTypes の活用

```typescript
argTypes: {
  variant: {
    control: { type: 'select' },
    options: ['default', 'destructive', 'outline'],
    description: 'ボタンのスタイルバリアント',
  },
  disabled: {
    control: 'boolean',
    description: 'ボタンを無効にするかどうか',
  },
  onClick: {
    action: 'clicked',
    description: 'クリック時のコールバック関数',
  },
}
```
