import {type Meta, type StoryObj} from "@storybook/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
  TableFooter,
} from "./table";

const meta: Meta<typeof Table> = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Table>;

const sampleData = [
  {
    id: "1",
    name: "田中太郎",
    email: "tanaka@example.com",
    role: "管理者",
    status: "アクティブ",
  },
  {
    id: "2", 
    name: "佐藤花子",
    email: "sato@example.com",
    role: "ユーザー",
    status: "アクティブ",
  },
  {
    id: "3",
    name: "鈴木次郎",
    email: "suzuki@example.com", 
    role: "ユーザー",
    status: "非アクティブ",
  },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>名前</TableHead>
          <TableHead>メール</TableHead>
          <TableHead>役割</TableHead>
          <TableHead>ステータス</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>ユーザー一覧表</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>名前</TableHead>
          <TableHead>メール</TableHead>
          <TableHead>役割</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>商品名</TableHead>
          <TableHead>数量</TableHead>
          <TableHead>単価</TableHead>
          <TableHead>合計</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>商品A</TableCell>
          <TableCell>2</TableCell>
          <TableCell>¥1,000</TableCell>
          <TableCell>¥2,000</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>商品B</TableCell>
          <TableCell>1</TableCell>
          <TableCell>¥3,000</TableCell>
          <TableCell>¥3,000</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>合計</TableCell>
          <TableCell>¥5,000</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Empty: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>名前</TableHead>
          <TableHead>メール</TableHead>
          <TableHead>ステータス</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8 text-slate-500">
            データが見つかりません
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};