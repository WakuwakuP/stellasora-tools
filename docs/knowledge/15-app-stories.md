# アプリケーションコンポーネント Story 作成ガイド

## アプリケーションコンポーネントの Story 構造

アプリケーションコンポーネントは機能別に分類し、実際の利用シーンを想定した Story を作成する。

### 基本的な Meta 設定

```typescript
// src/components/auth/SignInCard.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { SignInCard } from './SignInCard';
import { MockAuth } from '.storybook/MockAuth';

const meta: Meta<typeof SignInCard> = {
  title: 'Feature/Auth/SignInCard',
  component: SignInCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onSubmit: {
      action: 'submitted',
      description: 'フォーム送信時のコールバック',
    },
    isLoading: {
      control: 'boolean',
      description: 'ローディング状態',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SignInCard>;
```

## 認証関連コンポーネント Story 例

### SignInCard コンポーネント

```typescript
export const Default: Story = {
  args: {
    title: 'サインイン',
    description: 'アカウントにサインインしてください',
    onSubmit: action('onSubmit'),
  },
};

export const WithCustomTitle: Story = {
  args: {
    title: 'ログイン',
    description: '認証情報を入力してログインしてください',
    onSubmit: action('onSubmit'),
  },
};

export const Loading: Story = {
  args: {
    title: 'サインイン',
    description: 'アカウントにサインインしてください',
    isLoading: true,
    onSubmit: action('onSubmit'),
  },
};

export const WithError: Story = {
  args: {
    title: 'サインイン',
    description: 'アカウントにサインインしてください',
    error: 'メールアドレスまたはパスワードが正しくありません',
    onSubmit: action('onSubmit'),
  },
};
```

### SignInButtons コンポーネント

```typescript
// src/components/auth/SignInButtons.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { SignInButtons } from './SignInButtons';

const meta: Meta<typeof SignInButtons> = {
  title: 'Feature/Auth/SignInButtons',
  component: SignInButtons,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SignInButtons>;

export const Default: Story = {
  args: {
    onGoogleSignIn: action('onGoogleSignIn'),
    onGithubSignIn: action('onGithubSignIn'),
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    onGoogleSignIn: action('onGoogleSignIn'),
    onGithubSignIn: action('onGithubSignIn'),
  },
};

export const SingleProvider: Story = {
  args: {
    providers: ['google'],
    onGoogleSignIn: action('onGoogleSignIn'),
  },
};
```

## コンテンツ関連コンポーネント Story 例

### ContentUploadModal コンポーネント

```typescript
// src/components/content/ContentUploadModal.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { ContentUploadModal } from './ContentUploadModal';
import { MockAuth, defaultMockUser } from '.storybook/MockAuth';

const meta: Meta<typeof ContentUploadModal> = {
  title: 'Feature/Content/ContentUploadModal',
  component: ContentUploadModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <MockAuth user={defaultMockUser}>
        <div className="p-4">
          <Story />
        </div>
      </MockAuth>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ContentUploadModal>;

export const Default: Story = {
  args: {
    eventId: 'event-123',
    open: true,
    onOpenChange: action('onOpenChange'),
    onUploadSuccess: action('onUploadSuccess'),
  },
};

export const Closed: Story = {
  args: {
    eventId: 'event-123',
    open: false,
    onOpenChange: action('onOpenChange'),
    onUploadSuccess: action('onUploadSuccess'),
  },
  render: (args) => (
    <div>
      <button onClick={() => action('openModal')()}>
        アップロードモーダルを開く
      </button>
      <ContentUploadModal {...args} />
    </div>
  ),
};

export const Uploading: Story = {
  args: {
    eventId: 'event-123',
    open: true,
    isUploading: true,
    progress: 45,
    onOpenChange: action('onOpenChange'),
    onUploadSuccess: action('onUploadSuccess'),
  },
};

export const WithError: Story = {
  args: {
    eventId: 'event-123',
    open: true,
    error: 'ファイルのアップロードに失敗しました。再試行してください。',
    onOpenChange: action('onOpenChange'),
    onUploadSuccess: action('onUploadSuccess'),
  },
};
```

### ContentCard コンポーネント

```typescript
// src/components/content/ContentCard.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { ContentCard } from './ContentCard';
import { createMockContent } from 'tests/factories/data-factory';

const meta: Meta<typeof ContentCard> = {
  title: 'Feature/Content/ContentCard',
  component: ContentCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ContentCard>;

const mockContent = createMockContent({
  id: 'content-1',
  title: 'サンプル画像',
  type: 'PHOTO',
  fileUrl: 'https://picsum.photos/300/200',
  thumbnailUrl: 'https://picsum.photos/150/100',
  fileName: 'sample.jpg',
  fileSize: 1024000,
});

export const Photo: Story = {
  args: {
    content: mockContent,
    onFavorite: action('onFavorite'),
    onView: action('onView'),
    onEdit: action('onEdit'),
    onDelete: action('onDelete'),
  },
};

export const Video: Story = {
  args: {
    content: {
      ...mockContent,
      type: 'VIDEO',
      mimeType: 'video/mp4',
      fileName: 'sample.mp4',
    },
    onFavorite: action('onFavorite'),
    onView: action('onView'),
    onEdit: action('onEdit'),
    onDelete: action('onDelete'),
  },
};

export const Document: Story = {
  args: {
    content: {
      ...mockContent,
      type: 'DOCUMENT',
      mimeType: 'application/pdf',
      fileName: 'document.pdf',
      thumbnailUrl: null,
    },
    onFavorite: action('onFavorite'),
    onView: action('onView'),
    onEdit: action('onEdit'),
    onDelete: action('onDelete'),
  },
};

export const Favorited: Story = {
  args: {
    content: {
      ...mockContent,
      isFavorite: true,
      favoriteCount: 5,
    },
    onFavorite: action('onFavorite'),
    onView: action('onView'),
    onEdit: action('onEdit'),
    onDelete: action('onDelete'),
  },
};

export const Loading: Story = {
  args: {
    content: mockContent,
    isLoading: true,
    onFavorite: action('onFavorite'),
    onView: action('onView'),
    onEdit: action('onEdit'),
    onDelete: action('onDelete'),
  },
};

export const Grid: Story = {
  render: (args) => {
    const contents = [
      { ...mockContent, id: '1', title: 'コンテンツ 1' },
      { ...mockContent, id: '2', title: 'コンテンツ 2', type: 'VIDEO' },
      { ...mockContent, id: '3', title: 'コンテンツ 3', type: 'DOCUMENT', thumbnailUrl: null },
      { ...mockContent, id: '4', title: 'コンテンツ 4', isFavorite: true },
    ];
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contents.map((content, idx) => (
          <ContentCard key={content.id || idx} {...args} content={content} />
        ))}
      </div>
    );
  },
  args: {
    onFavorite: action('onFavorite'),
    onView: action('onView'),
    onEdit: action('onEdit'),
    onDelete: action('onDelete'),
  },
};
```

## イベント関連コンポーネント Story 例

### EventCard コンポーネント

```typescript
// src/components/event/EventCard.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { EventCard } from './EventCard';
import { createMockEvent } from 'tests/factories/data-factory';

const meta: Meta<typeof EventCard> = {
  title: 'Feature/Event/EventCard',
  component: EventCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof EventCard>;

const mockEvent = createMockEvent({
  id: 'event-1',
  name: '社内忘年会 2024',
  description: 'チーム全体での年末イベントです',
  date: new Date('2024-12-20'),
  status: 'ACTIVE',
  _count: {
    contents: 25,
    eventAccesses: 12,
  },
});

export const Default: Story = {
  args: {
    event: mockEvent,
    onView: action('onView'),
    onEdit: action('onEdit'),
    onManage: action('onManage'),
  },
};

export const Completed: Story = {
  args: {
    event: {
      ...mockEvent,
      status: 'COMPLETED',
      date: new Date('2024-01-15'),
    },
    onView: action('onView'),
    onEdit: action('onEdit'),
    onManage: action('onManage'),
  },
};

export const NoDescription: Story = {
  args: {
    event: {
      ...mockEvent,
      description: null,
    },
    onView: action('onView'),
    onEdit: action('onEdit'),
    onManage: action('onManage'),
  },
};

export const LowContent: Story = {
  args: {
    event: {
      ...mockEvent,
      _count: {
        contents: 2,
        eventAccesses: 1,
      },
    },
    onView: action('onView'),
    onEdit: action('onEdit'),
    onManage: action('onManage'),
  },
};

export const List: Story = {
  render: (args) => (
    <div className="space-y-4 max-w-2xl">
      <EventCard
        {...args}
        event={{ ...mockEvent, id: '1', name: 'イベント 1', status: 'ACTIVE' }}
      />
      <EventCard
        {...args}
        event={{ ...mockEvent, id: '2', name: 'イベント 2', status: 'COMPLETED' }}
      />
      <EventCard
        {...args}
        event={{ ...mockEvent, id: '3', name: 'イベント 3', status: 'CANCELLED' }}
      />
    </div>
  ),
  args: {
    onView: action('onView'),
    onEdit: action('onEdit'),
    onManage: action('onManage'),
  },
};
```

### EventForm コンポーネント

```typescript
// src/components/event/EventForm.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { EventForm } from './EventForm';
import { createMockEvent } from 'tests/factories/data-factory';

const meta: Meta<typeof EventForm> = {
  title: 'Feature/Event/EventForm',
  component: EventForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof EventForm>;

export const Create: Story = {
  args: {
    mode: 'create',
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
  },
};

export const Edit: Story = {
  args: {
    mode: 'edit',
    initialData: createMockEvent({
      name: '既存のイベント',
      description: 'このイベントは編集中です',
      date: new Date('2024-06-15'),
    }),
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
  },
};

export const Submitting: Story = {
  args: {
    mode: 'create',
    isSubmitting: true,
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
  },
};

export const WithValidationErrors: Story = {
  args: {
    mode: 'create',
    errors: {
      name: 'イベント名は必須です',
      date: '有効な日付を入力してください',
    },
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
  },
};
```

## フォーム関連コンポーネント Story 例

### プロフィール編集フォーム

```typescript
// src/components/profile/ProfileEditForm.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { ProfileEditForm } from './ProfileEditForm';
import { MockAuth, defaultMockUser } from '.storybook/MockAuth';

const meta: Meta<typeof ProfileEditForm> = {
  title: 'Feature/Profile/ProfileEditForm',
  component: ProfileEditForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <MockAuth user={defaultMockUser}>
        <div className="max-w-2xl mx-auto">
          <Story />
        </div>
      </MockAuth>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProfileEditForm>;

export const Default: Story = {
  args: {
    user: defaultMockUser,
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
  },
};

export const Saving: Story = {
  args: {
    user: defaultMockUser,
    isSaving: true,
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
  },
};

export const WithValidationErrors: Story = {
  args: {
    user: defaultMockUser,
    errors: {
      name: '名前は必須です',
      email: '有効なメールアドレスを入力してください',
    },
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
  },
};

export const EmptyProfile: Story = {
  args: {
    user: {
      id: defaultMockUser.id,
      name: '',
      email: defaultMockUser.email,
    },
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
  },
};
```

## レイアウトコンポーネント Story 例

### Header コンポーネント

```typescript
// src/components/layout/Header.stories.tsx
import { type Meta, type StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Header } from './Header';
import { MockAuth, defaultMockUser } from '.storybook/MockAuth';

const meta: Meta<typeof Header> = {
  title: 'Feature/Layout/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Authenticated: Story = {
  decorators: [
    (Story) => (
      <MockAuth user={defaultMockUser}>
        <Story />
      </MockAuth>
    ),
  ],
  args: {
    onMenuClick: action('onMenuClick'),
    onProfileClick: action('onProfileClick'),
    onSignOut: action('onSignOut'),
  },
};

export const Unauthenticated: Story = {
  decorators: [
    (Story) => (
      <MockAuth user={null}>
        <Story />
      </MockAuth>
    ),
  ],
  args: {
    onSignInClick: action('onSignInClick'),
  },
};

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <MockAuth user={defaultMockUser}>
        <Story />
      </MockAuth>
    ),
  ],
  args: {
    onMenuClick: action('onMenuClick'),
    onProfileClick: action('onProfileClick'),
    onSignOut: action('onSignOut'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
```

## データ状態別 Story

### ローディング状態

```typescript
export const Loading: Story = {
  args: {
    isLoading: true,
  },
  render: (args) => (
    <div className="space-y-4">
      <ComponentSkeleton />
      <ComponentSkeleton />
      <ComponentSkeleton />
    </div>
  ),
};
```

### エラー状態

```typescript
export const Error: Story = {
  args: {
    error: 'データの読み込みに失敗しました',
  },
  render: (args) => (
    <div className="text-center py-8">
      <p className="text-destructive">{args.error}</p>
      <button className="mt-4 px-4 py-2 bg-primary text-white rounded">
        再試行
      </button>
    </div>
  ),
};
```

### 空状態

```typescript
export const Empty: Story = {
  args: {
    data: [],
  },
  render: (args) => (
    <div className="text-center py-8">
      <p className="text-muted-foreground">データがありません</p>
      <button className="mt-4 px-4 py-2 bg-primary text-white rounded">
        新しく作成
      </button>
    </div>
  ),
};
```

## ベストプラクティス

### Story の分類

```typescript
// ✅ 良い例
title: 'Feature/Auth/SignInCard'; // 機能別
title: 'Feature/Content/ContentCard'; // 機能別
title: 'Feature/Event/EventForm'; // 機能別
title: 'Layout/Header'; // レイアウト
title: 'Forms/ProfileForm'; // フォーム

// ❌ 悪い例
title: 'Components/SignIn'; // 曖昧
title: 'SignInCard'; // 階層なし
title: 'Auth/SignIn/Card'; // 深すぎる
```

### action の活用

```typescript
// ✅ actions を適切に設定
argTypes: {
  onSubmit: { action: 'submitted' },
  onCancel: { action: 'cancelled' },
  onEdit: { action: 'edit-clicked' },
  onDelete: { action: 'delete-clicked' },
}

// Story で action を使用
args: {
  onSubmit: action('form-submitted'),
  onCancel: action('form-cancelled'),
}
```

### デコレーターの活用

```typescript
// 認証が必要なコンポーネント
decorators: [
  (Story) => (
    <MockAuth user={defaultMockUser}>
      <Story />
    </MockAuth>
  ),
],

// 背景が必要なコンポーネント
decorators: [
  (Story) => (
    <div className="min-h-screen bg-gray-100 p-8">
      <Story />
    </div>
  ),
],
```
