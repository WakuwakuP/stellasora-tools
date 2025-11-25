import {type Meta, type StoryObj} from "@storybook/react";
import {useState} from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";
import {Button} from "./button";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  FileText,
  Home,
  Search,
} from "lucide-react";

const meta: Meta<typeof Command> = {
  title: "UI/Command",
  component: Command,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Command>;

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md max-w-md">
      <CommandInput placeholder="コマンドを入力してください..." />
      <CommandList>
        <CommandEmpty>結果が見つかりません。</CommandEmpty>
        <CommandGroup heading="提案">
          <CommandItem>
            <Calendar className="mr-2 h-4 w-4" />
            <span>カレンダー</span>
          </CommandItem>
          <CommandItem>
            <Smile className="mr-2 h-4 w-4" />
            <span>絵文字を検索</span>
          </CommandItem>
          <CommandItem>
            <Calculator className="mr-2 h-4 w-4" />
            <span>計算機</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="設定">
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>プロフィール</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>請求</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>設定</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const Dialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          <p>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-600 opacity-100 dark:bg-slate-800 dark:text-slate-400">
              <span className="text-xs">⌘</span>J
            </kbd>
            を押すか、ボタンをクリックしてコマンドパレットを開いてください。
          </p>
        </div>
        
        <Button onClick={() => setOpen(true)}>
          コマンドパレットを開く
        </Button>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="コマンドを入力してください..." />
          <CommandList>
            <CommandEmpty>結果が見つかりません。</CommandEmpty>
            <CommandGroup heading="提案">
              <CommandItem onSelect={() => setOpen(false)}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>カレンダー</span>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                <Smile className="mr-2 h-4 w-4" />
                <span>絵文字を検索</span>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                <Calculator className="mr-2 h-4 w-4" />
                <span>計算機</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="設定">
              <CommandItem onSelect={() => setOpen(false)}>
                <User className="mr-2 h-4 w-4" />
                <span>プロフィール</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>請求</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>設定</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </>
    );
  },
};

export const FileSearch: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md max-w-md">
      <CommandInput placeholder="ファイルを検索..." />
      <CommandList>
        <CommandEmpty>ファイルが見つかりません。</CommandEmpty>
        <CommandGroup heading="最近のファイル">
          <CommandItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>README.md</span>
          </CommandItem>
          <CommandItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>package.json</span>
          </CommandItem>
          <CommandItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>tsconfig.json</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="フォルダ">
          <CommandItem>
            <Home className="mr-2 h-4 w-4" />
            <span>src</span>
          </CommandItem>
          <CommandItem>
            <Home className="mr-2 h-4 w-4" />
            <span>components</span>
          </CommandItem>
          <CommandItem>
            <Home className="mr-2 h-4 w-4" />
            <span>pages</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const Actions: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md max-w-md">
      <CommandInput placeholder="アクションを検索..." />
      <CommandList>
        <CommandEmpty>アクションが見つかりません。</CommandEmpty>
        <CommandGroup heading="よく使用するアクション">
          <CommandItem>
            <Search className="mr-2 h-4 w-4" />
            <span>検索</span>
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>新しいファイル</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Home className="mr-2 h-4 w-4" />
            <span>ホームに戻る</span>
            <CommandShortcut>⌘H</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="設定">
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>設定を開く</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>アカウント設定</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};