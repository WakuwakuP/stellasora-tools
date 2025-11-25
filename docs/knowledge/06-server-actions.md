# Server Actions 実装ガイド

## 基本構造

Server Actions は `'use server'` ディレクティブを使用して定義し、サーバーサイドでのデータ操作を行う。

## CRUD 操作の実装パターン

### データ作成 (Create)

```typescript
// src/lib/actions/createContent.ts
'use server';

import { enhance } from '@zenstackhq/runtime';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { CacheTags, safeRevalidateTag } from 'lib/cache-utils';
import { prisma } from 'lib/prisma';

export async function createContent(data: CreateContentData) {
  const session = await getServerSession(authOptions);

  if (session?.user?.id == null) {
    throw new Error('認証が必要です');
  }

  const enhancedPrisma = enhance(prisma, {
    user: { id: session.user.id },
  });

  try {
    // データの作成
    const content = await enhancedPrisma.content.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        thumbnailUrl: data.thumbnailUrl,
        metadata: data.metadata,
        eventId: data.eventId,
        uploadedById: session.user.id,
      },
    });

    // 影響を受けるキャッシュの無効化
    safeRevalidateTag(CacheTags.eventContents(session.user.id, data.eventId));
    safeRevalidateTag(CacheTags.event(session.user.id, data.eventId));
    safeRevalidateTag(CacheTags.events(session.user.id));

    return content;
  } catch (error) {
    console.error('Error creating content:', error);
    throw new Error('コンテンツの作成に失敗しました');
  }
}
```

### データ取得 (Read)

```typescript
// src/lib/actions/getEvents.ts
'use server';

import { unstable_cache } from 'next/cache';
import { enhance } from '@zenstackhq/runtime';
import { CacheKeys, CacheTags } from 'lib/cache-utils';
import { prisma } from 'lib/prisma';
import { getServerSessionHelper } from 'lib/session-helper';

export async function getEvents(): Promise<EventListItem[]> {
  const session = await getServerSessionHelper();

  if (session?.user?.id == null) {
    throw new Error('認証が必要です');
  }

  // キャッシュ化された関数を作成
  const cachedGetEvents = unstable_cache(
    async () => {
      const enhancedPrisma = enhance(prisma, {
        user: { id: session.user.id },
      });

      const events = await enhancedPrisma.event.findMany({
        include: {
          eventAccesses: true,
          contents: true,
          _count: {
            select: {
              eventAccesses: true,
              contents: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      });

      return events.map(transformEventToListItem);
    },
    [CacheKeys.events(session.user.id)],
    {
      tags: [CacheTags.events(session.user.id)],
    }
  );

  return await cachedGetEvents();
}
```

### データ更新 (Update)

```typescript
// src/lib/actions/updateContent.ts
'use server';

export async function updateContent(
  contentId: string,
  data: UpdateContentData
) {
  const session = await getServerSession(authOptions);

  if (session?.user?.id == null) {
    throw new Error('認証が必要です');
  }

  const enhancedPrisma = enhance(prisma, {
    user: { id: session.user.id },
  });

  try {
    // データの更新
    const content = await enhancedPrisma.content.update({
      where: { id: contentId },
      data: {
        ...(data.title != null &&
          data.title.length > 0 && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.thumbnailUrl !== undefined && {
          thumbnailUrl: data.thumbnailUrl,
        }),
        ...(data.metadata !== undefined && { metadata: data.metadata }),
      },
      include: {
        event: {
          select: { id: true },
        },
      },
    });

    // 関連するキャッシュの無効化
    safeRevalidateTag(CacheTags.content(session.user.id, contentId));
    safeRevalidateTag(
      CacheTags.eventContents(session.user.id, String(content.event.id))
    );
    safeRevalidateTag(
      CacheTags.event(session.user.id, String(content.event.id))
    );

    return content;
  } catch (error) {
    console.error('Error updating content:', error);
    throw new Error('コンテンツの更新に失敗しました');
  }
}
```

### データ削除 (Delete)

```typescript
// src/lib/actions/deleteContent.ts
'use server';

export async function deleteContent(contentId: string) {
  const session = await getServerSession(authOptions);

  if (session?.user?.id == null) {
    throw new Error('認証が必要です');
  }

  const enhancedPrisma = enhance(prisma, {
    user: { id: session.user.id },
  });

  try {
    // 削除前に関連データを取得（キャッシュ無効化のため）
    const content = await enhancedPrisma.content.findUnique({
      where: { id: contentId },
      select: {
        id: true,
        eventId: true,
        fileUrl: true,
      },
    });

    if (!content) {
      throw new Error('コンテンツが見つかりません');
    }

    // データの削除
    await enhancedPrisma.content.delete({
      where: { id: contentId },
    });

    // ファイルの削除（必要に応じて）
    if (content.fileUrl) {
      await deleteFile(content.fileUrl);
    }

    // キャッシュの無効化
    safeRevalidateTag(CacheTags.content(session.user.id, contentId));
    safeRevalidateTag(
      CacheTags.eventContents(session.user.id, content.eventId)
    );
    safeRevalidateTag(CacheTags.event(session.user.id, content.eventId));
    safeRevalidateTag(CacheTags.events(session.user.id));

    return { success: true };
  } catch (error) {
    console.error('Error deleting content:', error);
    throw new Error('コンテンツの削除に失敗しました');
  }
}
```

## 認証と認可

### セッション確認

```typescript
// 基本的な認証確認
export async function protectedAction() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id == null) {
    throw new Error('認証が必要です');
  }

  // 認証済みユーザーの処理
}
```

### ZenStack を使った認可

```typescript
// ZenStack の enhance を使用してアクセス制御を適用
const enhancedPrisma = enhance(prisma, {
  user: { id: session.user.id },
});

// enhance された Prisma クライアントは自動的にアクセス制御を適用
const events = await enhancedPrisma.event.findMany({
  // アクセス権限があるイベントのみ取得される
});
```

## エラーハンドリング

### 基本的なエラーハンドリング

```typescript
try {
  const result = await performDatabaseOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);

  // ユーザーフレンドリーなエラーメッセージを投げる
  if (error instanceof PrismaKnownRequestError) {
    if (error.code === 'P2002') {
      throw new Error('すでに存在するデータです');
    }
    if (error.code === 'P2025') {
      throw new Error('データが見つかりません');
    }
  }

  throw new Error('操作に失敗しました');
}
```

### Prisma エラーコードの対応

```typescript
function handlePrismaError(error: unknown): never {
  if (error instanceof PrismaKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new Error('すでに存在するデータです');
      case 'P2025':
        throw new Error('データが見つかりません');
      case 'P2003':
        throw new Error('関連するデータが存在しません');
      case 'P2016':
        throw new Error('クエリの解釈に失敗しました');
      default:
        console.error('Prisma error:', error.code, error.message);
        throw new Error('データベースエラーが発生しました');
    }
  }

  console.error('Unknown error:', error);
  throw new Error('予期しないエラーが発生しました');
}
```

## 複雑な操作パターン

### バッチ処理

```typescript
export async function batchUpdateContents(
  updates: Array<{ id: string; data: Partial<Content> }>
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('認証が必要です');

  const enhancedPrisma = enhance(prisma, {
    user: { id: session.user.id },
  });

  try {
    // トランザクションを使用してバッチ処理
    const results = await enhancedPrisma.$transaction(
      updates.map(({ id, data }) =>
        enhancedPrisma.content.update({
          where: { id },
          data,
        })
      )
    );

    // 影響を受けるキャッシュの無効化
    const eventIds = new Set(results.map((r) => r.eventId));

    // 全体のキャッシュを無効化
    safeRevalidateTag(CacheTags.contents);
    safeRevalidateTag(CacheTags.events(session.user.id));

    // 個別のイベントキャッシュも無効化
    eventIds.forEach((eventId) => {
      safeRevalidateTag(CacheTags.event(session.user.id, eventId));
      safeRevalidateTag(CacheTags.eventContents(session.user.id, eventId));
    });

    return results;
  } catch (error) {
    console.error('Batch update failed:', error);
    throw new Error('一括更新に失敗しました');
  }
}
```

### 条件付き操作

```typescript
export async function toggleContentFavorite(contentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('認証が必要です');

  const enhancedPrisma = enhance(prisma, {
    user: { id: session.user.id },
  });

  try {
    // 既存のお気に入り状態を確認
    const existingFavorite = await enhancedPrisma.favorite.findUnique({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId,
        },
      },
    });

    let result;

    if (existingFavorite) {
      // お気に入りを削除
      await enhancedPrisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
      result = { isFavorite: false };
    } else {
      // お気に入りを追加
      await enhancedPrisma.favorite.create({
        data: {
          userId: session.user.id,
          contentId,
        },
      });
      result = { isFavorite: true };
    }

    // キャッシュの無効化
    safeRevalidateTag(CacheTags.contentFavorite(session.user.id, contentId));
    safeRevalidateTag(CacheTags.contentFavoriteCount(contentId));

    return result;
  } catch (error) {
    console.error('Toggle favorite failed:', error);
    throw new Error('お気に入りの切り替えに失敗しました');
  }
}
```

## バリデーション

### Zod を使用した入力検証

```typescript
import { z } from 'zod';

const CreateContentSchema = z.object({
  title: z
    .string()
    .min(1, '題名は必須です')
    .max(255, '題名は255文字以内で入力してください'),
  description: z.string().optional(),
  type: z.enum(['PHOTO', 'VIDEO', 'DOCUMENT']),
  eventId: z.string().uuid('不正なイベントIDです'),
  fileUrl: z.string().url('不正なURLです'),
  fileName: z.string().min(1, 'ファイル名は必須です'),
  fileSize: z.number().positive('ファイルサイズは正の数である必要があります'),
  mimeType: z.string().min(1, 'MIMEタイプは必須です'),
});

export async function createContentWithValidation(rawData: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('認証が必要です');

  // 入力データの検証
  const validatedData = CreateContentSchema.parse(rawData);

  return await createContent(validatedData);
}
```

## パフォーマンス最適化

### 選択的データ取得

```typescript
export async function getEventSummary(eventId: string) {
  const session = await getServerSessionHelper();
  if (!session?.user?.id) throw new Error('認証が必要です');

  const cachedGetEventSummary = unstable_cache(
    async () => {
      const enhancedPrisma = enhance(prisma, {
        user: { id: session.user.id },
      });

      // 必要な情報のみ取得
      return await enhancedPrisma.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          name: true,
          date: true,
          _count: {
            select: {
              contents: true,
              eventAccesses: true,
            },
          },
        },
      });
    },
    [CacheKeys.eventSummary(session.user.id, eventId)],
    {
      tags: [CacheTags.event(session.user.id, eventId)],
    }
  );

  return await cachedGetEventSummary();
}
```

### 並列データ取得

```typescript
export async function getEventDetails(eventId: string) {
  const session = await getServerSessionHelper();
  if (!session?.user?.id) throw new Error('認証が必要です');

  // 複数のデータを並列で取得
  const [event, contents, accessCount] = await Promise.all([
    getEvent(eventId),
    getEventContents(eventId),
    getEventAccessCount(eventId),
  ]);

  return {
    event,
    contents,
    accessCount,
  };
}
```

## テスト可能な Server Actions

### 依存関係の注入

```typescript
// テスト時に依存関係を置き換え可能な構造
export async function createContent(
  data: CreateContentData,
  dependencies?: {
    getSession?: typeof getServerSession;
    enhancePrisma?: typeof enhance;
  }
) {
  const getSession = dependencies?.getSession || getServerSession;
  const enhancePrisma = dependencies?.enhancePrisma || enhance;

  const session = await getSession(authOptions);
  if (!session?.user?.id) throw new Error('認証が必要です');

  const prismaClient = enhancePrisma(prisma, {
    user: { id: session.user.id },
  });

  // 実装...
}
```
