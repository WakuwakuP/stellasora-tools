# Server Component 実装ガイド

## 基本方針

Server Component を優先して実装し、必要な場合のみ Client Component を使用する。

## Server Component の実装パターン

### 基本的な Server Component

```tsx
// src/app/(site)/home/page.tsx
import { getServerSession } from 'next-auth';
import { HomeEventsList } from 'components/home/HomeEventsList';
import { getEvents } from 'lib/actions/getEvents';
import { authOptions } from 'lib/auth';

export default async function Home() {
  const currentSession = await getServerSession(authOptions);

  // データベースからデータを取得
  let events = [];
  if (currentSession?.user?.id != null) {
    try {
      events = await getEvents();
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <HomeEventsList events={events} />
    </div>
  );
}
```

### データ取得を含む Server Component

Server Component では async/await を使用してサーバー側でデータを取得できる。

```tsx
// src/app/(site)/events/[eventId]/page.tsx
import { getServerSession } from 'next-auth';
import { getEvent } from 'lib/actions/getEvent';
import { authOptions } from 'lib/auth';
import { EventDetail } from 'components/event/EventDetail';

interface Props {
  params: { eventId: string };
}

export default async function EventPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div>認証が必要です</div>;
  }

  let event = null;
  try {
    event = await getEvent(params.eventId);
  } catch (error) {
    console.error('Failed to fetch event:', error);
  }

  if (!event) {
    return <div>イベントが見つかりません</div>;
  }

  return <EventDetail event={event} />;
}
```

## エラーハンドリングのパターン

### 基本的なエラーハンドリング

```tsx
export default async function DataFetchingPage() {
  let data = [];

  try {
    data = await fetchData();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    // エラーが発生してもページは表示し、空のデータで続行
  }

  return (
    <div>
      {data.length > 0 ? <DataList items={data} /> : <p>データがありません</p>}
    </div>
  );
}
```

### 認証エラーのハンドリング

```tsx
export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="py-8 text-center">
        <p>このページを表示するにはログインが必要です</p>
      </div>
    );
  }

  // 認証済みユーザー向けのコンテンツ
  return <AuthenticatedContent userId={session.user.id} />;
}
```

## Server Component の利点

### 1. パフォーマンス

- サーバー側で HTML が生成されるため、初期表示が高速
- JavaScript バンドルサイズが削減される

### 2. SEO

- サーバー側レンダリングにより SEO に有利
- OGP メタデータの動的生成が可能

### 3. セキュリティ

- データベース接続情報などの機密情報がクライアントに送信されない
- API キーなどをサーバー側で安全に使用可能

## 注意事項

### Server Component で使用できないもの

- React Hooks（useState、useEffect など）
- ブラウザ固有の API
- イベントハンドラー（onClick など）

### Client Component が必要な場合の判断基準

- ユーザーインタラクション（クリック、入力など）
- ブラウザの状態管理
- リアルタイム更新
- サードパーティライブラリの使用（ブラウザ依存）

## 条件付きレンダリング

### 認証状態による条件分岐

```tsx
export function ConditionalComponent({ session }: { session: Session | null }) {
  return (
    <div>
      {session?.user ? <UserContent user={session.user} /> : <SignInPrompt />}
    </div>
  );
}
```

### データ存在チェック

```tsx
export function DataDisplayComponent({ data }: { data: Item[] }) {
  return (
    <div>
      {data.length > 0 ? (
        <ItemList items={data} />
      ) : (
        <div className="text-muted-foreground py-8 text-center">
          データがありません
        </div>
      )}
    </div>
  );
}
```
