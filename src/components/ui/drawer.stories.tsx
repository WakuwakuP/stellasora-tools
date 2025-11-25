import {type Meta, type StoryObj} from "@storybook/react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import {Button} from "./button";
import {Input} from "./input";
import {Label} from "./label";

const meta: Meta<typeof Drawer> = {
  title: "UI/Drawer",
  component: Drawer,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">ドロワーを開く</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>ドロワータイトル</DrawerTitle>
          <DrawerDescription>
            これはドロワーの説明文です。重要な情報や詳細をここに表示します。
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p>ドロワーのコンテンツがここに表示されます。</p>
        </div>
        <DrawerFooter>
          <Button>送信</Button>
          <DrawerClose asChild>
            <Button variant="outline">キャンセル</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>プロフィールを編集</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>プロフィール編集</DrawerTitle>
          <DrawerDescription>
            プロフィール情報を更新してください。変更は即座に反映されます。
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">名前</Label>
            <Input id="name" placeholder="名前を入力" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" placeholder="email@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">自己紹介</Label>
            <textarea 
              id="bio" 
              className="w-full p-2 border border-slate-300 rounded-md resize-none"
              rows={3}
              placeholder="自己紹介を入力してください..."
            />
          </div>
        </div>
        <DrawerFooter>
          <Button>保存</Button>
          <DrawerClose asChild>
            <Button variant="outline">キャンセル</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const Simple: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost">メニューを開く</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4">
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              ホーム
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              設定
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              ヘルプ
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              ログアウト
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">詳細を表示</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>詳細情報</DrawerTitle>
          <DrawerDescription>
            以下に詳細な情報を表示します。
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <h3 className="font-semibold mb-2">セクション 1</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">セクション 2</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco 
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">セクション 3</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Duis aute irure dolor in reprehenderit in voluptate velit esse 
              cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">セクション 4</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Excepteur sint occaecat cupidatat non proident, sunt in culpa 
              qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>閉じる</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};