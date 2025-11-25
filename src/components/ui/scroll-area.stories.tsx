import {type Meta, type StoryObj} from "@storybook/react";
import {ScrollArea, ScrollBar} from "./scroll-area";
import {Separator} from "./separator";

const meta: Meta<typeof ScrollArea> = {
  title: "UI/Scroll Area",
  component: ScrollArea,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border p-4">
      <div className="space-y-3">
        {Array.from({length: 50}, (_, i) => (
          <div key={i} className="text-sm">
            アイテム {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const WithSeparators: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">タグ</h4>
        {Array.from({length: 50}, (_, i) => (
          <div key={i}>
            <div className="text-sm py-2">v1.2.0-beta.{i + 1}</div>
            {i < 49 && <Separator />}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const TextContent: Story = {
  render: () => (
    <ScrollArea className="h-96 w-80 rounded-md border p-4">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">長い文章の例</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          これは非常に長いテキストコンテンツの例です。スクロールエリアコンポーネントを使用することで、
          限られた高さの中で多くのコンテンツを表示することができます。
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          このコンポーネントは、チャットアプリケーション、ログビューア、
          長いリスト表示などの場面で活用できます。スクロールバーのデザインは
          システム標準のものではなく、カスタマイズされた美しいデザインになっています。
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          レスポンシブデザインにも対応しており、モバイルデバイスでもスムーズに
          スクロールできます。タッチ操作にも最適化されています。
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          さらに、アクセシビリティにも配慮されており、キーボード操作での
          スクロールや、スクリーンリーダーでの利用も可能です。
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          このようにして、長いコンテンツを効率的に表示できます。
          ユーザーは必要な情報を素早く見つけることができ、
          インターフェースはすっきりと整理された状態を保てます。
        </p>
        {Array.from({length: 10}, (_, i) => (
          <p key={i} className="text-sm text-slate-600 dark:text-slate-400">
            追加の段落 {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({length: 20}, (_, i) => (
          <div
            key={i}
            className="shrink-0 rounded-md bg-slate-100 dark:bg-slate-800 w-32 h-20 flex items-center justify-center text-sm"
          >
            カード {i + 1}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

export const Both: Story = {
  render: () => (
    <ScrollArea className="h-72 w-80 rounded-md border">
      <div className="p-4">
        <div style={{ width: 600 }} className="space-y-4">
          <h3 className="text-lg font-semibold">
            縦と横の両方向にスクロール可能なコンテンツ
          </h3>
          {Array.from({length: 30}, (_, i) => (
            <div key={i} className="text-sm whitespace-nowrap">
              これは横に非常に長いテキストです。スクロールして右側のコンテンツを確認してください。行番号: {i + 1}
            </div>
          ))}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

export const Chat: Story = {
  render: () => (
    <div className="w-80">
      <div className="flex h-96 flex-col rounded-lg border">
        <div className="flex-1 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex">
                  <div className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 max-w-[70%]">
                    <p className="text-sm">こんにちは！</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="rounded-lg bg-blue-500 text-white px-3 py-2 max-w-[70%]">
                    <p className="text-sm">こんにちは！元気ですか？</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 max-w-[70%]">
                    <p className="text-sm">はい、元気です！今日は良い天気ですね。</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="rounded-lg bg-blue-500 text-white px-3 py-2 max-w-[70%]">
                    <p className="text-sm">本当ですね！散歩日和です。</p>
                  </div>
                </div>
                {Array.from({length: 10}, (_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? '' : 'justify-end'}`}>
                    <div className={`rounded-lg px-3 py-2 max-w-[70%] ${
                      i % 2 === 0 
                        ? 'bg-slate-100 dark:bg-slate-800' 
                        : 'bg-blue-500 text-white'
                    }`}>
                      <p className="text-sm">メッセージ {i + 5}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  ),
};