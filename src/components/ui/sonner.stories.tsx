import {type Meta, type StoryObj} from "@storybook/react";
import {toast} from "sonner";
import {Toaster} from "./sonner";
import {Button} from "./button";

const meta: Meta<typeof Toaster> = {
  title: "UI/Sonner (Toast)",
  component: Toaster,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <div>
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => toast("トーストメッセージです")}>
          基本のトースト
        </Button>
        <Button onClick={() => toast.success("成功しました！")}>
          成功トースト
        </Button>
        <Button onClick={() => toast.error("エラーが発生しました")}>
          エラートースト
        </Button>
        <Button onClick={() => toast.warning("警告メッセージです")}>
          警告トースト
        </Button>
        <Button onClick={() => toast.info("情報をお知らせします")}>
          情報トースト
        </Button>
      </div>
      <Toaster />
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div>
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={() => 
            toast("メールを送信しました", {
              description: "確認メールをご確認ください",
            })
          }
        >
          説明付きトースト
        </Button>
        <Button 
          onClick={() => 
            toast.success("プロフィールを更新しました", {
              description: "変更内容が保存されました",
            })
          }
        >
          成功 + 説明
        </Button>
        <Button 
          onClick={() => 
            toast.error("ネットワークエラー", {
              description: "接続を確認してから再試行してください",
            })
          }
        >
          エラー + 説明
        </Button>
      </div>
      <Toaster />
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <div>
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={() => 
            toast("新しい通知があります", {
              action: {
                label: "確認",
                onClick: () => toast("確認しました"),
              },
            })
          }
        >
          アクション付きトースト
        </Button>
        <Button 
          onClick={() => 
            toast("ファイルを削除しますか？", {
              description: "この操作は元に戻せません",
              action: {
                label: "削除",
                onClick: () => toast.success("ファイルを削除しました"),
              },
              cancel: {
                label: "キャンセル",
                onClick: () => toast("キャンセルしました"),
              },
            })
          }
        >
          確認ダイアログ風
        </Button>
      </div>
      <Toaster />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div>
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={() => {
            const toastId = toast.loading("データを保存中...");
            setTimeout(() => {
              toast.success("保存完了！", { id: toastId });
            }, 2000);
          }}
        >
          ローディングトースト
        </Button>
        <Button 
          onClick={() => {
            const toastId = toast.loading("ファイルをアップロード中...");
            setTimeout(() => {
              toast.error("アップロードに失敗しました", { id: toastId });
            }, 2000);
          }}
        >
          ローディング → エラー
        </Button>
      </div>
      <Toaster />
    </div>
  ),
};

export const PromiseToasts: Story = {
  render: () => (
    <div>
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={() => {
            const promise = new Promise<string>((resolve, _reject) => 
              setTimeout(() => resolve("データの取得が完了しました"), 2000)
            );

            toast.promise(promise, {
              loading: "データを取得中...",
              success: (data) => data,
              error: "データの取得に失敗しました",
            });
          }}
        >
          Promise成功
        </Button>
        <Button 
          onClick={() => {
            const promise = new Promise<string>((_, reject) => 
              setTimeout(() => reject("サーバーエラー"), 2000)
            );

            toast.promise(promise, {
              loading: "データを保存中...",
              success: "保存が完了しました",
              error: "保存に失敗しました",
            });
          }}
        >
          Promise失敗
        </Button>
      </div>
      <Toaster />
    </div>
  ),
};

export const Positioning: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => toast("トップセンター")}>
          デフォルト (トップセンター)
        </Button>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400">
        位置は Toaster コンポーネントの position prop で変更できます:
        <br />
        "top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"
      </div>
      <Toaster />
    </div>
  ),
};

export const Styling: Story = {
  render: () => (
    <div>
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={() => 
            toast("カスタムスタイルのトースト", {
              style: {
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
              },
            })
          }
        >
          カスタムスタイル
        </Button>
        <Button 
          onClick={() => 
            toast.success("カスタムクラスのトースト", {
              className: "border-green-500 bg-green-50 text-green-800",
            })
          }
        >
          カスタムクラス
        </Button>
        <Button 
          onClick={() => 
            toast("長時間表示されるトースト", {
              duration: 10000,
            })
          }
        >
          長時間表示 (10秒)
        </Button>
      </div>
      <Toaster />
    </div>
  ),
};