# Client Component 実装ガイド

## 基本方針

Client Component は必要最小限の場合のみ使用し、可能な限り Server Component を優先する。

## Client Component が必要な場合

### 1. インタラクティブな機能

- クリック、フォーム操作、ドラッグ&ドロップ
- ユーザー入力に応じた UI の変更
- リアルタイムな状態更新

### 2. React Hooks の使用

- useState、useEffect、useContext など
- カスタムフックの活用

### 3. ブラウザ固有の API

- localStorage、sessionStorage
- geolocation、navigator API
- DOM 操作

## Client Component の実装パターン

### 基本的な Client Component

```tsx
'use client';

import { useState } from 'react';
import { Button } from 'components/ui/button';

export function InteractiveComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-4">
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>カウントアップ</Button>
    </div>
  );
}
```

### フォーム処理を含む Client Component

```tsx
'use client';

import { useState } from 'react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';

interface FormData {
  name: string;
  email: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // フォーム送信処理
      await submitForm(formData);
      // 成功時の処理
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">名前</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '送信中...' : '送信'}
      </Button>
    </form>
  );
}
```

## State Management パターン

### useEffect を使った副作用の処理

```tsx
'use client';

import { useEffect, useState } from 'react';

export function DataSubscriber() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // データの購読開始
    const subscription = subscribeToData((newData) => {
      setData(newData);
      setIsLoading(false);
    });

    // クリーンアップ関数
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      {data ? <DataDisplay data={data} /> : <div>データがありません</div>}
    </div>
  );
}
```

### useEffectEvent を使った副作用の処理

- エフェクト内で使用する関数を依存配列から除外できる
- 最新の props/state を参照しながら、エフェクトの再実行を防ぐ
- イベントハンドラー的な処理をエフェクト内で安全に使用できる

```tsx
'use client';

import { useEffect, useEffectEvent, useState } from 'react';

interface Message {
  id: string;
  text: string;
  timestamp: number;
}

export function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);

  // イベントハンドラーとして定義（依存配列に含める必要がない）
  const onMessage = useEffectEvent((message: Message) => {
    setMessages((prev) => [...prev, message]);
    // メッセージ受信時のカスタムロジック
    console.log('New message received:', message.text);
  });

  useEffect(() => {
    // チャットルームに接続
    const connection = connectToChatRoom(roomId, {
      onMessage, // useEffectEventで定義した関数は依存配列に不要
    });

    return () => {
      connection.disconnect();
    };
  }, [roomId]); // onMessageは依存配列に含めない

  return (
    <div className="space-y-4">
      <h2>Room: {roomId}</h2>
      <div className="space-y-2">
        {messages.map((message) => (
          <div key={message.id} className="p-2 bg-gray-100 rounded">
            {message.text}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### useContext を使った状態共有

```tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <AppContext.Provider value={{ theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// 使用例
export function ThemeToggle() {
  const { theme, setTheme } = useAppContext();

  return (
    <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? 'ダーク' : 'ライト'}モードに切り替え
    </Button>
  );
}
```

## Server Component と Client Component の組み合わせ

### Server Component から Client Component にデータを渡す

```tsx
// Server Component
export default async function ParentPage() {
  const data = await fetchDataFromServer();

  return (
    <div>
      <h1>ページタイトル</h1>
      <InteractiveSection data={data} />
    </div>
  );
}

// Client Component
('use client');

import { useState } from 'react';

export function InteractiveSection({ data }: { data: any[] }) {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div>
      {data.map((item) => (
        <button
          key={item.id}
          onClick={() => setSelectedItem(item)}
          className={selectedItem?.id === item.id ? 'bg-blue-100' : ''}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
```

## パフォーマンス最適化

### 適切なコンポーネント分割

```tsx
// ❌ 全体を Client Component にしない
'use client';

export function LargePage() {
  const [interactiveState, setInteractiveState] = useState(false);

  return (
    <div>
      <StaticHeader />
      <StaticContent />
      <InteractiveButton
        onClick={() => setInteractiveState(!interactiveState)}
      />
      <StaticFooter />
    </div>
  );
}

// ✅ インタラクティブな部分のみを Client Component に
export function OptimizedPage() {
  return (
    <div>
      <StaticHeader />
      <StaticContent />
      <InteractiveSection />
      <StaticFooter />
    </div>
  );
}

('use client');

function InteractiveSection() {
  const [interactiveState, setInteractiveState] = useState(false);

  return (
    <InteractiveButton onClick={() => setInteractiveState(!interactiveState)} />
  );
}
```

### Activity による表示の出し分け

使いどころ

- 一時的に非表示にしてもStateを復元したい場合
- 非表示コンポーネントのDOMの保持したい場合 (フォームの入力値など)
- 表示される可能性が高いコンテンツのプリレンダー

注意点

- `<video />` や `<audio />` などを使う場合、 `display: none;` で非表示にされるだけのため再生が停止されない
  - `useLayoutEffect()` や `useEffect()` を使いクリーンアップ処理を書いて再生を停止する必要がある
- 非表示のコンポーネントはStateを復元できるだけでUnmountされているものとして扱う必要がある
  - 非表示状態の時は Effect はクリーンアップされる

```tsx
'use client';

export function Page ({isShow: boolean}) {
  return (
    <Activity mode={isShow ? "visible" : "hidden"}>
      <Modal />
    </Activity>
  )
}
```

## 注意事項

### Client Component でのデータ取得

```tsx
'use client';

import { useEffect, useState } from 'react';

// ❌ クライアントサイドでの初期データ取得は避ける
export function ClientDataFetching() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData().then(setData); // 初期レンダリング後の追加取得
  }, []);

  return <div>{/* レンダリング */}</div>;
}

// ✅ Server Component でデータを取得してpropsで渡す
export default async function ServerDataFetching() {
  const data = await fetchData(); // サーバーサイドで取得

  return <ClientComponent data={data} />;
}
```

### TypeScript の型定義

Client Component でも適切な型定義を行う：

```tsx
'use client';

interface ClientComponentProps {
  initialData: Item[];
  onUpdate: (data: Item[]) => void;
}

export function ClientComponent({
  initialData,
  onUpdate,
}: ClientComponentProps) {
  const [data, setData] = useState<Item[]>(initialData);

  const handleUpdate = (newData: Item[]) => {
    setData(newData);
    onUpdate(newData);
  };

  return <div>{/* コンポーネントの内容 */}</div>;
}
```
