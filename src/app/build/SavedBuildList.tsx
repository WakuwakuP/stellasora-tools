'use client'

import { Button } from 'components/ui/button'
import { ScrollArea } from 'components/ui/scroll-area'
import { X } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import type { SavedBuild } from 'hooks/useSavedBuilds'

interface SavedBuildListProps {
  builds: SavedBuild[]
  onRemove: (id: string) => void
  currentUrl: string
}

/**
 * ビルドURLが有効な形式かどうかを検証
 * @param url - 検証するURL
 * @returns 有効なビルドURL形式の場合はtrue
 */
function isValidBuildUrl(url: string): url is `/build?${string}` {
  // 新形式: /build?c1=...&c2=...&c3=...&t=...
  if (url.startsWith('/build?')) {
    const params = new URLSearchParams(url.slice('/build?'.length))
    return !!(params.get('c1') && params.get('c2') && params.get('c3') && params.get('t'))
  }
  return false
}

export const SavedBuildList: FC<SavedBuildListProps> = ({
  builds,
  onRemove,
  currentUrl,
}) => {
  if (builds.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-600">
        保存されたビルドはありません
      </div>
    )
  }

  return (
    <ScrollArea className="max-h-60">
      <div className="space-y-2">
        {builds.map((build) => {
          const isActive = currentUrl === build.url
          return (
            <div
              key={build.id}
              className={`group flex items-center gap-2 rounded-lg border-2 p-2 transition-colors ${
                isActive
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
              }`}
            >
              {isValidBuildUrl(build.url) ? (
                <Link
                  href={build.url}
                  className="flex-1 truncate text-sm font-medium hover:underline"
                  title={build.name}
                >
                  {build.name}
                </Link>
              ) : (
                <span
                  className="flex-1 truncate text-sm font-medium text-slate-400"
                  title={`無効なURL: ${build.url}`}
                >
                  {build.name}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault()
                  onRemove(build.id)
                }}
                aria-label={`${build.name}を削除`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
