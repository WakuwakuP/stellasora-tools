import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'components/ui/card'
import { Hammer, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { type FC } from 'react'

const LandingPage: FC = () => (
  <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
    {/* ヘッダー */}
    <header className="border-slate-200 border-b bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <h1 className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="h-6 w-6 text-amber-500" />
          Stellasora Tools
        </h1>
      </div>
    </header>

    {/* メインコンテンツ */}
    <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h2 className="mb-2 font-bold text-3xl md:text-4xl">
          Stellasoraツール集
        </h2>
        <p className="text-lg text-muted-foreground">
          ゲームプレイを便利にするツールを提供します
        </p>
      </div>

      {/* ツールカード */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* ビルドメーカーカード */}
        <Link className="group" href="/build">
          <Card className="hover:-translate-y-1 h-full cursor-pointer transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                <Hammer className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle>ビルドメーカー</CardTitle>
              <CardDescription>
                巡遊者の素質とロスレコを選択してビルドを作成・共有できます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="font-medium text-primary text-sm group-hover:underline">
                ビルドを作成 →
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>

    {/* フッター */}
    <footer className="border-slate-200 border-t bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="container mx-auto px-4 py-4 text-center text-muted-foreground text-sm">
        © 2024 Stellasora Tools
      </div>
    </footer>
  </div>
)

export default LandingPage
