import {type Meta, type StoryObj} from "@storybook/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import {Button} from "./button";

const meta: Meta<typeof AlertDialog> = {
  title: "UI/Alert Dialog",
  component: AlertDialog,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof AlertDialog>;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">アラートを表示</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>本当によろしいですか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作は元に戻すことができません。データが完全に削除されます。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction>続行</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const Destructive: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">アカウントを削除</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>アカウントの削除</AlertDialogTitle>
          <AlertDialogDescription>
            アカウントを削除すると、すべてのデータが完全に削除され、復元することができなくなります。
            本当にアカウントを削除しますか？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700">
            削除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const LongContent: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">利用規約を確認</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>利用規約への同意</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-2 text-sm">
              <p>
                本サービスを利用するにあたり、以下の利用規約に同意していただく必要があります。
              </p>
              <p>
                利用規約には、サービスの使用条件、禁止事項、プライバシーポリシー、
                免責事項などが含まれています。
              </p>
              <p>
                ご利用前に必ずお読みいただき、内容にご理解・ご同意いただいた上で
                「同意する」ボタンをクリックしてください。
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                同意しない場合は、本サービスをご利用いただくことができません。
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>同意しない</AlertDialogCancel>
          <AlertDialogAction>同意する</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const SimpleConfirmation: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>保存</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>変更を保存しますか？</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction>保存</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};