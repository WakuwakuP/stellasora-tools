'use client'

import { getNoteImagePath } from 'constants/noteImageMap'
import { Plus, X } from 'lucide-react'
import Image from 'next/image'
import type { FC } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from 'components/ui/avatar'
import type { LossRecordInfo, SupportNote } from 'types/lossRecord'

export interface LossRecordSlotsProps {
  /** ロスレコIDの配列 */
  lossRecordIds: number[]
  /** IDからロスレコを取得する関数 */
  getLossRecordById: (id: number) => LossRecordInfo | undefined
  /** スロットクリック時のハンドラー（ダイアログを開く） */
  onSlotClick: () => void
  /** 削除ボタンクリック時のハンドラー */
  onDeselect: (id: number) => void
  /** コンパクト表示（モバイル用） */
  compact?: boolean
  /** サブスキル必要音符を表示するか（メインロスレコ用） */
  showSecondaryNotes?: boolean
}

/**
 * サブスキル必要音符を表示するコンポーネント
 */
const SecondaryNotesDisplay: FC<{ notes: SupportNote[]; compact?: boolean }> = ({
  notes,
  compact = false,
}) => {
  if (!notes || notes.length === 0) return null
  const iconSize = compact ? 12 : 16
  const iconClass = compact ? 'h-3 w-3' : 'h-4 w-4'

  return (
    <div className="flex flex-wrap justify-center gap-0.5">
      {notes.map((note) => {
        const imagePath = getNoteImagePath(note.name)
        return (
          <span
            key={note.name}
            className={`inline-flex items-center gap-0.5 ${compact ? 'text-[10px]' : 'text-xs'} text-slate-600 dark:text-slate-300`}
            title={note.name}
          >
            {imagePath ? (
              <Image
                src={imagePath}
                alt={note.name}
                width={iconSize}
                height={iconSize}
                className={iconClass}
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
 * ロスレコスロットコンポーネント
 *
 * メイン/サブロスレコの選択スロットを表示する再利用可能なコンポーネント。
 * モバイル/デスクトップ両対応。
 */
export const LossRecordSlots: FC<LossRecordSlotsProps> = ({
  lossRecordIds,
  getLossRecordById,
  onSlotClick,
  onDeselect,
  compact = false,
  showSecondaryNotes = false,
}) => {
  const iconSize = compact ? 'h-4 w-4' : 'h-6 w-6'
  const deleteButtonSize = compact ? 'h-4 w-4' : 'h-5 w-5'
  const deleteIconSize = 'h-3 w-3'

  return (
    <div className={`grid grid-cols-3 ${compact ? 'gap-1' : 'gap-2'}`}>
      {[0, 1, 2].map((slotIndex) => {
        const lrId = lossRecordIds[slotIndex]
        const lr = lrId ? getLossRecordById(lrId) : undefined
        return (
          <div key={slotIndex} className="flex flex-col">
            <div
              role="button"
              tabIndex={0}
              onClick={onSlotClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSlotClick()
                }
              }}
              className="relative aspect-square cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-slate-100 transition-colors hover:border-slate-400 dark:border-slate-600 dark:bg-slate-700"
            >
              {lr ? (
                <>
                  <Avatar className="h-full w-full rounded-lg">
                    <AvatarImage src={lr.iconUrl} alt={lr.name} />
                    <AvatarFallback className="rounded-lg text-xs">
                      {lr.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeselect(lr.id)
                    }}
                    className={`absolute -top-1 -right-1 flex ${deleteButtonSize} items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600`}
                    aria-label={`${lr.name}を削除`}
                  >
                    <X className={deleteIconSize} />
                  </button>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <Plus className={iconSize} />
                </div>
              )}
            </div>
            {/* メインロスレコ用: サブスキル必要音符を表示 */}
            {showSecondaryNotes &&
              lr &&
              lr.secondarySkillNotes &&
              lr.secondarySkillNotes.length > 0 && (
                <div className={compact ? 'mt-0.5' : 'mt-1'}>
                  <SecondaryNotesDisplay notes={lr.secondarySkillNotes} compact={compact} />
                </div>
              )}
          </div>
        )
      })}
    </div>
  )
}
