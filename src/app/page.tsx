import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'components/ui/card'
import { getCopyrightYear } from 'lib/date-utils'
import { Hammer, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { type FC } from 'react'

const LandingPage: FC = () => (
  <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
    {/* ヘッダー */}
    <header className="border-slate-200 border-b bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="container mx-auto flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4">
        <h1 className="flex items-center gap-2 font-bold text-lg sm:text-xl">
          <Sparkles className="h-5 w-5 text-amber-500 sm:h-6 sm:w-6" />
          Stellasora Tools
        </h1>
      </div>
    </header>

    {/* メインコンテンツ */}
    <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-3 py-8 sm:px-4 sm:py-12">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="mb-2 font-bold text-2xl sm:text-3xl md:text-4xl">
          Stellasoraツール集
        </h2>
        <p className="text-base text-muted-foreground sm:text-lg">
          ゲームプレイを便利にするツールを提供します
        </p>
      </div>

      {/* ツールカード */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {/* ビルドメーカーカード */}
        <Link aria-label="ビルドメーカー" className="group" href="/build">
          <Card className="h-full cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg">
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
      <div className="container mx-auto px-3 py-3 text-center text-muted-foreground text-xs sm:px-4 sm:py-4 sm:text-sm">
        © {getCopyrightYear()}{' '}
        <a
          className="hover:underline"
          href="https://www.miyulab.dev"
          rel="noopener noreferrer"
          target="_blank"
        >
          miyulab.dev
        </a>
      </div>
    </footer>
  </div>
)

export default LandingPage
