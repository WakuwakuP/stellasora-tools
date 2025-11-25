# データ取得パターンガイド

## 基本的な取得パターン

### 単一データの取得

```typescript
// src/lib/actions/getEvent.ts
'use server';

import { unstable_cache } from 'next/cache';
import { enhance } from '@zenstackhq/runtime';
import { CacheKeys, CacheTags } from 'lib/cache-utils';
import { prisma } from 'lib/prisma';
import { getServerSessionHelper } from 'lib/session-helper';

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

### リスト取得

```typescript
// src/lib/actions/getEvents.ts
export async function getEvents(): Promise<EventListItem[]> {
  const session = await getServerSessionHelper();

  if (session?.user?.id == null) {
    throw new Error('認証が必要です');
  }

  const cachedGetEvents = unstable_cache(
    async () => {
      const enhancedPrisma = enhance(prisma, {
        user: { id: session.user.id },
      });

      const events = await enhancedPrisma.event.findMany({
        include: {
          eventAccesses: true,
          contents: {
            take: 3, // プレビュー用に最初の3件のみ
            orderBy: { createdAt: 'desc' },
          },
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
      revalidate: 300, // 5分間キャッシュ
    }
  );

  return await cachedGetEvents();
}
```

## 条件付き取得

### フィルタリング

```typescript
export async function getEventsByStatus(
  status: 'active' | 'archived'
): Promise<EventListItem[]> {
  const session = await getServerSessionHelper();
  if (!session?.user?.id) throw new Error('認証が必要です');

  const cachedGetEventsByStatus = unstable_cache(
    async () => {
      const enhancedPrisma = enhance(prisma, {
        user: { id: session.user.id },
      });

      const events = await enhancedPrisma.event.findMany({
        where: {
          status: status.toUpperCase(),
        },
        include: {
          eventAccesses: true,
          _count: {
            select: {
              contents: true,
              eventAccesses: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      });

      return events.map(transformEventToListItem);
    },
    [CacheKeys.eventsByStatus(session.user.id, status)],
    {
      tags: [CacheTags.events(session.user.id)],
    }
  );

  return await cachedGetEventsByStatus();
}
```

### 検索機能

```typescript
export async function searchContents(
  query: string,
  filters: {
    eventId?: string;
    type?: ContentType;
    dateRange?: { from: Date; to: Date };
  } = {}
): Promise<ContentSearchResult[]> {
  const session = await getServerSessionHelper();
  if (!session?.user?.id) throw new Error('認証が必要です');

  // 検索パラメータを正規化
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedFilters = {
    ...filters,
    type: filters.type || undefined,
  };

  const cachedSearchContents = unstable_cache(
    async () => {
      const enhancedPrisma = enhance(prisma, {
        user: { id: session.user.id },
      });

      const whereClause: any = {};

      // テキスト検索
      if (normalizedQuery) {
        whereClause.OR = [
          { title: { contains: normalizedQuery, mode: 'insensitive' } },
          { description: { contains: normalizedQuery, mode: 'insensitive' } },
          { fileName: { contains: normalizedQuery, mode: 'insensitive' } },
        ];
      }

      // フィルタ適用
      if (normalizedFilters.eventId) {
        whereClause.eventId = normalizedFilters.eventId;
      }

      if (normalizedFilters.type) {
        whereClause.type = normalizedFilters.type;
      }

      if (normalizedFilters.dateRange) {
        whereClause.createdAt = {
          gte: normalizedFilters.dateRange.from,
          lte: normalizedFilters.dateRange.to,
        };
      }

      const contents = await enhancedPrisma.content.findMany({
        where: whereClause,
        include: {
          event: {
            select: { id: true, name: true },
          },
          favorites: {
            where: { userId: session.user.id },
          },
          _count: {
            select: { favorites: true },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { title: 'asc' }],
        take: 50, // 検索結果の上限
      });

      return contents.map(transformContentToSearchResult);
    },
    [
      CacheKeys.searchContents(
        session.user.id,
        normalizedQuery,
        normalizedFilters
      ),
    ],
    {
      tags: [CacheTags.contents],
      revalidate: 60, // 1分間キャッシュ（検索結果は短めに）
    }
  );

  return await cachedSearchContents();
}
```

## ページネーション

### 基本的なページネーション

```typescript
export async function getPaginatedContents(
  page: number = 1,
  limit: number = 20,
  eventId?: string
): Promise<PaginatedResult<ContentListItem>> {
  const session = await getServerSessionHelper();
  if (!session?.user?.id) throw new Error('認証が必要です');

  const offset = (page - 1) * limit;

  const cachedGetPaginatedContents = unstable_cache(
    async () => {
      const enhancedPrisma = enhance(prisma, {
        user: { id: session.user.id },
      });

      const whereClause = eventId ? { eventId } : {};

      const [contents, totalCount] = await Promise.all([
        enhancedPrisma.content.findMany({
          where: whereClause,
          include: {
            event: {
              select: { id: true, name: true },
            },
            favorites: {
              where: { userId: session.user.id },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        enhancedPrisma.content.count({
          where: whereClause,
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: contents.map(transformContentToListItem),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    },
    [CacheKeys.paginatedContents(session.user.id, page, limit, eventId)],
    {
      tags: [CacheTags.contents],
    }
  );

  return await cachedGetPaginatedContents();
}
```

### カーソルベースページネーション

```typescript
export async function getContentsAfterCursor(
  cursor?: string,
  limit: number = 20
): Promise<CursorPaginatedResult<ContentListItem>> {
  const session = await getServerSessionHelper();
  if (!session?.user?.id) throw new Error('認証が必要です');

  const cachedGetContentsAfterCursor = unstable_cache(
    async () => {
      const enhancedPrisma = enhance(prisma, {
        user: { id: session.user.id },
      });

      const whereClause = cursor
        ? {
            id: { lt: cursor }, // カーソル以降のデータを取得
          }
        : {};

      const contents = await enhancedPrisma.content.findMany({
        where: whereClause,
        include: {
          event: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit + 1, // 次のページが存在するかチェックするため+1
      });

      const hasNextPage = contents.length > limit;
      const dataToReturn = hasNextPage ? contents.slice(0, -1) : contents;
      const nextCursor = hasNextPage ? contents[contents.length - 2].id : null;

      return {
        data: dataToReturn.map(transformContentToListItem),
        nextCursor,
        hasNextPage,
      };
    },
    [CacheKeys.cursorPaginatedContents(session.user.id, cursor, limit)],
    {
      tags: [CacheTags.contents],
    }
  );

  return await cachedGetContentsAfterCursor();
}
```

## 集計データの取得

### サマリー情報

```typescript
export async function getHomeSummary(): Promise<HomeSummaryData> {
  const session = await getServerSessionHelper();
  if (!session?.user?.id) throw new Error('認証が必要です');

  const cachedGetHomeSummary = unstable_cache(
    async () => {
      const enhancedPrisma = enhance(prisma, {
        user: { id: session.user.id },
      });

      const [
        totalEvents,
        totalContents,
        recentEvents,
        recentContents,
        favoriteCount,
      ] = await Promise.all([
        // 総イベント数
        enhancedPrisma.event.count(),

        // 総コンテンツ数
        enhancedPrisma.content.count(),

        // 最近のイベント（5件）
        enhancedPrisma.event.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            date: true,
            createdAt: true,
          },
        }),

        // 最近のコンテンツ（10件）
        enhancedPrisma.content.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            type: true,
            createdAt: true,
            event: {
              select: { name: true },
            },
          },
        }),

        // お気に入り総数
        enhancedPrisma.favorite.count({
          where: { userId: session.user.id },
        }),
      ]);

      return {
        totalEvents,
        totalContents,
        favoriteCount,
        recentEvents,
        recentContents,
      };
    },
    [CacheKeys.homeSummary(session.user.id)],
    {
      tags: [
        CacheTags.events(session.user.id),
        CacheTags.contents,
        CacheTags.favorites(session.user.id),
      ],
      revalidate: 600, // 10分間キャッシュ
    }
  );

  return await cachedGetHomeSummary();
}
```

### 統計データ

```typescript
export async function getEventStatistics(
  eventId: string
): Promise<EventStatistics> {
  const session = await getServerSessionHelper();
  if (!session?.user?.id) throw new Error('認証が必要です');

  const cachedGetEventStatistics = unstable_cache(
    async () => {
      const enhancedPrisma = enhance(prisma, {
        user: { id: session.user.id },
      });

      const [contentStats, accessStats, favoriteStats] = await Promise.all([
        // コンテンツ種別統計
        enhancedPrisma.content.groupBy({
          by: ['type'],
          where: { eventId },
          _count: { type: true },
          _sum: { fileSize: true },
        }),

        // アクセス統計
        enhancedPrisma.eventAccess.groupBy({
          by: ['createdAt'],
          where: { eventId },
          _count: { id: true },
          orderBy: { createdAt: 'desc' },
          take: 30, // 過去30日
        }),

        // お気に入り統計
        enhancedPrisma.content.findMany({
          where: { eventId },
          select: {
            id: true,
            title: true,
            _count: {
              select: { favorites: true },
            },
          },
          orderBy: {
            favorites: {
              _count: 'desc',
            },
          },
          take: 10, // トップ10
        }),
      ]);

      return {
        contentsByType: contentStats.map((stat) => ({
          type: stat.type,
          count: stat._count.type,
          totalSize: stat._sum.fileSize || 0,
        })),
        dailyAccess: accessStats.map((stat) => ({
          date: stat.createdAt,
          count: stat._count.id,
        })),
        popularContents: favoriteStats.map((content) => ({
          id: content.id,
          title: content.title,
          favoriteCount: content._count.favorites,
        })),
      };
    },
    [CacheKeys.eventStatistics(session.user.id, eventId)],
    {
      tags: [
        CacheTags.event(session.user.id, eventId),
        CacheTags.eventContents(session.user.id, eventId),
      ],
      revalidate: 3600, // 1時間キャッシュ
    }
  );

  return await cachedGetEventStatistics();
}
```

## 関連データの並列取得

### 複数データの同時取得

```typescript
export async function getEventFullDetails(
  eventId: string
): Promise<EventFullDetails> {
  const session = await getServerSessionHelper();
  if (!session?.user?.id) throw new Error('認証が必要です');

  const cachedGetEventFullDetails = unstable_cache(
    async () => {
      // 複数のデータを並列で取得
      const [event, contents, statistics, recentAccess, collaborators] =
        await Promise.all([
          getEvent(eventId),
          getEventContents(eventId),
          getEventStatistics(eventId),
          getEventRecentAccess(eventId, 5),
          getEventCollaborators(eventId),
        ]);

      if (!event) {
        throw new Error('イベントが見つかりません');
      }

      return {
        event,
        contents,
        statistics,
        recentAccess,
        collaborators,
      };
    },
    [CacheKeys.eventFullDetails(session.user.id, eventId)],
    {
      tags: [
        CacheTags.event(session.user.id, eventId),
        CacheTags.eventContents(session.user.id, eventId),
      ],
    }
  );

  return await cachedGetEventFullDetails();
}
```

## エラーハンドリング

### データが見つからない場合

```typescript
export async function getEventOrThrow(
  eventId: string
): Promise<EventDetailType> {
  const event = await getEvent(eventId);

  if (!event) {
    throw new Error(`イベント（ID: ${eventId}）が見つかりません`);
  }

  return event;
}
```

### 部分的失敗の処理

```typescript
export async function getDashboardData(): Promise<DashboardData> {
  const session = await getServerSessionHelper();
  if (!session?.user?.id) throw new Error('認証が必要です');

  const cachedGetDashboardData = unstable_cache(
    async () => {
      // 個別の取得処理で部分的失敗を許可
      const [eventsResult, summaryResult, notificationsResult] =
        await Promise.allSettled([
          getEvents(),
          getHomeSummary(),
          getNotifications(),
        ]);

      return {
        events: eventsResult.status === 'fulfilled' ? eventsResult.value : [],
        summary:
          summaryResult.status === 'fulfilled' ? summaryResult.value : null,
        notifications:
          notificationsResult.status === 'fulfilled'
            ? notificationsResult.value
            : [],
        errors: [
          ...(eventsResult.status === 'rejected'
            ? ['イベントデータの取得に失敗']
            : []),
          ...(summaryResult.status === 'rejected'
            ? ['サマリーデータの取得に失敗']
            : []),
          ...(notificationsResult.status === 'rejected'
            ? ['通知データの取得に失敗']
            : []),
        ],
      };
    },
    [CacheKeys.dashboardData(session.user.id)],
    {
      tags: [
        CacheTags.events(session.user.id),
        CacheTags.contents,
        CacheTags.notifications(session.user.id),
      ],
    }
  );

  return await cachedGetDashboardData();
}
```

## データ変換

### レスポンスの標準化

```typescript
function transformEventToListItem(event: any): EventListItem {
  return {
    id: event.id,
    name: event.name,
    date: event.date,
    description: event.description,
    status: event.status,
    contentCount: event._count?.contents || 0,
    accessCount: event._count?.eventAccesses || 0,
    thumbnailUrl: event.contents?.[0]?.thumbnailUrl || null,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

function transformContentToListItem(content: any): ContentListItem {
  return {
    id: content.id,
    title: content.title,
    description: content.description,
    type: content.type,
    fileName: content.fileName,
    fileSize: content.fileSize,
    mimeType: content.mimeType,
    thumbnailUrl: content.thumbnailUrl,
    eventName: content.event?.name || '',
    isFavorite: (content.favorites?.length || 0) > 0,
    favoriteCount: content._count?.favorites || 0,
    createdAt: content.createdAt,
  };
}
```
