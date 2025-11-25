import {type Meta, type StoryObj} from "@storybook/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const meta: Meta<typeof Accordion> = {
  title: "UI/Accordion",
  component: Accordion,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>よくある質問 1</AccordionTrigger>
        <AccordionContent>
          これは最初のよくある質問への回答です。詳細な情報を提供し、ユーザーの疑問を解決します。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>よくある質問 2</AccordionTrigger>
        <AccordionContent>
          2番目の質問への回答です。複数の段落にわたる詳細な説明も可能です。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>よくある質問 3</AccordionTrigger>
        <AccordionContent>
          3番目の質問への回答です。アコーディオンは折りたたみ可能なコンテンツを表示するのに便利です。
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>設定について</AccordionTrigger>
        <AccordionContent>
          アプリケーションの設定に関する情報です。複数の項目を同時に開くことができます。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>アカウント管理</AccordionTrigger>
        <AccordionContent>
          アカウントの管理方法について説明します。プロフィール更新やパスワード変更などが含まれます。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>トラブルシューティング</AccordionTrigger>
        <AccordionContent>
          一般的な問題の解決方法を説明します。エラーが発生した場合の対処法などをご紹介します。
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>デフォルトで開いている項目</AccordionTrigger>
        <AccordionContent>
          この項目はデフォルトで開いています。初期状態で重要な情報を表示したい場合に便利です。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>閉じている項目</AccordionTrigger>
        <AccordionContent>
          この項目は初期状態では閉じています。クリックすることで内容を表示できます。
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const SingleLine: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>短い質問</AccordionTrigger>
        <AccordionContent>短い回答です。</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>詳細な説明が必要な質問</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <p>
              これは非常に長いコンテンツの例です。複数の段落を含み、詳細な情報を提供します。
            </p>
            <p>
              アコーディオンコンポーネントは、大量のコンテンツを整理して表示するのに適しています。
              ユーザーは必要な情報だけを選択して表示できます。
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>項目1</li>
              <li>項目2</li>
              <li>項目3</li>
            </ul>
            <p>
              このように、リストや他の要素も含めることができます。
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};