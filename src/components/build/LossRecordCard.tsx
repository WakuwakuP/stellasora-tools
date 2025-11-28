'use client'

import { Badge } from 'components/ui/badge'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from 'components/ui/hover-card'
import Image from 'next/image'
import type { FC } from 'react'
import type { LossRecordInfo, SupportNote } from 'types/lossRecord'

/** 星の色 */
const STAR_COLORS: Record<number, string> = {
  3: 'text-blue-400',
  4: 'text-purple-400',
  5: 'text-amber-400',
}

/** 属性の色 */
const ELEMENT_COLORS: Record<string, string> = {
  火: 'text-red-500',
  水: 'text-blue-500',
  風: 'text-green-500',
  地: 'text-amber-600',
  光: 'text-yellow-500',
  闇: 'text-purple-500',
  なし: 'text-slate-400',
}

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
 * 音符アイコンを取得する
 */
function getNoteIcon(noteName: string): string {
  if (noteName.includes('火')) return '🔥'
  if (noteName.includes('水')) return '💧'
  if (noteName.includes('風')) return '🌀'
  if (noteName.includes('地')) return '🌍'
  if (noteName.includes('光')) return '✨'
  if (noteName.includes('闇')) return '🌑'
  if (noteName.includes('強撃')) return '⚔️'
  if (noteName.includes('爆発')) return '💥'
  if (noteName.includes('器用')) return '🎯'
  if (noteName.includes('幸運')) return '🍀'
  return '🎵'
}

/**
 * サポート音符を表示するコンポーネント
 */
const SupportNoteDisplay: FC<{ notes: SupportNote[] }> = ({ notes }) => {
  if (!notes || notes.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {notes.map((note) => (
        <span
          key={note.name}
          className="inline-flex items-center gap-0.5 text-xs text-slate-600 dark:text-slate-300"
          title={note.name}
        >
          <span>{getNoteIcon(note.name)}</span>
          <span>{note.quantity}</span>
        </span>
      ))}
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

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={`${lossRecord.name}${isSelected ? '、選択中' : ''}`}
          className={`relative flex w-full flex-col items-center rounded-lg border-2 p-1 transition-colors ${
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

          {/* アイコン */}
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-slate-100 dark:bg-slate-700">
            <Image
              src={lossRecord.iconUrl}
              alt={lossRecord.name}
              fill
              sizes={compact ? '80px' : '120px'}
              className="object-contain p-1"
            />
          </div>

          {/* 名前 */}
          <span className="mt-1 line-clamp-1 w-full text-center text-xs font-medium">
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

          {/* コンパクトモードでない場合、音符を表示 */}
          {!compact && (
            <div className="mt-1">
              <SupportNoteDisplay notes={lossRecord.supportNote} />
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

          {/* 音符要件 */}
          <div>
            <p className="text-xs font-medium text-slate-500">必要音符</p>
            <SupportNoteDisplay notes={lossRecord.supportNote} />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
