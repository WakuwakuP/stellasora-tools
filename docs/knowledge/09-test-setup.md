# テスト環境セットアップガイド

## 基本構成

このプロジェクトでは Vitest を使用してテストを実装している。

## グローバルセットアップ

### 基本セットアップファイル

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// グローバルな React 設定（JSX 変換のため）
global.React = React;

// fetch のモック
if (process.env.NODE_ENV === 'test') {
  const mockFetch = vi.fn() as any;
  global.fetch = mockFetch;

  mockFetch.mockImplementation((url: string) => {
    if (url === '/api/environment') {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            isPreview: false,
            isDevelopment: true,
            isProduction: false,
            shouldBypassAuth: true,
          }),
      });
    }
    return Promise.reject(new Error('Not found'));
  });
}
```

### Vitest 設定

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      components: path.resolve(__dirname, './src/components'),
      lib: path.resolve(__dirname, './src/lib'),
      app: path.resolve(__dirname, './src/app'),
    },
  },
});
```

## モック設定

### Next.js キャッシュのモック

```typescript
// tests/mocks/next-cache.ts
import { vi } from 'vitest';

// next/cache のモック
vi.mock('next/cache', async () => {
  const originalModule = await vi.importActual('next/cache');
  return {
    ...originalModule,
    unstable_cacheTag: vi.fn(() => {}),
    revalidateTag: vi.fn(() => {}),
    unstable_cache: vi.fn((fn) => fn), // 元の関数をそのまま返す
  };
});
```

### キャッシュユーティリティのモック

```typescript
// tests/mocks/cache-utils.ts
import { vi } from 'vitest';

// cache-utils のモック
vi.mock('lib/cache-utils', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    safeRevalidateTag: vi.fn(() => {}),
    CacheKeys: {
      events: (userId: string) => `user:${userId}:events`,
      event: (userId: string, eventId: string) =>
        `user:${userId}:event:${eventId}`,
      content: (userId: string, contentId: string) =>
        `user:${userId}:content:${contentId}`,
      eventContents: (userId: string, eventId: string) =>
        `user:${userId}:event:${eventId}:contents`,
    },
    CacheTags: {
      events: (userId: string) => `user:${userId}:events`,
      contents: 'contents',
      event: (userId: string, eventId: string) =>
        `user:${userId}:event:${eventId}`,
      content: (userId: string, contentId: string) =>
        `user:${userId}:content:${contentId}`,
      contentFavorite: (userId: string, contentId: string) =>
        `user:${userId}:content:${contentId}:favorite`,
    },
  };
});
```

### 認証関連のモック

```typescript
// tests/mocks/auth.ts
import { vi } from 'vitest';

// next-auth のモック
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// セッションヘルパーのモック
vi.mock('lib/session-helper', () => ({
  getServerSessionHelper: vi.fn(),
}));

// 認証設定のモック
vi.mock('lib/auth', () => ({
  authOptions: {
    pages: {
      signIn: '/signin',
    },
  },
}));
```

### Prisma のモック

```typescript
// tests/mocks/prisma.ts
import { vi } from 'vitest';

// Prisma クライアントのモック
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  event: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  content: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  favorite: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock('lib/prisma', () => ({
  prisma: mockPrisma,
}));

export { mockPrisma };
```

### ZenStack のモック

```typescript
// tests/mocks/zenstack.ts
import { vi } from 'vitest';

// ZenStack enhance のモック
vi.mock('@zenstackhq/runtime', () => ({
  enhance: vi.fn((prismaClient) => prismaClient), // そのまま返す
}));
```

## テストユーティリティ

### レンダリングユーティリティ

```typescript
// tests/utils/render.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';

// カスタムレンダー関数
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Server Actions テストユーティリティ

```typescript
// tests/utils/server-actions.ts
import { vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { mockPrisma } from '../mocks/prisma';

export function mockAuthenticatedUser(user: {
  id: string;
  name?: string;
  email?: string;
}) {
  (getServerSession as any).mockResolvedValue({
    user,
  });
}

export function mockUnauthenticatedUser() {
  (getServerSession as any).mockResolvedValue(null);
}

export function mockPrismaOperation(
  method: keyof typeof mockPrisma,
  operation: string,
  mockImplementation: any
) {
  const entity = mockPrisma[method] as any;
  if (entity && entity[operation]) {
    entity[operation].mockImplementation(mockImplementation);
  }
}

export function resetAllMocks() {
  vi.clearAllMocks();
  Object.values(mockPrisma).forEach((entity) => {
    Object.values(entity).forEach((method) => {
      if (vi.isMockFunction(method)) {
        method.mockClear();
      }
    });
  });
}
```

### データファクトリー

```typescript
// tests/factories/data.ts
import { faker } from '@faker-js/faker';

export const createMockUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  image: faker.image.avatar(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createMockEvent = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.lorem.words(3),
  description: faker.lorem.paragraph(),
  date: faker.date.future(),
  status: 'ACTIVE' as const,
  userId: faker.string.uuid(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  _count: {
    contents: faker.number.int({ min: 0, max: 10 }),
    eventAccesses: faker.number.int({ min: 0, max: 100 }),
  },
  ...overrides,
});

export const createMockContent = (overrides = {}) => ({
  id: faker.string.uuid(),
  title: faker.lorem.words(2),
  description: faker.lorem.sentence(),
  type: 'PHOTO' as const,
  fileUrl: faker.internet.url(),
  fileName: faker.system.fileName(),
  fileSize: faker.number.int({ min: 1000, max: 1000000 }),
  mimeType: 'image/jpeg',
  thumbnailUrl: faker.internet.url(),
  metadata: {},
  eventId: faker.string.uuid(),
  uploadedById: faker.string.uuid(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});
```

## 環境変数の設定

### テスト環境変数

```bash
# .env.test
NODE_ENV=test
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret
DATABASE_URL="postgresql://test:test@localhost:5432/test_db"
```

### 環境変数モック

```typescript
// tests/setup.ts に追加
// 環境変数のモック
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret';
```

## よく使用される設定パターン

### beforeEach での初期化

```typescript
import { beforeEach, afterEach } from 'vitest';
import { resetAllMocks } from 'tests/utils/server-actions';

describe('テストスイート', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // テストケース
});
```

### 非同期テストの処理

```typescript
import { waitFor } from '@testing-library/react';

it('非同期処理のテスト', async () => {
  const result = await someAsyncFunction();

  await waitFor(() => {
    expect(result).toBeDefined();
  });
});
```

### エラーケースのテスト

```typescript
it('エラーケースのテスト', async () => {
  mockPrismaOperation('user', 'findUnique', () => {
    throw new Error('データベースエラー');
  });

  await expect(getUserProfile('invalid-id')).rejects.toThrow(
    'データベースエラー'
  );
});
```

## デバッグ用設定

### テスト結果の詳細表示

```typescript
// vitest.config.ts に追加
export default defineConfig({
  test: {
    // テスト失敗時の詳細を表示
    reporter: 'verbose',
    // カバレッジレポートを有効化
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.test.ts', '**/*.test.tsx'],
    },
  },
});
```

### コンソールログの制御

```typescript
// 特定のテストでのみコンソールログを表示
it('デバッグが必要なテスト', () => {
  const consoleSpy = vi.spyOn(console, 'log');

  // テスト実行

  expect(consoleSpy).toHaveBeenCalledWith('期待するログメッセージ');

  consoleSpy.mockRestore();
});
```
