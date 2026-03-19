'use client'

import { Badge } from '@/components/ui/badge'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { ELEMENT_COLORS, STAR_COLORS } from '@/constants/lossRecordColors'
import { getNoteImagePath } from '@/constants/noteImageMap'
import Image from 'next/image'
import type { FC } from 'react'
import type { LossRecordInfo, SupportNote } from '@/types/lossRecord'

export interface LossRecordCardProps {
  /** ロスレコ情報 */
  lossRecord: LossRecordInfo
  /** 選択状態 */
  isSelected: boolean
  /** クリックハンドラー */
  onClick: () => void
  /** コンパクト表示（サブロスレコ用） */
  compact?: boolean
}

/**
 * サポート音符を表示するコンポーネント
 */
const SupportNoteDisplay: FC<{ notes: SupportNote[] }> = ({ notes }) => {
  if (!notes || notes.length === 0) return null
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {notes.map((note) => {
        const imagePath = getNoteImagePath(note.name)
        return (
          <span
            key={note.name}
            className="inline-flex items-center gap-0.5 text-xs text-slate-600 dark:text-slate-300"
            title={note.name}
          >
            {imagePath ? (
              <Image
                src={imagePath}
                alt={note.name}
                width={16}
                height={16}
                className="h-4 w-4"
              />
            ) : (
              <span>🎵</span>
            )}
            <span>{note.quantity}</span>
          </span>
        )
      })}
    </div>
  )
}

/**
 * ロスレコカードコンポーネント
 *
 * ロスレコの情報を表示し、クリックで選択/解除を行う。
 * ホバーでスキルの詳細説明を表示する。
 */
export const LossRecordCard: FC<LossRecordCardProps> = ({
  lossRecord,
  isSelected,
  onClick,
  compact = false,
}) => {
  const starColor = STAR_COLORS[lossRecord.star] ?? 'text-slate-400'
  const elementColor = ELEMENT_COLORS[lossRecord.element] ?? 'text-slate-400'

  // メインロスレコ用: セカンダリスキルの必要音符
  // サブロスレコ用: サポート音符
  const displayNotes = compact
    ? lossRecord.supportNote
    : lossRecord.secondarySkillNotes

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={`${lossRecord.name}を${isSelected ? '選択解除' : '選択'}する`}
          className={`relative flex w-full flex-col items-center rounded-lg border-2 p-2 transition-colors ${
            isSelected
              ? 'border-amber-400 bg-amber-50 shadow-lg dark:bg-amber-950'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'
          }`}
        >
          {/* 選択状態のバッジ */}
          {isSelected && (
            <Badge className="absolute top-0 left-0 z-10 rounded-br-lg rounded-tl-lg bg-amber-500 text-white">
              ✓
            </Badge>
          )}

          {/* アイコン - サイズを大きく */}
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-slate-100 dark:bg-slate-700">
            <Image
              src={lossRecord.iconUrl}
              alt={lossRecord.name}
              fill
              sizes={compact ? '100px' : '140px'}
              className="object-contain p-1"
            />
          </div>

          {/* 名前 */}
          <span className="mt-1.5 line-clamp-1 w-full text-center text-sm font-medium">
            {lossRecord.name}
          </span>

          {/* 星と属性 */}
          <div className="flex items-center justify-center gap-1">
            <span className={`text-xs ${starColor}`}>
              {'★'.repeat(lossRecord.star)}
            </span>
            {lossRecord.element !== 'なし' && (
              <span className={`text-xs ${elementColor}`}>
                {lossRecord.element}
              </span>
            )}
          </div>

          {/* 音符を表示（メイン: セカンダリスキル音符、サブ: サポート音符） */}
          {displayNotes && displayNotes.length > 0 && (
            <div className="mt-1.5 w-full">
              <SupportNoteDisplay notes={displayNotes} />
            </div>
          )}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top" align="center">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm">{lossRecord.name}</h4>
            <div className="flex items-center gap-1">
              <span className={`text-xs ${starColor}`}>
                {'★'.repeat(lossRecord.star)}
              </span>
              <span className={`text-xs ${elementColor}`}>
                {lossRecord.element}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500">
              {lossRecord.mainSkillName}
            </p>
            <p className="text-muted-foreground whitespace-pre-wrap text-xs">
              {lossRecord.mainSkillDescription}
            </p>
          </div>

          {/* ステータス表示 */}
          {lossRecord.maxStats && lossRecord.maxStats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {lossRecord.maxStats.map((stat) => (
                <span
                  key={stat.id}
                  className="text-xs text-slate-600 dark:text-slate-300"
                >
                  {stat.label}: {stat.value}
                  {stat.unit ?? ''}
                </span>
              ))}
            </div>
          )}

          {/* サポート音符 */}
          <div>
            <p className="text-xs font-medium text-slate-500">サポート音符</p>
            <SupportNoteDisplay notes={lossRecord.supportNote} />
          </div>

          {/* セカンダリスキル必要音符 */}
          {lossRecord.secondarySkillNotes &&
            lossRecord.secondarySkillNotes.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500">
                  サブスキル必要音符
                </p>
                <SupportNoteDisplay notes={lossRecord.secondarySkillNotes} />
              </div>
            )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
