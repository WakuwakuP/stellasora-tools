import {type Meta, type StoryObj} from "@storybook/react";
import {useState} from "react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "./collapsible";
import {Button} from "./button";
import {ChevronDown, ChevronRight} from "lucide-react";

const meta: Meta<typeof Collapsible> = {
  title: "UI/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full max-w-md space-y-2">
        <div className="flex items-center justify-between space-x-4">
          <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          @radix-ui/primitives
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            @radix-ui/colors
          </div>
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            @stitches/react
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const FAQ: Story = {
  render: () => {
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (value: string) => {
      setOpenItems(prev => 
        prev.includes(value) 
          ? prev.filter(item => item !== value)
          : [...prev, value]
      );
    };

    return (
      <div className="w-full max-w-2xl space-y-4">
        <h2 className="text-xl font-bold mb-6">よくある質問</h2>
        
        <Collapsible 
          open={openItems.includes("question1")} 
          onOpenChange={() => toggleItem("question1")}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
            <span className="font-medium">サービスの利用料金はいくらですか？</span>
            {openItems.includes("question1") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 py-3 text-slate-600 dark:text-slate-400">
              <p>
                基本プランは月額1,000円からご利用いただけます。
                プランによって利用できる機能が異なりますので、詳細は料金ページをご確認ください。
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible 
          open={openItems.includes("question2")} 
          onOpenChange={() => toggleItem("question2")}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
            <span className="font-medium">無料トライアルはありますか？</span>
            {openItems.includes("question2") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 py-3 text-slate-600 dark:text-slate-400">
              <p>
                はい、14日間の無料トライアルをご利用いただけます。
                クレジットカードの登録は不要で、すべての機能をお試しいただけます。
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible 
          open={openItems.includes("question3")} 
          onOpenChange={() => toggleItem("question3")}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
            <span className="font-medium">サポート体制について教えてください</span>
            {openItems.includes("question3") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 py-3 text-slate-600 dark:text-slate-400">
              <p>
                平日9:00-18:00にメールサポートを提供しております。
                有料プランの場合は、チャットサポートもご利用いただけます。
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  },
};

export const Sidebar: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div className="flex h-64 w-full max-w-md border rounded-lg overflow-hidden">
        <div className="bg-slate-100 dark:bg-slate-900 border-r">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="p-4">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-2">
                  {isOpen ? (
                    <ChevronDown className="mr-2 h-4 w-4" />
                  ) : (
                    <ChevronRight className="mr-2 h-4 w-4" />
                  )}
                  ファイル
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-1 mt-2">
                <div className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer py-1">
                  index.js
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer py-1">
                  style.css
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer py-1">
                  README.md
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
        <div className="flex-1 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            メインコンテンツエリア
          </p>
        </div>
      </div>
    );
  },
};

export const Settings: Story = {
  render: () => {
    const [openSections, setOpenSections] = useState<string[]>(["general"]);

    const toggleSection = (section: string) => {
      setOpenSections(prev => 
        prev.includes(section) 
          ? prev.filter(s => s !== section)
          : [...prev, section]
      );
    };

    return (
      <div className="w-full max-w-md space-y-2">
        <h3 className="text-lg font-semibold mb-4">設定</h3>
        
        <Collapsible 
          open={openSections.includes("general")} 
          onOpenChange={() => toggleSection("general")}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-2 text-sm font-medium">
            一般設定
            {openSections.includes("general") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-2 mt-2">
            <div className="text-sm text-slate-600 dark:text-slate-400">言語設定</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">タイムゾーン</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">テーマ</div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible 
          open={openSections.includes("notifications")} 
          onOpenChange={() => toggleSection("notifications")}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-2 text-sm font-medium">
            通知設定
            {openSections.includes("notifications") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-2 mt-2">
            <div className="text-sm text-slate-600 dark:text-slate-400">メール通知</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">プッシュ通知</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">SMS通知</div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible 
          open={openSections.includes("privacy")} 
          onOpenChange={() => toggleSection("privacy")}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-2 text-sm font-medium">
            プライバシー設定
            {openSections.includes("privacy") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-2 mt-2">
            <div className="text-sm text-slate-600 dark:text-slate-400">プロフィール公開</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">アクティビティ表示</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">データの共有</div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  },
};