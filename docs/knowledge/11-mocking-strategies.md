# モック戦略とユーティリティガイド

## 基本的なモック戦略

### 外部依存のモック

テストでは以下の外部依存を必ずモックする：

- データベース（Prisma）
- 認証（NextAuth）
- キャッシュ（Next.js Cache）
- ファイルシステム
- 外部API

## 認証関連のモック

### NextAuth セッションモック

```typescript
// tests/mocks/auth.ts
import { vi } from 'vitest';

// next-auth のグローバルモック
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
    callbacks: {
      session: vi.fn(),
      jwt: vi.fn(),
    },
  },
}));
```

### セッション状態のヘルパー関数

```typescript
// tests/utils/auth-helpers.ts
import { vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { getServerSessionHelper } from 'lib/session-helper';

export interface MockUser {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export function mockAuthenticatedUser(user: MockUser) {
  const session = {
    user,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24時間後
  };

  vi.mocked(getServerSession).mockResolvedValue(session as any);
  vi.mocked(getServerSessionHelper).mockResolvedValue(session as any);
}

export function mockUnauthenticatedUser() {
  vi.mocked(getServerSession).mockResolvedValue(null);
  vi.mocked(getServerSessionHelper).mockResolvedValue(null);
}

export function mockSessionError() {
  vi.mocked(getServerSession).mockRejectedValue(new Error('Session error'));
  vi.mocked(getServerSessionHelper).mockRejectedValue(
    new Error('Session error')
  );
}
```

## データベースモック

### Prisma クライアントのモック

```typescript
// tests/mocks/prisma.ts
import { vi } from 'vitest';

// 基本的なPrismaメソッドのモック
export const mockPrismaUser = {
  findUnique: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  groupBy: vi.fn(),
  aggregate: vi.fn(),
};

export const mockPrismaEvent = {
  findUnique: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  groupBy: vi.fn(),
};

export const mockPrismaContent = {
  findUnique: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  groupBy: vi.fn(),
};

export const mockPrismaFavorite = {
  findUnique: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
};

// 全体のPrismaモック
export const mockPrisma = {
  user: mockPrismaUser,
  event: mockPrismaEvent,
  content: mockPrismaContent,
  favorite: mockPrismaFavorite,
  eventAccess: {
    findMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  invitationLink: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
};

vi.mock('lib/prisma', () => ({
  prisma: mockPrisma,
}));

// ZenStack enhance のモック
vi.mock('@zenstackhq/runtime', () => ({
  enhance: vi.fn((prismaClient) => prismaClient),
}));
```

### データベース操作のヘルパー関数

```typescript
// tests/utils/prisma-helpers.ts
import { vi } from 'vitest';
import { mockPrisma } from '../mocks/prisma';

export function mockPrismaOperation(
  entity: keyof typeof mockPrisma,
  operation: string,
  mockImplementation: any
) {
  const entityMock = mockPrisma[entity] as any;
  if (entityMock && entityMock[operation]) {
    entityMock[operation].mockImplementation(mockImplementation);
  }
}

export function mockPrismaFind<T>(
  entity: keyof typeof mockPrisma,
  operation: 'findUnique' | 'findMany' | 'findFirst',
  result: T | T[] | null
) {
  mockPrismaOperation(entity, operation, vi.fn().mockResolvedValue(result));
}

export function mockPrismaCreate<T>(
  entity: keyof typeof mockPrisma,
  result: T
) {
  mockPrismaOperation(entity, 'create', vi.fn().mockResolvedValue(result));
}

export function mockPrismaUpdate<T>(
  entity: keyof typeof mockPrisma,
  result: T
) {
  mockPrismaOperation(entity, 'update', vi.fn().mockResolvedValue(result));
}

export function mockPrismaDelete<T>(
  entity: keyof typeof mockPrisma,
  result: T
) {
  mockPrismaOperation(entity, 'delete', vi.fn().mockResolvedValue(result));
}

export function mockPrismaTransaction<T>(result: T) {
  mockPrisma.$transaction.mockResolvedValue(result);
}

export function mockPrismaError(
  entity: keyof typeof mockPrisma,
  operation: string,
  error: Error
) {
  mockPrismaOperation(entity, operation, vi.fn().mockRejectedValue(error));
}

export function resetPrismaMocks() {
  Object.values(mockPrisma).forEach((entityMock) => {
    if (typeof entityMock === 'object') {
      Object.values(entityMock).forEach((method) => {
        if (vi.isMockFunction(method)) {
          method.mockClear();
        }
      });
    }
  });
}
```

## キャッシュ関連のモック

### Next.js キャッシュのモック

```typescript
// tests/mocks/next-cache.ts
import { vi } from 'vitest';

export const mockRevalidateTag = vi.fn();
export const mockUnstableCache = vi.fn();

vi.mock('next/cache', () => ({
  revalidateTag: mockRevalidateTag,
  unstable_cache: mockUnstableCache,
  unstable_noStore: vi.fn(),
}));

// デフォルトでは元の関数をそのまま実行
mockUnstableCache.mockImplementation((fn) => fn);
```

### キャッシュユーティリティのモック

```typescript
// tests/mocks/cache-utils.ts
import { vi } from 'vitest';

export const mockSafeRevalidateTag = vi.fn();

vi.mock('lib/cache-utils', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    safeRevalidateTag: mockSafeRevalidateTag,
    // CacheKeys と CacheTags は実際のものを使用
  };
});
```

## ファイルシステムのモック

### ファイル操作のモック

```typescript
// tests/mocks/file-system.ts
import { vi } from 'vitest';

// Node.js fs モジュールのモック
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    unlink: vi.fn(),
    mkdir: vi.fn(),
    access: vi.fn(),
    stat: vi.fn(),
  },
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

// ファイルアップロード処理のモック
vi.mock('lib/file-upload', () => ({
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
  generateThumbnail: vi.fn(),
}));
```

### ファイル操作のヘルパー関数

```typescript
// tests/utils/file-helpers.ts
import { vi } from 'vitest';
import fs from 'fs';

export function mockFileExists(filePath: string, exists: boolean) {
  vi.mocked(fs.existsSync).mockImplementation((path) => {
    return path === filePath ? exists : false;
  });
}

export function mockFileRead(filePath: string, content: string | Buffer) {
  vi.mocked(fs.promises.readFile).mockImplementation((path) => {
    if (path === filePath) {
      return Promise.resolve(content);
    }
    return Promise.reject(new Error('File not found'));
  });
}

export function mockFileWrite(filePath: string, success: boolean = true) {
  vi.mocked(fs.promises.writeFile).mockImplementation((path) => {
    if (path === filePath && success) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Write failed'));
  });
}

export function mockFileDelete(filePath: string, success: boolean = true) {
  vi.mocked(fs.promises.unlink).mockImplementation((path) => {
    if (path === filePath && success) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Delete failed'));
  });
}
```

## 外部APIのモック

### fetch のモック

```typescript
// tests/mocks/fetch.ts
import { vi } from 'vitest';

export const mockFetch = vi.fn();

// グローバルfetchのモック
global.fetch = mockFetch;

export function mockFetchSuccess<T>(url: string, data: T) {
  mockFetch.mockImplementation((fetchUrl: string) => {
    if (fetchUrl === url) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
      });
    }
    return Promise.reject(new Error('Not mocked'));
  });
}

export function mockFetchError(
  url: string,
  status: number = 500,
  message: string = 'Server Error'
) {
  mockFetch.mockImplementation((fetchUrl: string) => {
    if (fetchUrl === url) {
      return Promise.resolve({
        ok: false,
        status,
        statusText: message,
        json: () => Promise.resolve({ error: message }),
        text: () => Promise.resolve(message),
      });
    }
    return Promise.reject(new Error('Not mocked'));
  });
}

export function mockFetchNetworkError(url: string) {
  mockFetch.mockImplementation((fetchUrl: string) => {
    if (fetchUrl === url) {
      return Promise.reject(new Error('Network error'));
    }
    return Promise.reject(new Error('Not mocked'));
  });
}
```

## データファクトリー

### テストデータ生成

```typescript
// tests/factories/data-factory.ts
import { faker } from '@faker-js/faker';

export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  image: faker.image.avatar(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createMockEvent = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  name: faker.lorem.words(3),
  description: faker.lorem.paragraph(),
  date: faker.date.future(),
  status: faker.helpers.arrayElement(['ACTIVE', 'COMPLETED', 'CANCELLED']),
  userId: faker.string.uuid(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  _count: {
    contents: faker.number.int({ min: 0, max: 20 }),
    eventAccesses: faker.number.int({ min: 0, max: 100 }),
  },
  ...overrides,
});

export const createMockContent = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  title: faker.lorem.words(2),
  description: faker.lorem.sentence(),
  type: faker.helpers.arrayElement(['PHOTO', 'VIDEO', 'DOCUMENT']),
  fileUrl: faker.internet.url(),
  fileName: faker.system.fileName(),
  fileSize: faker.number.int({ min: 1000, max: 10000000 }),
  mimeType: faker.system.mimeType(),
  thumbnailUrl: faker.internet.url(),
  metadata: {},
  eventId: faker.string.uuid(),
  uploadedById: faker.string.uuid(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createMockFavorite = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  contentId: faker.string.uuid(),
  createdAt: faker.date.past(),
  ...overrides,
});

export const createMockEventAccess = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  eventId: faker.string.uuid(),
  userId: faker.string.uuid(),
  accessedAt: faker.date.recent(),
  ipAddress: faker.internet.ip(),
  userAgent: faker.internet.userAgent(),
  ...overrides,
});
```

### リレーション付きデータの生成

```typescript
// tests/factories/relations-factory.ts
import {
  createMockUser,
  createMockEvent,
  createMockContent,
} from './data-factory';

export const createEventWithContents = (contentCount: number = 3) => {
  const user = createMockUser();
  const event = createMockEvent({ userId: user.id });
  const contents = Array.from({ length: contentCount }, () =>
    createMockContent({ eventId: event.id, uploadedById: user.id })
  );

  return {
    user,
    event: {
      ...event,
      contents,
      _count: {
        contents: contentCount,
        eventAccesses: 0,
      },
    },
    contents,
  };
};

export const createUserWithEvents = (eventCount: number = 2) => {
  const user = createMockUser();
  const events = Array.from({ length: eventCount }, () =>
    createMockEvent({ userId: user.id })
  );

  return { user, events };
};

export const createEventWithParticipants = (participantCount: number = 3) => {
  const organizer = createMockUser();
  const event = createMockEvent({ userId: organizer.id });
  const participants = Array.from({ length: participantCount }, () =>
    createMockUser()
  );

  const eventAccesses = participants.map((participant) => ({
    id: faker.string.uuid(),
    eventId: event.id,
    userId: participant.id,
    createdAt: faker.date.past(),
  }));

  return {
    organizer,
    event: {
      ...event,
      eventAccesses,
      _count: {
        contents: 0,
        eventAccesses: participantCount,
      },
    },
    participants,
  };
};
```

## 統合テストのモック戦略

### End-to-End モック

```typescript
// tests/utils/integration-helpers.ts
import { vi } from 'vitest';
import { mockAuthenticatedUser, mockUnauthenticatedUser } from './auth-helpers';
import { mockPrismaFind, mockPrismaCreate } from './prisma-helpers';
import { createMockUser, createMockEvent } from '../factories/data-factory';

export function setupAuthenticatedIntegrationTest() {
  const user = createMockUser();
  const events = [
    createMockEvent({ userId: user.id }),
    createMockEvent({ userId: user.id }),
  ];

  // 認証状態をセットアップ
  mockAuthenticatedUser(user);

  // データベースの状態をセットアップ
  mockPrismaFind('user', 'findUnique', user);
  mockPrismaFind('event', 'findMany', events);

  return { user, events };
}

export function setupUnauthenticatedIntegrationTest() {
  mockUnauthenticatedUser();

  // 未認証時はデータベースアクセスしない想定
  mockPrismaFind('event', 'findMany', []);

  return {};
}

export function setupErrorScenario(errorType: 'database' | 'network' | 'auth') {
  const user = createMockUser();

  switch (errorType) {
    case 'database':
      mockAuthenticatedUser(user);
      mockPrismaFind(
        'event',
        'findMany',
        vi.fn().mockRejectedValue(new Error('Database error'))
      );
      break;
    case 'network':
      mockAuthenticatedUser(user);
      // ネットワークエラーのシミュレーション
      break;
    case 'auth':
      mockUnauthenticatedUser();
      break;
  }

  return { user };
}
```

## モックのリセット戦略

### テスト間でのクリーンアップ

```typescript
// tests/utils/cleanup.ts
import { vi, beforeEach, afterEach } from 'vitest';
import { mockPrisma } from '../mocks/prisma';
import { mockFetch } from '../mocks/fetch';
import { mockSafeRevalidateTag } from '../mocks/cache-utils';

export function setupTestCleanup() {
  beforeEach(() => {
    // 全モックをクリア
    vi.clearAllMocks();

    // 個別モックのリセット
    resetPrismaMocks();
    resetCacheMocks();
    resetFetchMocks();
  });

  afterEach(() => {
    // モックの実装を復元
    vi.restoreAllMocks();
  });
}

function resetPrismaMocks() {
  Object.values(mockPrisma).forEach((entityMock) => {
    if (typeof entityMock === 'object') {
      Object.values(entityMock).forEach((method) => {
        if (vi.isMockFunction(method)) {
          method.mockClear();
        }
      });
    }
  });
}

function resetCacheMocks() {
  mockSafeRevalidateTag.mockClear();
}

function resetFetchMocks() {
  mockFetch.mockClear();
}
```

## デバッグ用モック

### モック呼び出しの追跡

```typescript
// tests/utils/debug-helpers.ts
import { vi } from 'vitest';

export function createTrackedMock<T extends (...args: any[]) => any>(
  name: string,
  implementation?: T
) {
  const mock = vi.fn(implementation);

  mock.mockImplementation((...args) => {
    console.log(`[DEBUG] ${name} called with:`, args);
    return implementation ? implementation(...args) : undefined;
  });

  return mock;
}

export function logMockCalls(mockFunction: any, functionName: string) {
  console.log(`[DEBUG] ${functionName} call history:`);
  mockFunction.mock.calls.forEach((call: any, index: number) => {
    console.log(`  Call ${index + 1}:`, call);
  });
  console.log(`[DEBUG] ${functionName} return values:`);
  mockFunction.mock.results.forEach((result: any, index: number) => {
    console.log(`  Return ${index + 1}:`, result.value);
  });
}

export function expectMockCalledWithPartial(
  mockFunction: any,
  partialExpectedCall: any
) {
  const calls = mockFunction.mock.calls;
  const matchingCall = calls.find((call: any[]) => {
    return Object.keys(partialExpectedCall).every((key) => {
      return call[0] && call[0][key] === partialExpectedCall[key];
    });
  });

  expect(matchingCall).toBeDefined();
  return matchingCall;
}
```
