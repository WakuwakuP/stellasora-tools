# キャッシュシステムガイド

## 基本設計

Next.js の `unstable_cache` を使用した包括的なキャッシュシステムを実装している。

## キャッシュキーの設計

### CacheKeys の構造

```typescript
// src/lib/cache-utils.ts
export const CacheKeys = {
  // ユーザー固有データのキー
  homeSummary: (userId: string) => `user:${userId}:home-summary`,
  events: (userId: string) => `user:${userId}:events`,
  event: (userId: string, eventId: string, mode?: string) =>
    mode != null
      ? `user:${userId}:event:${eventId}:${mode}`
      : `user:${userId}:event:${eventId}`,

  // コンテンツ関連のキー
  content: (userId: string, contentId: string) =>
    `user:${userId}:content:${contentId}`,
  eventContents: (userId: string, eventId: string) =>
    `user:${userId}:event:${eventId}:contents`,

  // お気に入り関連のキー
  contentFavorite: (userId: string, contentId: string) =>
    `user:${userId}:content:${contentId}:favorite`,
  contentFavoriteCount: (contentId: string) => `content:${contentId}:favorite`,
} as const;
```

### キー設計の原則

1. **取得パラメータを全て含める**: キャッシュキーには取得に使用するパラメータを全て含める
2. **階層構造**: `entity:id:subentity:subid` の形式で階層を表現
3. **ユーザー固有データ**: ユーザー固有のデータには `user:${userId}:` を接頭辞として付ける
4. **一意性の保証**: 同じパラメータは常に同じキーを生成する

### 複雑なパラメータを含むキー例

```typescript
// 検索パラメータを含むキー
const searchCacheKey = (userId: string, query: string, filters: object) =>
  `user:${userId}:search:${query}:${JSON.stringify(filters)}`;

// ページネーションを含むキー
const paginatedCacheKey = (userId: string, page: number, limit: number) =>
  `user:${userId}:items:page:${page}:limit:${limit}`;
```

## キャッシュタグの設計

### CacheTags の構造

```typescript
// src/lib/cache-utils.ts
export const CacheTags = {
  // テーブル名をベースとしたタグ
  events: (userId: string) => `user:${userId}:events`,
  contents: 'contents',
  event: (userId: string, eventId: string) => `user:${userId}:event:${eventId}`,
  eventContents: (userId: string, eventId: string) =>
    `user:${userId}:event:${eventId}:contents`,
  content: (userId: string, contentId: string) =>
    `user:${userId}:content:${contentId}`,
  contentFavorite: (userId: string, contentId: string) =>
    `user:${userId}:content:${contentId}:favorite`,
} as const;
```

### タグ設計の原則

1. **テーブル名をベース**: 取得したテーブルをタグとして使用
2. **影響範囲の考慮**: 更新時に影響を受ける可能性のあるテーブル名をリストアップ
3. **階層的無効化**: 特定のリソースの更新が関連するキャッシュに影響する構造

## キャッシュの実装パターン

### 基本的なデータ取得

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

### パラメータ付きデータ取得

```typescript
export async function getEvent(
  eventId: string,
  mode?: string
): Promise<EventDetailType | null> {
  const session = await getServerSessionHelper();

  if (session?.user?.id == null) {
    throw new Error('認証が必要です');
  }

  const cachedGetEvent = unstable_cache(
    async () => {
      const enhancedPrisma = enhance(prisma, {
        user: { id: session.user.id },
      });

      const event = await enhancedPrisma.event.findFirst({
        where: { id: eventId },
        include: {
          eventAccesses: true,
          contents: mode === 'edit' ? { include: { favorites: true } } : true,
          _count: { select: { eventAccesses: true } },
        },
      });

      return event ? transformEventToDetail(event) : null;
    },
    [CacheKeys.event(session.user.id, eventId, mode)],
    {
      tags: [
        CacheTags.event(session.user.id, eventId),
        CacheTags.eventContents(session.user.id, eventId),
      ],
    }
  );

  return await cachedGetEvent();
}
```

### 複雑なクエリのキャッシュ

```typescript
export async function searchContents(
  query: string,
  filters: SearchFilters
): Promise<ContentItem[]> {
  const session = await getServerSessionHelper();
  if (!session?.user?.id) throw new Error('認証が必要です');

  // フィルタを正規化してキーに含める
  const normalizedFilters = {
    ...filters,
    sortOrder: filters.sortOrder || 'desc',
  };

  const cachedSearch = unstable_cache(
    async () => {
      const enhancedPrisma = enhance(prisma, {
        user: { id: session.user.id },
      });

      return await enhancedPrisma.content.findMany({
        where: {
          title: { contains: query },
          type: filters.type,
          createdAt: filters.dateRange
            ? {
                gte: filters.dateRange.from,
                lte: filters.dateRange.to,
              }
            : undefined,
        },
        orderBy: { createdAt: normalizedFilters.sortOrder },
        include: { favorites: true },
      });
    },
    [CacheKeys.searchContents(session.user.id, query, normalizedFilters)],
    {
      tags: [CacheTags.contents],
    }
  );

  return await cachedSearch();
}
```

## キャッシュの無効化

### safeRevalidateTag の使用

```typescript
// src/lib/cache-utils.ts
import { revalidateTag } from 'next/cache';

export function safeRevalidateTag(tag: string) {
  try {
    revalidateTag(tag);
    console.log(`キャッシュタグを無効化しました: ${tag}`);
  } catch (error) {
    console.error('キャッシュタグの無効化に失敗:', error);
  }
}
```

### データ更新時の無効化パターン

```typescript
// src/lib/actions/createEvent.ts
'use server';

import { safeRevalidateTag } from 'lib/cache-utils';

export async function createEvent(data: CreateEventData): Promise<Event> {
  const session = await getServerSessionHelper();
  if (!session?.user?.id) throw new Error('認証が必要です');

  const enhancedPrisma = enhance(prisma, {
    user: { id: session.user.id },
  });

  const event = await enhancedPrisma.event.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  });

  // 関連するキャッシュを無効化
  safeRevalidateTag(CacheTags.events(session.user.id));
  safeRevalidateTag(CacheTags.homeSummary(session.user.id));

  return event;
}
```

### 複数タグの無効化

```typescript
export async function updateContent(
  contentId: string,
  data: UpdateContentData
): Promise<Content> {
  const session = await getServerSessionHelper();
  if (!session?.user?.id) throw new Error('認証が必要です');

  const enhancedPrisma = enhance(prisma, {
    user: { id: session.user.id },
  });

  // 既存のコンテンツを取得してイベント情報を得る
  const existingContent = await enhancedPrisma.content.findUnique({
    where: { id: contentId },
    select: { eventId: true },
  });

  if (!existingContent) {
    throw new Error('コンテンツが見つかりません');
  }

  const updatedContent = await enhancedPrisma.content.update({
    where: { id: contentId },
    data,
  });

  // 複数の関連キャッシュを無効化
  const tagsToInvalidate = [
    CacheTags.content(session.user.id, contentId),
    CacheTags.contents,
    CacheTags.eventContents(session.user.id, existingContent.eventId),
  ];

  tagsToInvalidate.forEach(safeRevalidateTag);

  return updatedContent;
}
```

## パフォーマンス最適化

### 並列キャッシュ取得

```typescript
export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id != null) {
    try {
      // 複数のキャッシュ化されたデータを並列で取得
      const [events, summary, recentContents] = await Promise.all([
        getEvents(),
        getHomeSummary(),
        getRecentContents(10), // 最新10件
      ]);

      return (
        <HomeComponent
          events={events}
          summary={summary}
          recentContents={recentContents}
        />
      );
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }

  return <EmptyState />;
}
```

### 段階的データ読み込み

```typescript
// 重要なデータを先に取得、詳細データは後から
export default async function EventPage({ params }: { params: { eventId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <AuthError />;

  // 基本情報を先に取得
  const event = await getEvent(params.eventId);

  if (!event) return <NotFound />;

  return (
    <div>
      <EventHeader event={event} />
      <Suspense fallback={<ContentsSkeleton />}>
        <EventContents eventId={params.eventId} />
      </Suspense>
    </div>
  );
}

// 詳細データは別コンポーネントで非同期取得
async function EventContents({ eventId }: { eventId: string }) {
  const contents = await getEventContents(eventId);
  return <ContentsList contents={contents} />;
}
```

## デバッグとモニタリング

### キャッシュヒット率の確認

```typescript
export function createCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  tags: string[]
) {
  return unstable_cache(
    async (...args: T) => {
      const start = Date.now();
      const result = await fn(...args);
      const duration = Date.now() - start;

      console.log(`キャッシュ実行: ${keyGenerator(...args)} (${duration}ms)`);
      return result;
    },
    keyGenerator(...(arguments as unknown as T)),
    { tags }
  );
}
```

### キャッシュ統計の取得

```typescript
// 開発環境でのキャッシュ使用状況ログ
export function logCacheUsage(operation: string, key: string, hit: boolean) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Cache ${hit ? 'HIT' : 'MISS'}] ${operation}: ${key}`);
  }
}
```

## 注意事項とベストプラクティス

### キーの命名規則

```typescript
// ✅ 良い例: 階層的で明確
const userEventsKey = `user:${userId}:events`;
const eventDetailsKey = `user:${userId}:event:${eventId}`;

// ❌ 悪い例: あいまいで衝突の可能性
const eventsKey = `events_${userId}`;
const detailsKey = `event_details`;
```

### タグの適切な設定

```typescript
// ✅ 良い例: 影響範囲を考慮
const createContentTags = [
  CacheTags.contents,
  CacheTags.eventContents(userId, eventId),
  CacheTags.homeSummary(userId),
];

// ❌ 悪い例: 不必要に広範囲
const broadTags = ['all_data']; // すべてのキャッシュが無効化される
```

### メモリ使用量の監視

```typescript
// 大きなデータセットはページング
export async function getPaginatedEvents(
  userId: string,
  page: number = 1,
  limit: number = 50
): Promise<PaginatedResult<Event>> {
  const offset = (page - 1) * limit;

  const cachedGetPaginatedEvents = unstable_cache(
    // クエリ実装
    [CacheKeys.paginatedEvents(userId, page, limit)],
    {
      tags: [CacheTags.events(userId)],
      revalidate: 300, // 5分でキャッシュ期限切れ
    }
  );

  return await cachedGetPaginatedEvents();
}
```
