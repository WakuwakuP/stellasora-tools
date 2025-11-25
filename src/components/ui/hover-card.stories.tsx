import {type Meta, type StoryObj} from "@storybook/react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "./hover-card";
import {Button} from "./button";
import {Avatar, AvatarFallback, AvatarImage} from "./avatar";
import {CalendarDays} from "lucide-react";

const meta: Meta<typeof HoverCard> = {
  title: "UI/Hover Card",
  component: HoverCard,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nextjs</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/vercel.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@nextjs</h4>
            <p className="text-sm">
              The React Framework - created and maintained by @vercel.
            </p>
            <div className="flex items-center pt-2">
              <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Joined December 2021
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <div className="space-y-4">
      <p>
        プロジェクトは{" "}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="p-0 h-auto font-normal">
              @田中太郎
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="flex justify-between space-x-4">
              <Avatar>
                <AvatarFallback>田</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">田中太郎</h4>
                <p className="text-sm">
                  フロントエンドエンジニア。React と TypeScript を専門としています。
                </p>
                <div className="flex items-center pt-2">
                  <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    2023年4月入社
                  </span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        {" "}によって管理されています。
      </p>
    </div>
  ),
};

export const ProductInfo: Story = {
  render: () => (
    <div className="space-y-4">
      <p>
        人気の{" "}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="p-0 h-auto font-normal underline">
              MacBook Pro
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">MacBook Pro 14インチ</h4>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <p>• Apple M3 Pro チップ</p>
                <p>• 18GB ユニファイドメモリ</p>
                <p>• 512GB SSDストレージ</p>
                <p>• Liquid Retina XDRディスプレイ</p>
              </div>
              <div className="pt-2">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  ¥348,800
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  税込価格
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        {" "}が新登場しました。
      </p>
    </div>
  ),
};

export const SimpleInfo: Story = {
  render: () => (
    <div className="p-4">
      <p>
        詳細については、{" "}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="p-0 h-auto font-normal">
              こちらのリンク
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">詳細情報</h4>
              <p className="text-sm">
                このリンクをクリックすると、詳細なドキュメントページに移動します。
                より詳しい説明と使用例をご覧いただけます。
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
        {" "}をご確認ください。
      </p>
    </div>
  ),
};

export const MultipleCards: Story = {
  render: () => (
    <div className="space-y-4">
      <p>
        チームメンバー:{" "}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="p-0 h-auto font-normal">
              @佐藤
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="flex space-x-4">
              <Avatar>
                <AvatarFallback>佐</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">佐藤花子</h4>
                <p className="text-sm">バックエンドエンジニア</p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        、{" "}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="p-0 h-auto font-normal">
              @鈴木
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="flex space-x-4">
              <Avatar>
                <AvatarFallback>鈴</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">鈴木次郎</h4>
                <p className="text-sm">デザイナー</p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </p>
    </div>
  ),
};