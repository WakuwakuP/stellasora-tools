'use client'

import { expandShareCode } from 'lib/url-compression'
import { useEffect } from 'react'

interface BuildShareRedirectProps {
  code: string
}

/**
 * 短縮URLからビルドページにリダイレクトするクライアントコンポーネント
 */
export function BuildShareRedirect({ code }: BuildShareRedirectProps) {
  useEffect(() => {
    try {
      const buildUrl = expandShareCode(code)
      // Next.jsの厳密なルーティング型を回避するため、window.locationを使用
      window.location.replace(buildUrl)
    } catch {
      // 無効なコードの場合はビルドページトップにリダイレクト
      window.location.replace('/build')
    }
  }, [code])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-2xl">🔄</div>
        <p className="text-slate-600 dark:text-slate-400">
          ビルドを読み込み中...
        </p>
      </div>
    </div>
  )
}
