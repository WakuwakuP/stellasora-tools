# Server Actions テスト実装ガイド

## 基本的なテスト構造

Server Actions のテストでは認証、データベース操作、キャッシュ処理をモックして実装する。

### 基本的なテストパターン

```typescript
// src/lib/actions/updateUserProfile.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateUserProfile } from './updateUserProfile';

// セッションのモック
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Prisma のモック
vi.mock('lib/prisma', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

describe('updateUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update user profile successfully', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'Updated Name',
      email: 'test@example.com',
    };

    // セッションをモック
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
    } as any);

    // Prisma の更新をモック
    const { prisma } = await import('lib/prisma');
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

    // 関数の実行
    const result = await updateUserProfile({ name: 'Updated Name' });

    // 結果の検証
    expect(result).toEqual(mockUser);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { name: 'Updated Name' },
    });
  });

  it('should throw error when not authenticated', async () => {
    // 未認証状態をモック
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue(null);

    // エラーのテスト
    await expect(updateUserProfile({ name: 'Test' })).rejects.toThrow(
      '認証が必要です'
    );
  });

  it('should handle database errors gracefully', async () => {
    // セッションをモック
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
    } as any);

    // データベースエラーをモック
    const { prisma } = await import('lib/prisma');
    vi.mocked(prisma.user.update).mockRejectedValue(
      new Error('Database error')
    );

    // エラーハンドリングのテスト
    await expect(updateUserProfile({ name: 'Test' })).rejects.toThrow(
      'プロフィールの更新に失敗しました'
    );
  });
});
```

## CRUD 操作のテスト

### CREATE 操作のテスト

```typescript
// src/lib/actions/createContent.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createContent } from './createContent';
import {
  mockAuthenticatedUser,
  mockPrismaOperation,
} from 'tests/utils/server-actions';

vi.mock('next-auth');
vi.mock('lib/prisma');
vi.mock('lib/cache-utils');

describe('createContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create content successfully', async () => {
    const mockContentData = {
      title: 'Test Content',
      description: 'Test Description',
      type: 'PHOTO' as const,
      fileUrl: 'https://example.com/image.jpg',
      fileName: 'image.jpg',
      fileSize: 1024,
      mimeType: 'image/jpeg',
      eventId: 'event-1',
    };

    const mockCreatedContent = {
      id: 'content-1',
      ...mockContentData,
      uploadedById: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 認証済みユーザーをモック
    mockAuthenticatedUser({ id: 'user-1', email: 'test@example.com' });

    // Prisma の作成をモック
    mockPrismaOperation(
      'content',
      'create',
      vi.fn().mockResolvedValue(mockCreatedContent)
    );

    // 関数の実行
    const result = await createContent(mockContentData);

    // 結果の検証
    expect(result).toEqual(mockCreatedContent);

    // Prisma の呼び出し確認
    const { prisma } = await import('lib/prisma');
    expect(prisma.content.create).toHaveBeenCalledWith({
      data: {
        ...mockContentData,
        uploadedById: 'user-1',
      },
    });

    // キャッシュ無効化の確認
    const { safeRevalidateTag } = await import('lib/cache-utils');
    expect(safeRevalidateTag).toHaveBeenCalledWith(
      'user:user-1:event:event-1:contents'
    );
    expect(safeRevalidateTag).toHaveBeenCalledWith('user:user-1:event:event-1');
    expect(safeRevalidateTag).toHaveBeenCalledWith('user:user-1:events');
  });

  it('should handle required field validation', async () => {
    mockAuthenticatedUser({ id: 'user-1' });

    const invalidData = {
      title: '', // 空のタイトル
      type: 'PHOTO' as const,
      fileUrl: 'https://example.com/image.jpg',
      eventId: 'event-1',
    };

    await expect(createContent(invalidData as any)).rejects.toThrow();
  });
});
```

### READ 操作のテスト

```typescript
// src/lib/actions/getEvents.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEvents } from './getEvents';
import {
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from 'tests/utils/server-actions';

vi.mock('lib/session-helper');
vi.mock('lib/prisma');
vi.mock('next/cache');

describe('getEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return events for authenticated user', async () => {
    const mockEvents = [
      {
        id: 'event-1',
        name: 'Test Event 1',
        date: new Date('2024-01-01'),
        eventAccesses: [],
        contents: [],
        _count: {
          eventAccesses: 5,
          contents: 10,
        },
      },
      {
        id: 'event-2',
        name: 'Test Event 2',
        date: new Date('2024-02-01'),
        eventAccesses: [],
        contents: [],
        _count: {
          eventAccesses: 3,
          contents: 7,
        },
      },
    ];

    // セッションヘルパーをモック
    const { getServerSessionHelper } = await import('lib/session-helper');
    vi.mocked(getServerSessionHelper).mockResolvedValue({
      user: { id: 'user-1' },
    } as any);

    // unstable_cache をモック
    const { unstable_cache } = await import('next/cache');
    vi.mocked(unstable_cache).mockImplementation((fn) => fn);

    // Prisma の検索をモック
    const { enhance } = await import('@zenstackhq/runtime');
    const mockEnhancedPrisma = {
      event: {
        findMany: vi.fn().mockResolvedValue(mockEvents),
      },
    };
    vi.mocked(enhance).mockReturnValue(mockEnhancedPrisma as any);

    // 関数の実行
    const result = await getEvents();

    // 結果の検証
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Test Event 1');
    expect(result[1].name).toBe('Test Event 2');

    // キャッシュが正しく設定されているか確認
    expect(unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      ['user:user-1:events'],
      { tags: ['user:user-1:events'] }
    );
  });

  it('should throw error for unauthenticated user', async () => {
    const { getServerSessionHelper } = await import('lib/session-helper');
    vi.mocked(getServerSessionHelper).mockResolvedValue(null);

    await expect(getEvents()).rejects.toThrow('認証が必要です');
  });

  it('should handle database errors', async () => {
    const { getServerSessionHelper } = await import('lib/session-helper');
    vi.mocked(getServerSessionHelper).mockResolvedValue({
      user: { id: 'user-1' },
    } as any);

    const { unstable_cache } = await import('next/cache');
    vi.mocked(unstable_cache).mockImplementation((fn) => fn);

    const { enhance } = await import('@zenstackhq/runtime');
    const mockEnhancedPrisma = {
      event: {
        findMany: vi
          .fn()
          .mockRejectedValue(new Error('Database connection failed')),
      },
    };
    vi.mocked(enhance).mockReturnValue(mockEnhancedPrisma as any);

    // データベースエラーがそのまま投げられることを確認
    await expect(getEvents()).rejects.toThrow('Database connection failed');
  });
});
```

### UPDATE 操作のテスト

```typescript
// src/lib/actions/updateEvent.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateEvent } from './updateEvent';

describe('updateEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update event successfully', async () => {
    const eventId = 'event-1';
    const updateData = {
      name: 'Updated Event Name',
      description: 'Updated Description',
    };

    const mockUpdatedEvent = {
      id: eventId,
      ...updateData,
      date: new Date('2024-01-01'),
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockAuthenticatedUser({ id: 'user-1' });

    const { enhance } = await import('@zenstackhq/runtime');
    const mockEnhancedPrisma = {
      event: {
        update: vi.fn().mockResolvedValue(mockUpdatedEvent),
      },
    };
    vi.mocked(enhance).mockReturnValue(mockEnhancedPrisma as any);

    const result = await updateEvent(eventId, updateData);

    expect(result).toEqual(mockUpdatedEvent);
    expect(mockEnhancedPrisma.event.update).toHaveBeenCalledWith({
      where: { id: eventId },
      data: updateData,
    });

    // キャッシュ無効化の確認
    const { safeRevalidateTag } = await import('lib/cache-utils');
    expect(safeRevalidateTag).toHaveBeenCalledWith('user:user-1:event:event-1');
    expect(safeRevalidateTag).toHaveBeenCalledWith('user:user-1:events');
  });

  it('should handle partial updates', async () => {
    const eventId = 'event-1';
    const partialUpdateData = {
      name: 'Only Name Updated',
    };

    mockAuthenticatedUser({ id: 'user-1' });

    const { enhance } = await import('@zenstackhq/runtime');
    const mockEnhancedPrisma = {
      event: {
        update: vi
          .fn()
          .mockResolvedValue({ id: eventId, ...partialUpdateData }),
      },
    };
    vi.mocked(enhance).mockReturnValue(mockEnhancedPrisma as any);

    await updateEvent(eventId, partialUpdateData);

    expect(mockEnhancedPrisma.event.update).toHaveBeenCalledWith({
      where: { id: eventId },
      data: partialUpdateData,
    });
  });
});
```

### DELETE 操作のテスト

```typescript
// src/lib/actions/deleteContent.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteContent } from './deleteContent';

describe('deleteContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete content successfully', async () => {
    const contentId = 'content-1';
    const mockContent = {
      id: contentId,
      eventId: 'event-1',
      fileUrl: 'https://example.com/file.jpg',
    };

    mockAuthenticatedUser({ id: 'user-1' });

    const { enhance } = await import('@zenstackhq/runtime');
    const mockEnhancedPrisma = {
      content: {
        findUnique: vi.fn().mockResolvedValue(mockContent),
        delete: vi.fn().mockResolvedValue(mockContent),
      },
    };
    vi.mocked(enhance).mockReturnValue(mockEnhancedPrisma as any);

    const result = await deleteContent(contentId);

    expect(result).toEqual({ success: true });
    expect(mockEnhancedPrisma.content.findUnique).toHaveBeenCalledWith({
      where: { id: contentId },
      select: { id: true, eventId: true, fileUrl: true },
    });
    expect(mockEnhancedPrisma.content.delete).toHaveBeenCalledWith({
      where: { id: contentId },
    });

    // キャッシュ無効化の確認
    const { safeRevalidateTag } = await import('lib/cache-utils');
    expect(safeRevalidateTag).toHaveBeenCalledWith(
      'user:user-1:content:content-1'
    );
    expect(safeRevalidateTag).toHaveBeenCalledWith(
      'user:user-1:event:event-1:contents'
    );
    expect(safeRevalidateTag).toHaveBeenCalledWith('user:user-1:event:event-1');
    expect(safeRevalidateTag).toHaveBeenCalledWith('user:user-1:events');
  });

  it('should handle content not found', async () => {
    const contentId = 'non-existent';

    mockAuthenticatedUser({ id: 'user-1' });

    const { enhance } = await import('@zenstackhq/runtime');
    const mockEnhancedPrisma = {
      content: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };
    vi.mocked(enhance).mockReturnValue(mockEnhancedPrisma as any);

    await expect(deleteContent(contentId)).rejects.toThrow(
      'コンテンツが見つかりません'
    );
  });
});
```

## 複雑な操作のテスト

### バッチ処理のテスト

```typescript
// src/lib/actions/batchUpdateContents.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { batchUpdateContents } from './batchUpdateContents';

describe('batchUpdateContents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update multiple contents in transaction', async () => {
    const updates = [
      { id: 'content-1', data: { title: 'Updated Title 1' } },
      { id: 'content-2', data: { title: 'Updated Title 2' } },
    ];

    const mockResults = [
      { id: 'content-1', title: 'Updated Title 1', eventId: 'event-1' },
      { id: 'content-2', title: 'Updated Title 2', eventId: 'event-2' },
    ];

    mockAuthenticatedUser({ id: 'user-1' });

    const { enhance } = await import('@zenstackhq/runtime');
    const mockEnhancedPrisma = {
      $transaction: vi.fn().mockResolvedValue(mockResults),
      content: {
        update: vi.fn(),
      },
    };
    vi.mocked(enhance).mockReturnValue(mockEnhancedPrisma as any);

    const result = await batchUpdateContents(updates);

    expect(result).toEqual(mockResults);
    expect(mockEnhancedPrisma.$transaction).toHaveBeenCalledWith([
      expect.any(Promise),
      expect.any(Promise),
    ]);

    // 複数のキャッシュ無効化の確認
    const { safeRevalidateTag } = await import('lib/cache-utils');
    expect(safeRevalidateTag).toHaveBeenCalledWith('contents');
    expect(safeRevalidateTag).toHaveBeenCalledWith('user:user-1:events');
  });

  it('should rollback transaction on error', async () => {
    const updates = [
      { id: 'content-1', data: { title: 'Updated Title 1' } },
      { id: 'invalid-id', data: { title: 'This will fail' } },
    ];

    mockAuthenticatedUser({ id: 'user-1' });

    const { enhance } = await import('@zenstackhq/runtime');
    const mockEnhancedPrisma = {
      $transaction: vi.fn().mockRejectedValue(new Error('Transaction failed')),
    };
    vi.mocked(enhance).mockReturnValue(mockEnhancedPrisma as any);

    await expect(batchUpdateContents(updates)).rejects.toThrow(
      '一括更新に失敗しました'
    );
  });
});
```

### 条件付き操作のテスト

```typescript
// src/lib/actions/toggleContentFavorite.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleContentFavorite } from './toggleContentFavorite';

describe('toggleContentFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add favorite when not exists', async () => {
    const contentId = 'content-1';

    mockAuthenticatedUser({ id: 'user-1' });

    const { enhance } = await import('@zenstackhq/runtime');
    const mockEnhancedPrisma = {
      favorite: {
        findUnique: vi.fn().mockResolvedValue(null), // お気に入りが存在しない
        create: vi.fn().mockResolvedValue({ id: 'fav-1' }),
      },
    };
    vi.mocked(enhance).mockReturnValue(mockEnhancedPrisma as any);

    const result = await toggleContentFavorite(contentId);

    expect(result).toEqual({ isFavorite: true });
    expect(mockEnhancedPrisma.favorite.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        contentId: 'content-1',
      },
    });
  });

  it('should remove favorite when exists', async () => {
    const contentId = 'content-1';
    const existingFavorite = { id: 'fav-1', userId: 'user-1', contentId };

    mockAuthenticatedUser({ id: 'user-1' });

    const { enhance } = await import('@zenstackhq/runtime');
    const mockEnhancedPrisma = {
      favorite: {
        findUnique: vi.fn().mockResolvedValue(existingFavorite),
        delete: vi.fn().mockResolvedValue(existingFavorite),
      },
    };
    vi.mocked(enhance).mockReturnValue(mockEnhancedPrisma as any);

    const result = await toggleContentFavorite(contentId);

    expect(result).toEqual({ isFavorite: false });
    expect(mockEnhancedPrisma.favorite.delete).toHaveBeenCalledWith({
      where: { id: 'fav-1' },
    });
  });
});
```

## エラーハンドリングのテスト

### Prisma エラーのテスト

```typescript
// src/lib/actions/createEvent.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaKnownRequestError } from '@prisma/client/runtime/library';
import { createEvent } from './createEvent';

describe('createEvent - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle unique constraint violation', async () => {
    const eventData = {
      name: 'Duplicate Event',
      date: new Date('2024-01-01'),
    };

    mockAuthenticatedUser({ id: 'user-1' });

    const { enhance } = await import('@zenstackhq/runtime');
    const mockEnhancedPrisma = {
      event: {
        create: vi.fn().mockRejectedValue(
          new PrismaKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: '5.0.0',
          })
        ),
      },
    };
    vi.mocked(enhance).mockReturnValue(mockEnhancedPrisma as any);

    await expect(createEvent(eventData)).rejects.toThrow(
      'すでに存在するデータです'
    );
  });

  it('should handle record not found error', async () => {
    const eventData = {
      name: 'Event with Invalid Reference',
      date: new Date('2024-01-01'),
      parentId: 'non-existent-id',
    };

    mockAuthenticatedUser({ id: 'user-1' });

    const { enhance } = await import('@zenstackhq/runtime');
    const mockEnhancedPrisma = {
      event: {
        create: vi.fn().mockRejectedValue(
          new PrismaKnownRequestError('Record not found', {
            code: 'P2025',
            clientVersion: '5.0.0',
          })
        ),
      },
    };
    vi.mocked(enhance).mockReturnValue(mockEnhancedPrisma as any);

    await expect(createEvent(eventData)).rejects.toThrow(
      'データが見つかりません'
    );
  });
});
```

## パフォーマンステスト

### 並列処理のテスト

```typescript
// src/lib/actions/getDashboardData.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardData } from './getDashboardData';

describe('getDashboardData - Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle partial failures gracefully', async () => {
    mockAuthenticatedUser({ id: 'user-1' });

    // 一つは成功、一つは失敗するように設定
    vi.doMock('lib/actions/getEvents', () => ({
      getEvents: vi
        .fn()
        .mockResolvedValue([{ id: 'event-1', name: 'Event 1' }]),
    }));

    vi.doMock('lib/actions/getHomeSummary', () => ({
      getHomeSummary: vi.fn().mockRejectedValue(new Error('Summary failed')),
    }));

    const result = await getDashboardData();

    expect(result.events).toHaveLength(1);
    expect(result.summary).toBeNull();
    expect(result.errors).toContain('サマリーデータの取得に失敗');
  });

  it('should call data fetches in parallel', async () => {
    mockAuthenticatedUser({ id: 'user-1' });

    const mockGetEvents = vi.fn().mockResolvedValue([]);
    const mockGetHomeSummary = vi.fn().mockResolvedValue({});

    vi.doMock('lib/actions/getEvents', () => ({ getEvents: mockGetEvents }));
    vi.doMock('lib/actions/getHomeSummary', () => ({
      getHomeSummary: mockGetHomeSummary,
    }));

    const startTime = Date.now();
    await getDashboardData();
    const endTime = Date.now();

    // 並列実行により時間が短縮されることを確認
    // (実際のテストでは具体的なタイミング制約を設定)
    expect(endTime - startTime).toBeLessThan(1000);
    expect(mockGetEvents).toHaveBeenCalledTimes(1);
    expect(mockGetHomeSummary).toHaveBeenCalledTimes(1);
  });
});
```
