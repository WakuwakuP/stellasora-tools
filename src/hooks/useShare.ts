'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'

export interface ShareOptions {
  title?: string
  text?: string
  url: string
}

/**
 * URL共有機能を提供するカスタムフック
 * - Web Share API（モバイル対応）
 * - クリップボードへのコピー（フォールバック）
 */
export function useShare() {
  const share = useCallback(async (options: ShareOptions) => {
    const { title = 'ビルドを共有', text, url } = options

    // 絶対URLに変換
    const absoluteUrl = url.startsWith('http')
      ? url
      : `${window.location.origin}${url}`

    // Web Share API が使える場合（主にモバイル）
    if (navigator.share) {
      try {
        await navigator.share({
          text,
          title,
          url: absoluteUrl,
        })
        toast.success('共有しました')
        return true
      } catch (error) {
        // ユーザーがキャンセルした場合はエラーを表示しない
        if (error instanceof Error && error.name === 'AbortError') {
          return false
        }
        // その他のエラーの場合はフォールバックへ
        console.warn('Web Share API failed, falling back to clipboard:', error)
      }
    }

    // フォールバック: クリップボードへコピー
    try {
      await navigator.clipboard.writeText(absoluteUrl)
      toast.success('URLをクリップボードにコピーしました')
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('URLのコピーに失敗しました')
      return false
    }
  }, [])

  return { share }
}
