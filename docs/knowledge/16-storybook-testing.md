# Storybook テストとアクセシビリティガイド

## Storybook でのテスト

### インタラクションテスト

Storybook の Interaction Testing を使用してユーザーインタラクションをテストする。

```typescript
// src/components/ui/button.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const InteractionTest: Story = {
  args: {
    children: 'クリックテスト',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // ボタンが存在することを確認
    expect(button).toBeInTheDocument();

    // ボタンをクリック
    await userEvent.click(button);

    // フォーカス状態を確認
    expect(button).toHaveFocus();

    // キーボード操作をテスト
    await userEvent.keyboard('{Enter}');
  },
};
```

### フォームインタラクションのテスト

```typescript
// src/components/forms/ContactForm.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ContactForm } from './ContactForm';

const meta: Meta<typeof ContactForm> = {
  title: 'Forms/ContactForm',
  component: ContactForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ContactForm>;

export const FormInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // フォームフィールドを取得
    const nameInput = canvas.getByLabelText('名前');
    const emailInput = canvas.getByLabelText('メールアドレス');
    const messageTextarea = canvas.getByLabelText('メッセージ');
    const submitButton = canvas.getByRole('button', { name: '送信' });

    // 初期状態では送信ボタンが無効
    expect(submitButton).toBeDisabled();

    // フォームに入力
    await userEvent.type(nameInput, '田中太郎');
    await userEvent.type(emailInput, 'tanaka@example.com');
    await userEvent.type(messageTextarea, 'お問い合わせ内容です。');

    // 入力値を確認
    expect(nameInput).toHaveValue('田中太郎');
    expect(emailInput).toHaveValue('tanaka@example.com');
    expect(messageTextarea).toHaveValue('お問い合わせ内容です。');

    // 送信ボタンが有効になることを確認
    expect(submitButton).toBeEnabled();

    // フォームを送信
    await userEvent.click(submitButton);
  },
};
```

### 状態変更のテスト

```typescript
// src/components/ui/toggle.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Toggle } from './toggle';

const meta: Meta<typeof Toggle> = {
  title: 'UI/Toggle',
  component: Toggle,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const StateChange: Story = {
  args: {
    'aria-label': 'トグルボタン',
    children: 'Toggle',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button');

    // 初期状態を確認
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    // トグルをクリック
    await userEvent.click(toggle);

    // 状態が変更されたことを確認
    expect(toggle).toHaveAttribute('aria-pressed', 'true');

    // もう一度クリック
    await userEvent.click(toggle);

    // 元の状態に戻ったことを確認
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  },
};
```

## アクセシビリティテスト

### 基本的なアクセシビリティチェック

```typescript
// .storybook/main.ts に addon-a11y を追加
export default {
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y', // アクセシビリティテスト
  ],
};
```

### フォーカス管理のテスト

```typescript
// src/components/ui/modal.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Modal } from './modal';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const FocusManagement: Story = {
  args: {
    isOpen: true,
    title: 'アクセシビリティテスト',
    children: (
      <div>
        <button>最初のボタン</button>
        <input placeholder="テキスト入力" />
        <button>最後のボタン</button>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // モーダルが開いていることを確認
    const modal = canvas.getByRole('dialog');
    expect(modal).toBeInTheDocument();

    // 最初のフォーカス可能要素にフォーカスが当たることを確認
    const firstButton = canvas.getByRole('button', { name: '最初のボタン' });
    expect(firstButton).toHaveFocus();

    // Tabキーでフォーカス移動
    await userEvent.tab();
    const input = canvas.getByPlaceholderText('テキスト入力');
    expect(input).toHaveFocus();

    // さらにTabキー
    await userEvent.tab();
    const lastButton = canvas.getByRole('button', { name: '最後のボタン' });
    expect(lastButton).toHaveFocus();

    // 最後の要素でTabキーを押すと最初に戻る
    await userEvent.tab();
    expect(firstButton).toHaveFocus();

    // Shift+Tabで逆方向のフォーカス移動
    await userEvent.tab({ shift: true });
    expect(lastButton).toHaveFocus();
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'focus-trap',
            enabled: true,
          },
        ],
      },
    },
  },
};
```

### セマンティクス検証

```typescript
export const SemanticStructure: Story = {
  args: {
    title: 'セマンティック構造テスト',
    children: (
      <div>
        <h1>メインタイトル</h1>
        <h2>セクションタイトル</h2>
        <p>段落テキスト</p>
        <ul>
          <li>リスト項目 1</li>
          <li>リスト項目 2</li>
        </ul>
        <button aria-label="アクションボタン">実行</button>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 適切な見出し階層の確認
    expect(canvas.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(canvas.getByRole('heading', { level: 2 })).toBeInTheDocument();

    // リスト構造の確認
    const list = canvas.getByRole('list');
    expect(list).toBeInTheDocument();

    const listItems = canvas.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);

    // ボタンのラベル確認
    const button = canvas.getByRole('button');
    expect(button).toHaveAccessibleName('アクションボタン');
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'heading-order', enabled: true },
          { id: 'list', enabled: true },
          { id: 'button-name', enabled: true },
        ],
      },
    },
  },
};
```

### カラーコントラストのテスト

```typescript
export const ColorContrast: Story = {
  args: {
    variant: 'default',
    children: 'カラーコントラストテスト',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};

export const HighContrastTheme: Story = {
  args: {
    variant: 'high-contrast',
    children: 'ハイコントラストテーマ',
  },
  decorators: [
    (Story) => (
      <div className="high-contrast-theme">
        <Story />
      </div>
    ),
  ],
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};
```

## レスポンシブデザインのテスト

### ビューポート別テスト

```typescript
// src/components/layout/Navigation.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Navigation } from './Navigation';

const meta: Meta<typeof Navigation> = {
  title: 'Layout/Navigation',
  component: Navigation,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Navigation>;

export const Mobile: Story = {
  args: {
    items: [
      { label: 'ホーム', href: '/' },
      { label: 'イベント', href: '/events' },
      { label: 'プロフィール', href: '/profile' },
    ],
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // モバイルではハンバーガーメニューが表示される
    const menuButton = canvas.getByRole('button', { name: 'メニュー' });
    expect(menuButton).toBeInTheDocument();

    // ナビゲーション項目は初期状態では非表示
    const navItems = canvas.queryAllByRole('link');
    expect(navItems).toHaveLength(0);
  },
};

export const Desktop: Story = {
  args: {
    items: [
      { label: 'ホーム', href: '/' },
      { label: 'イベント', href: '/events' },
      { label: 'プロフィール', href: '/profile' },
    ],
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // デスクトップでは全ナビゲーション項目が表示される
    const navItems = canvas.getAllByRole('link');
    expect(navItems).toHaveLength(3);

    // ハンバーガーメニューは表示されない
    const menuButton = canvas.queryByRole('button', { name: 'メニュー' });
    expect(menuButton).not.toBeInTheDocument();
  },
};
```

### レスポンシブレイアウトの確認

```typescript
export const ResponsiveGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="p-4 border rounded">
          カード {index + 1}
        </div>
      ))}
    </div>
  ),
  parameters: {
    layout: 'padded',
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '812px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1200px', height: '800px' },
        },
      },
    },
  },
  play: async ({ canvasElement, step }) => {
    await step('Mobile layout', async () => {
      // モバイルでは1列のレイアウト
      // 実際のテストロジックをここに追加
    });

    await step('Tablet layout', async () => {
      // タブレットでは2列のレイアウト
      // 実際のテストロジックをここに追加
    });

    await step('Desktop layout', async () => {
      // デスクトップでは3列のレイアウト
      // 実際のテストロジックをここに追加
    });
  },
};
```

## パフォーマンステスト

### レンダリングパフォーマンス

```typescript
// src/components/content/ContentGrid.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ContentGrid } from './ContentGrid';
import { createMockContent } from 'tests/factories/data-factory';

const meta: Meta<typeof ContentGrid> = {
  title: 'Feature/Content/ContentGrid',
  component: ContentGrid,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ContentGrid>;

export const LargeDataset: Story = {
  args: {
    contents: Array.from({ length: 100 }, (_, index) =>
      createMockContent({
        id: `content-${index}`,
        title: `コンテンツ ${index + 1}`,
      })
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // レンダリング時間を測定
    const startTime = performance.now();

    // すべてのコンテンツカードが表示されることを確認
    const cards = canvas.getAllByRole('article');
    expect(cards).toHaveLength(100);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // レンダリング時間が妥当な範囲内であることを確認
    expect(renderTime).toBeLessThan(1000); // 1秒以内
  },
  parameters: {
    performance: {
      allowedGroups: ['runtime'],
    },
  },
};
```

### メモリリークのチェック

```typescript
export const MemoryLeak: Story = {
  args: {
    contents: Array.from({ length: 50 }, (_, index) =>
      createMockContent({ id: `content-${index}` })
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 初期メモリ使用量
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    // コンポーネントの動的な更新をシミュレート
    for (let i = 0; i < 10; i++) {
      // 何らかの更新処理
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 最終メモリ使用量
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;

    // メモリ増加量が妥当な範囲内であることを確認
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB以下
  },
};
```

## ビジュアルリグレッションテスト

### Chromatic との連携

```typescript
export const VisualReference: Story = {
  args: {
    title: 'ビジュアルリファレンス',
    description: 'このStoryはビジュアルリグレッションテストの基準です',
  },
  parameters: {
    // Chromaticでのスクリーンショット設定
    chromatic: {
      viewports: [320, 768, 1200],
      diffThreshold: 0.2,
      delay: 300,
    },
  },
};

export const DarkTheme: Story = {
  args: {
    title: 'ダークテーマ',
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
  parameters: {
    chromatic: {
      viewports: [1200],
    },
  },
};
```

## エラー境界のテスト

```typescript
// src/components/error/ErrorBoundary.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ErrorBoundary } from './ErrorBoundary';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Feature/Error/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('テスト用エラー');
  }
  return <div>正常なコンポーネント</div>;
};

export const ErrorCaught: Story = {
  args: {
    children: <ThrowError shouldThrow={true} />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // エラーメッセージが表示されることを確認
    expect(canvas.getByText(/エラーが発生しました/)).toBeInTheDocument();

    // 詳細情報ボタンがあることを確認
    const detailButton = canvas.getByRole('button', { name: '詳細を表示' });
    expect(detailButton).toBeInTheDocument();
  },
};

export const NoError: Story = {
  args: {
    children: <ThrowError shouldThrow={false} />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 正常なコンテンツが表示されることを確認
    expect(canvas.getByText('正常なコンポーネント')).toBeInTheDocument();
  },
};
```

## ベストプラクティス

### テストの組織化

```typescript
// playの段階的実行
export const ComplexInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('初期状態の確認', async () => {
      // 初期状態のテスト
    });

    await step('ユーザー入力', async () => {
      // 入力処理のテスト
    });

    await step('結果の検証', async () => {
      // 結果確認のテスト
    });
  },
};
```

### エラーハンドリング

```typescript
export const RobustTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    try {
      const button = canvas.getByRole('button');
      await userEvent.click(button);
    } catch (error) {
      // テスト失敗時の詳細情報を提供
      console.error('Button interaction failed:', error);
      throw error;
    }
  },
};
```

### パフォーマンス監視

```typescript
export const PerformanceMonitored: Story = {
  play: async ({ canvasElement }) => {
    const startTime = performance.now();

    // テスト実行

    const endTime = performance.now();
    console.log(`Test execution time: ${endTime - startTime}ms`);
  },
};
```
