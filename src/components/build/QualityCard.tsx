'use client'

import { Badge } from 'components/ui/badge'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from 'components/ui/hover-card'
import Image from 'next/image'
import type { FC } from 'react'
import type { QualityInfo } from 'types/quality'

/** 素質画像のアスペクト比 (width / height = 432 / 606) */
const QUALITY_IMAGE_ASPECT_RATIO = 432 / 606

export interface QualityCardProps {
  /** 素質情報 */
  quality: QualityInfo
  /** 素質のインデックス */
  index: number
  /** 選択状態 */
  isSelected: boolean
  /** 素質のレベル（通常素質のみ） */
  level?: number
  /** コア素質かどうか */
  isCore: boolean
  /** クリックハンドラー */
  onClick: () => void
}

/**
 * 素質カードコンポーネント
 *
 * 素質の情報を表示し、クリックで選択/レベルアップ/選択解除を行う。
 * ホバーで素質の詳細説明を表示する。
 */
export const QualityCard: FC<QualityCardProps> = ({
  quality,
  index,
  isSelected,
  level,
  isCore,
  onClick,
}) => (
  <HoverCard openDelay={200} closeDelay={100}>
    <HoverCardTrigger asChild>
      <button
        type="button"
        onClick={onClick}
        aria-label={`${quality.title}${isSelected ? (isCore ? '、選択中' : `、レベル${level}選択中`) : ''}`}
        className={`relative flex min-w-[130px] max-w-[150px] flex-col items-center rounded-lg border-2 p-1 transition-colors ${
          isSelected
            ? isCore
              ? 'border-pink-400 bg-pink-50 shadow-lg dark:bg-pink-950'
              : 'border-amber-400 bg-amber-50 shadow-lg dark:bg-amber-950'
            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'
        }`}
      >
        {/* コア素質は選択時にチェックマーク、通常素質はレベル表示 */}
        {isSelected && (
          <Badge
            className={`absolute top-0 left-0 z-10 rounded-br-lg rounded-tl-lg text-white ${
              isCore ? 'bg-pink-500' : 'bg-blue-600'
            }`}
          >
            {isCore ? '✓' : level}
          </Badge>
        )}
        <div
          className="relative w-full overflow-hidden rounded-md"
          style={{ aspectRatio: QUALITY_IMAGE_ASPECT_RATIO }}
        >
          <Image
            src={quality.fileName}
            alt={quality.title}
            fill
            sizes="150px"
            className="object-cover"
          />
        </div>
        <span className="mt-1 line-clamp-1 w-full text-center text-xs">
          {quality.title}
        </span>
      </button>
    </HoverCardTrigger>
    <HoverCardContent className="w-72" side="top" align="center">
      <div className="space-y-2">
        <h4 className="font-bold text-sm">{quality.title}</h4>
        <p className="text-muted-foreground text-xs whitespace-pre-wrap">
          {quality.description}
        </p>
      </div>
    </HoverCardContent>
  </HoverCard>
)
