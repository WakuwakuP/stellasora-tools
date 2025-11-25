import {type Meta, type StoryObj} from "@storybook/react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./context-menu";

const meta: Meta<typeof ContextMenu> = {
  title: "UI/Context Menu",
  component: ContextMenu,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        右クリックしてコンテキストメニューを表示
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>
          戻る
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled>
          進む
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          再読み込み
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>
          ブックマークバーを表示
          <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>フルスクリーン表示</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          ページのソースを表示
          <ContextMenuShortcut>⌘U</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          検証
          <ContextMenuShortcut>F12</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithSubmenu: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        右クリックしてサブメニュー付きコンテキストメニューを表示
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>開く</ContextMenuItem>
        <ContextMenuItem>名前を変更</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>共有</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>メール</ContextMenuItem>
            <ContextMenuItem>メッセージ</ContextMenuItem>
            <ContextMenuItem>リンクをコピー</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>その他...</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem>削除</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithRadioGroup: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        右クリックしてラジオグループ付きコンテキストメニューを表示
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuLabel>表示設定</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value="list">
          <ContextMenuRadioItem value="grid">
            グリッド表示
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="list">
            リスト表示
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="icon">
            アイコン表示
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuItem>設定...</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const FileManager: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm bg-slate-50 dark:bg-slate-900">
        📁 ドキュメント
        <br />
        <span className="text-xs text-slate-500">右クリックしてファイル操作メニューを表示</span>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>開く</ContextMenuItem>
        <ContextMenuItem>新しいウィンドウで開く</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>切り取り</ContextMenuItem>
        <ContextMenuItem>コピー</ContextMenuItem>
        <ContextMenuItem>貼り付け</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>名前を変更</ContextMenuItem>
        <ContextMenuItem className="text-red-600 dark:text-red-400">削除</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>プロパティ</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const TextEditor: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border text-sm p-4">
        これはテキストエディタの例です。右クリックして編集メニューを表示してください。
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>元に戻す</ContextMenuItem>
        <ContextMenuItem>やり直す</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>切り取り</ContextMenuItem>
        <ContextMenuItem>コピー</ContextMenuItem>
        <ContextMenuItem>貼り付け</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>すべて選択</ContextMenuItem>
        <ContextMenuItem>検索と置換</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>
          行番号を表示
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>
          ワードラップ
        </ContextMenuCheckboxItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};