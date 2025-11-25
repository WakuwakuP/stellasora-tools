# shadcn/ui コンポーネント活用ガイド

## 基本方針

UI の実装では shadcn/ui コンポーネントを積極的に活用し、カスタム実装を最小限に抑える。

## 基本的なコンポーネント

### Button コンポーネント

```tsx
import { Button } from 'components/ui/button';

export function ButtonExamples() {
  return (
    <div className="space-x-4">
      <Button>デフォルト</Button>
      <Button variant="destructive">削除</Button>
      <Button variant="outline">アウトライン</Button>
      <Button variant="secondary">セカンダリ</Button>
      <Button variant="ghost">ゴースト</Button>
      <Button variant="link">リンク</Button>
    </div>
  );
}
```

### Input コンポーネント

```tsx
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';

export function InputExamples() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">名前</Label>
        <Input id="name" placeholder="名前を入力してください" />
      </div>
      <div>
        <Label htmlFor="email">メールアドレス</Label>
        <Input id="email" type="email" placeholder="email@example.com" />
      </div>
      <div>
        <Label htmlFor="password">パスワード</Label>
        <Input id="password" type="password" />
      </div>
    </div>
  );
}
```

## レイアウトコンポーネント

### Card コンポーネント

```tsx
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';

export function CardExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>カードタイトル</CardTitle>
      </CardHeader>
      <CardContent>
        <p>カードの内容がここに表示されます。</p>
      </CardContent>
    </Card>
  );
}
```

### Dialog コンポーネント

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from 'components/ui/dialog';
import { Button } from 'components/ui/button';

export function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>ダイアログを開く</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>確認</DialogTitle>
        </DialogHeader>
        <p>本当にこの操作を実行しますか？</p>
        <DialogFooter>
          <Button variant="outline">キャンセル</Button>
          <Button>実行</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## フォームコンポーネント

### Select コンポーネント

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/ui/select';

export function SelectExample() {
  return (
    <Select>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="選択してください" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">オプション 1</SelectItem>
        <SelectItem value="option2">オプション 2</SelectItem>
        <SelectItem value="option3">オプション 3</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

### Checkbox & Radio

```tsx
import { Checkbox } from 'components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from 'components/ui/radio-group';
import { Label } from 'components/ui/label';

export function FormControlsExample() {
  return (
    <div className="space-y-6">
      {/* Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms">利用規約に同意する</Label>
      </div>

      {/* Radio Group */}
      <RadioGroup defaultValue="option1">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="r1" />
          <Label htmlFor="r1">オプション 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="r2" />
          <Label htmlFor="r2">オプション 2</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
```

## ナビゲーションコンポーネント

### Tabs コンポーネント

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs';

export function TabsExample() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">タブ 1</TabsTrigger>
        <TabsTrigger value="tab2">タブ 2</TabsTrigger>
        <TabsTrigger value="tab3">タブ 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>タブ 1 の内容</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>タブ 2 の内容</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>タブ 3 の内容</p>
      </TabsContent>
    </Tabs>
  );
}
```

## 表示コンポーネント

### Avatar コンポーネント

```tsx
import { Avatar, AvatarImage, AvatarFallback } from 'components/ui/avatar';

export function UserAvatar({
  user,
}: {
  user: { name: string; image?: string };
}) {
  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={user.image} alt={user.name} />
      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
```

### Badge コンポーネント

```tsx
import { Badge } from 'components/ui/badge';

export function BadgeExamples() {
  return (
    <div className="space-x-2">
      <Badge>デフォルト</Badge>
      <Badge variant="secondary">セカンダリ</Badge>
      <Badge variant="destructive">削除</Badge>
      <Badge variant="outline">アウトライン</Badge>
    </div>
  );
}
```

## データ表示コンポーネント

### Table コンポーネント

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'components/ui/table';

interface User {
  id: string;
  name: string;
  email: string;
}

export function DataTable({ users }: { users: User[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名前</TableHead>
          <TableHead>メールアドレス</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## フィードバックコンポーネント

### Alert コンポーネント

```tsx
import { Alert, AlertDescription, AlertTitle } from 'components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function AlertExamples() {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>情報</AlertTitle>
        <AlertDescription>これは情報メッセージです。</AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription>エラーが発生しました。</AlertDescription>
      </Alert>
    </div>
  );
}
```

### Progress コンポーネント

```tsx
import { Progress } from 'components/ui/progress';

export function ProgressExample() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-600">進行状況: 60%</p>
        <Progress value={60} className="w-full" />
      </div>
    </div>
  );
}
```

## 複合コンポーネントの例

### 完全なフォーム例

```tsx
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/ui/select';
import { Checkbox } from 'components/ui/checkbox';

export function ComprehensiveForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ユーザー登録フォーム</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">姓</Label>
            <Input id="firstName" placeholder="田中" />
          </div>
          <div>
            <Label htmlFor="lastName">名</Label>
            <Input id="lastName" placeholder="太郎" />
          </div>
        </div>

        <div>
          <Label htmlFor="email">メールアドレス</Label>
          <Input id="email" type="email" placeholder="email@example.com" />
        </div>

        <div>
          <Label htmlFor="category">カテゴリ</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">個人</SelectItem>
              <SelectItem value="business">法人</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="newsletter" />
          <Label htmlFor="newsletter">ニュースレターを受信する</Label>
        </div>

        <Button type="submit" className="w-full">
          登録する
        </Button>
      </CardContent>
    </Card>
  );
}
```

## カスタマイズのガイドライン

### クラス名の追加

```tsx
import { Button } from 'components/ui/button';

export function CustomizedButton() {
  return (
    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
      カスタムボタン
    </Button>
  );
}
```

### サイズとバリアントの組み合わせ

```tsx
import { Button } from 'components/ui/button';

export function VariantExamples() {
  return (
    <div className="space-y-2 space-x-2">
      <Button size="sm" variant="outline">
        小さなボタン
      </Button>
      <Button size="lg" variant="destructive">
        大きな削除ボタン
      </Button>
      <Button size="icon" variant="ghost">
        <IconComponent />
      </Button>
    </div>
  );
}
```

## 新しいコンポーネントの追加

新しい shadcn/ui コンポーネントが必要な場合：

```bash
yarn dlx shadcn@latest add [component-name]
```

例：

```bash
yarn dlx shadcn@latest add button
yarn dlx shadcn@latest add card
yarn dlx shadcn@latest add dialog
```
