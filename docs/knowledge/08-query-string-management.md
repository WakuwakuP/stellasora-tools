# クエリパラメータ管理ガイド (nuqs)

## 概要

nuqs は Next.js App Router に対応した型安全なクエリパラメータ管理ライブラリです。
`createSearchParamsCache` と `createSerializer` を使用することで、Server Component と Client Component 間で一貫したクエリパラメータ管理を実現できます。

## 基本設定

### 1. NuqsAdapter の設定

App Router で nuqs を使用するには、レイアウトに `NuqsAdapter` を設定します。

```tsx
// src/app/layout.tsx
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
```

### 2. パーサー定義の作成

クエリパラメータのパーサーを一元管理します。

```tsx
// src/lib/search-params.ts
import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  parseAsArrayOf,
} from 'nuqs/server';

// 型定義
export type SortOrder = 'asc' | 'desc';
export type ContentType = 'image' | 'video' | '3d';

// パーサー定義（Server/Client で共有）
export const searchParamsParsers = {
  q: parseAsString,
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  sort: parseAsStringEnum<SortOrder>(['asc', 'desc']).withDefault('desc'),
  type: parseAsStringEnum<ContentType>(['image', 'video', '3d']),
  tags: parseAsArrayOf(parseAsString, ',').withDefault([]),
};

// Server Component 用キャッシュ
export const searchParamsCache = createSearchParamsCache(searchParamsParsers);

// URL 生成用シリアライザー
export const serialize = createSerializer(searchParamsParsers);
```

## 利用可能なパーサー

```tsx
import {
  parseAsString, // 文字列（デフォルト）
  parseAsInteger, // 整数
  parseAsFloat, // 浮動小数点数
  parseAsBoolean, // ブール値
  parseAsIsoDateTime, // ISO 8601 日付時刻
  parseAsArrayOf, // 配列
  parseAsJson, // JSON オブジェクト
  parseAsStringEnum, // 文字列の列挙型
  parseAsStringLiteral, // 文字列リテラル
} from 'nuqs/server';
```

## Server Component での使用

`createSearchParamsCache` を使用してクエリパラメータを取得します。

```tsx
// src/app/contents/page.tsx
import { searchParamsCache } from 'lib/search-params';
import { getContents } from 'lib/actions/getContents';
import { ContentFilters } from 'components/ContentFilters';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ContentsPage({ searchParams }: PageProps) {
  // キャッシュを使ってパラメータを取得（型安全）
  const { q, page, limit, sort, type, tags } =
    await searchParamsCache.parse(searchParams);

  const contents = await getContents({
    query: q ?? undefined,
    page,
    limit,
    sortOrder: sort,
    contentType: type ?? undefined,
    tags,
  });

  return (
    <div>
      <h1>コンテンツ一覧</h1>
      <ContentFilters />
      <ContentList contents={contents} />
      <Pagination currentPage={page} />
    </div>
  );
}
```

## Client Component での使用

`useQueryStates` と共有パーサーを使用してクエリパラメータを管理します。

```tsx
// src/components/ContentFilters.tsx
'use client';

import { useQueryStates } from 'nuqs';
import { searchParamsParsers, type SortOrder } from 'lib/search-params';
import { Input } from 'components/ui/input';
import { Button } from 'components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/ui/select';

export function ContentFilters() {
  // 共有パーサーを使用
  const [filters, setFilters] = useQueryStates(searchParamsParsers, {
    throttleMs: 300,
  });

  const handleSearch = (query: string) => {
    setFilters({
      q: query || null,
      page: 1, // 検索時にページをリセット
    });
  };

  const handleReset = () => {
    setFilters({
      q: null,
      page: 1,
      sort: 'desc',
      type: null,
      tags: [],
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex gap-4">
        <Input
          type="text"
          value={filters.q ?? ''}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="キーワードで検索..."
          className="flex-1"
        />
        <Button variant="outline" onClick={handleReset}>
          リセット
        </Button>
      </div>

      <div className="flex gap-4">
        <Select
          value={filters.sort}
          onValueChange={(value) =>
            setFilters({ sort: value as SortOrder, page: 1 })
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="並び順" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">昇順</SelectItem>
            <SelectItem value="desc">降順</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
```

## createSerializer による URL 生成

`createSerializer` を使用して、型安全に URL を生成できます。

```tsx
// src/components/ContentCard.tsx
'use client';

import Link from 'next/link';
import { serialize } from 'lib/search-params';

interface ContentCardProps {
  content: Content;
}

export function ContentCard({ content }: ContentCardProps) {
  // 型安全な URL 生成
  const detailUrl = serialize('/contents', {
    type: content.type,
    page: 1,
  });

  // 相対パスでの URL 生成（現在のパラメータに追加）
  const filterByTypeUrl = serialize({
    type: content.type,
    page: 1,
  });

  return (
    <div className="p-4 border rounded-lg">
      <h3>{content.title}</h3>
      <Link href={detailUrl}>詳細を見る</Link>
      <Link href={`/contents${filterByTypeUrl}`}>
        同じタイプで絞り込み
      </Link>
    </div>
  );
}
```

### Server Component での URL 生成

```tsx
// src/app/contents/page.tsx
import Link from 'next/link';
import { searchParamsCache, serialize } from 'lib/search-params';

export default async function ContentsPage({ searchParams }: PageProps) {
  const { page } = await searchParamsCache.parse(searchParams);

  // ページネーション URL の生成
  const prevPageUrl = serialize('/contents', { page: page - 1 });
  const nextPageUrl = serialize('/contents', { page: page + 1 });

  return (
    <div>
      <ContentList />
      <div className="flex gap-4">
        {page > 1 && <Link href={prevPageUrl}>前へ</Link>}
        <Link href={nextPageUrl}>次へ</Link>
      </div>
    </div>
  );
}
```

## 実践パターン

### ページネーション

```tsx
// src/components/Pagination.tsx
'use client';

import Link from 'next/link';
import { useQueryStates } from 'nuqs';
import { searchParamsParsers, serialize } from 'lib/search-params';

interface PaginationProps {
  totalPages: number;
}

export function Pagination({ totalPages }: PaginationProps) {
  const [{ page }] = useQueryStates(searchParamsParsers);

  return (
    <div className="flex gap-2">
      {page > 1 && (
        <Link href={serialize({ page: page - 1 })}>前へ</Link>
      )}
      <span>
        {page} / {totalPages}
      </span>
      {page < totalPages && (
        <Link href={serialize({ page: page + 1 })}>次へ</Link>
      )}
    </div>
  );
}
```

### タグフィルター

```tsx
// src/components/TagFilter.tsx
'use client';

import { useQueryStates } from 'nuqs';
import { searchParamsParsers } from 'lib/search-params';

export function TagFilter() {
  const [{ tags }, setFilters] = useQueryStates(searchParamsParsers);

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setFilters({ tags: [...tags, tag], page: 1 });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFilters({
      tags: tags.filter((tag) => tag !== tagToRemove),
      page: 1,
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-blue-100 rounded flex items-center gap-1"
          >
            {tag}
            <button onClick={() => removeTag(tag)}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}
```

## テスト

### NuqsTestingAdapter の使用

```tsx
// tests/components/ContentFilters.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { describe, it, expect, vi } from 'vitest';
import { ContentFilters } from 'components/ContentFilters';

describe('ContentFilters', () => {
  it('検索クエリを入力できる', async () => {
    const user = userEvent.setup();
    const onUrlChange = vi.fn();

    render(
      <NuqsTestingAdapter onUrlUpdate={onUrlChange}>
        <ContentFilters />
      </NuqsTestingAdapter>
    );

    const input = screen.getByPlaceholderText('キーワードで検索...');
    await user.type(input, 'テスト');

    expect(onUrlChange).toHaveBeenCalled();
  });

  it('初期値が反映される', () => {
    render(
      <NuqsTestingAdapter searchParams={{ q: '初期検索値', page: '2' }}>
        <ContentFilters />
      </NuqsTestingAdapter>
    );

    const input = screen.getByPlaceholderText('キーワードで検索...');
    expect(input).toHaveValue('初期検索値');
  });
});
```

### Storybook での使用

```tsx
// src/components/ContentFilters.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { ContentFilters } from './ContentFilters';

const meta: Meta<typeof ContentFilters> = {
  title: 'Components/ContentFilters',
  component: ContentFilters,
  decorators: [
    (Story) => (
      <NuqsTestingAdapter>
        <Story />
      </NuqsTestingAdapter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ContentFilters>;

export const Default: Story = {};

export const WithInitialFilters: Story = {
  decorators: [
    (Story) => (
      <NuqsTestingAdapter
        searchParams={{
          q: '検索キーワード',
          sort: 'asc',
          tags: 'tag1,tag2',
        }}
      >
        <Story />
      </NuqsTestingAdapter>
    ),
  ],
};
```

## ベストプラクティス

### 1. パーサー定義のファイル配置

パーサー定義は `src/lib/search-params/` ディレクトリに分割して配置します。

```
src/
└── lib/
    └── search-params/
        ├── index.ts              # 共通のエクスポート
        ├── common.ts             # 共通パーサー（page, limit, sort など）
        ├── contents.ts           # コンテンツ関連のパーサー
        ├── events.ts             # イベント関連のパーサー
        └── users.ts              # ユーザー関連のパーサー
```

#### ファイル分割の実装例

```tsx
// src/lib/search-params/common.ts
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs/server';

// 共通で使うパーサー
export type SortOrder = 'asc' | 'desc';

export const commonParsers = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  sort: parseAsStringEnum<SortOrder>(['asc', 'desc']).withDefault('desc'),
  q: parseAsString,
};
```

```tsx
// src/lib/search-params/contents.ts
import {
  createSearchParamsCache,
  createSerializer,
  parseAsStringEnum,
  parseAsArrayOf,
  parseAsString,
} from 'nuqs/server';
import { commonParsers } from './common';

export type ContentType = 'image' | 'video' | '3d';

export const contentsParsers = {
  ...commonParsers,
  type: parseAsStringEnum<ContentType>(['image', 'video', '3d']),
  tags: parseAsArrayOf(parseAsString, ',').withDefault([]),
};

export const contentsSearchParamsCache = createSearchParamsCache(contentsParsers);
export const contentsSerialize = createSerializer(contentsParsers);
```

```tsx
// src/lib/search-params/events.ts
import {
  createSearchParamsCache,
  createSerializer,
  parseAsIsoDateTime,
  parseAsStringEnum,
} from 'nuqs/server';
import { commonParsers } from './common';

export type EventStatus = 'upcoming' | 'ongoing' | 'ended';

export const eventsParsers = {
  ...commonParsers,
  status: parseAsStringEnum<EventStatus>(['upcoming', 'ongoing', 'ended']),
  from: parseAsIsoDateTime,
  to: parseAsIsoDateTime,
};

export const eventsSearchParamsCache = createSearchParamsCache(eventsParsers);
export const eventsSerialize = createSerializer(eventsParsers);
```

```tsx
// src/lib/search-params/index.ts
// 共通パーサー
export * from './common';

// 機能別パーサー
export * from './contents';
export * from './events';
```

#### 使用例

```tsx
// コンテンツ一覧ページ
import { contentsSearchParamsCache, contentsSerialize } from 'lib/search-params';

// イベント一覧ページ
import { eventsSearchParamsCache, eventsSerialize } from 'lib/search-params';
```

### 2. デフォルト値を適切に設定する

```tsx
// ✅ 良い例: デフォルト値を設定
page: parseAsInteger.withDefault(1),
sort: parseAsStringEnum(['asc', 'desc']).withDefault('desc'),

// ❌ 悪い例: null チェックが必要になる
page: parseAsInteger,
```

### 3. 検索時にページをリセットする

```tsx
// ✅ 良い例
const handleSearch = (query: string) => {
  setFilters({
    q: query || null,
    page: 1, // 検索時にページをリセット
  });
};
```

### 4. throttleMs で更新頻度を制限する

```tsx
// ✅ 良い例: 入力中の URL 更新を抑制
const [filters, setFilters] = useQueryStates(searchParamsParsers, {
  throttleMs: 300,
});
```

## 注意事項

- Server Component では `searchParamsCache.parse()` を使用
- Client Component では `useQueryStates()` を使用
- URL 生成には `serialize()` を使用して型安全性を確保
- 頻繁に更新される値には `throttleMs` を設定
