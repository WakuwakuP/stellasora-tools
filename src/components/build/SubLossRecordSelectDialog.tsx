'use client'

import { NOTE_IMAGE_MAP } from 'constants/noteImageMap'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'components/ui/dialog'
import { ToggleGroup, ToggleGroupItem } from 'components/ui/toggle-group'
import Image from 'next/image'
import { type FC, useEffect, useMemo, useState } from 'react'
import type { LossRecordInfo } from 'types/lossRecord'
import { LossRecordCard } from './LossRecordCard'
import { STAR_FILTERS } from './LossRecordSelectDialog'

/** 音符フィルター定義 */
export const NOTE_FILTERS = [
  { imagePath: NOTE_IMAGE_MAP['強撃の音符'], label: '強撃', value: '強撃' },
  { imagePath: NOTE_IMAGE_MAP['爆発の音符'], label: '爆発', value: '爆発' },
  { imagePath: NOTE_IMAGE_MAP['器用の音符'], label: '器用', value: '器用' },
  { imagePath: NOTE_IMAGE_MAP['幸運の音符'], label: '幸運', value: '幸運' },
  { imagePath: NOTE_IMAGE_MAP['火の音符'], label: '火', value: '火' },
  { imagePath: NOTE_IMAGE_MAP['水の音符'], label: '水', value: '水' },
  { imagePath: NOTE_IMAGE_MAP['風の音符'], label: '風', value: '風' },
  { imagePath: NOTE_IMAGE_MAP['地の音符'], label: '地', value: '地' },
  { imagePath: NOTE_IMAGE_MAP['光の音符'], label: '光', value: '光' },
  { imagePath: NOTE_IMAGE_MAP['闇の音符'], label: '闇', value: '闇' },
] as const

export interface SubLossRecordSelectDialogProps {
  /** ダイアログの開閉状態 */
  open: boolean
  /** ダイアログの開閉状態変更ハンドラー */
  onOpenChange: (open: boolean) => void
  /** 選択可能なロスレコ情報のリスト */
  lossRecords: LossRecordInfo[]
  /** 現在選択中のロスレコID（サブは最大3個） */
  selectedIds: number[]
  /** ロスレコ選択時のハンドラー */
  onSelect: (id: number) => void
  /** 選択解除時のハンドラー */
  onDeselect: (id: number) => void
  /** ダイアログタイトル */
  title: string
  /** 最大選択数 */
  maxSelection?: number
}

/**
 * ロスレコが指定された音符タイプを必要とするかチェック
 */
function hasNoteType(lossRecord: LossRecordInfo, noteType: string): boolean {
  return lossRecord.supportNote.some((note) => note.name.includes(noteType))
}

/**
 * サブロスレコ選択ダイアログコンポーネント
 *
 * ロスレコを選択するためのダイアログ。
 * グリッド表示でロスレコを表示し、クリックで選択できる。
 * 音符タイプと星でフィルタリング可能。
 */
export const SubLossRecordSelectDialog: FC<SubLossRecordSelectDialogProps> = ({
  open,
  onOpenChange,
  lossRecords,
  selectedIds,
  onSelect,
  onDeselect,
  title,
  maxSelection = 3,
}) => {
  const [noteFilter, setNoteFilter] = useState<string[]>([])
  const [starFilter, setStarFilter] = useState<string[]>([])

  // ダイアログを閉じたときにフィルター状態をリセット
  useEffect(() => {
    if (!open) {
      setNoteFilter([])
      setStarFilter([])
    }
  }, [open])

  // フィルタリングされたロスレコリスト
  const filteredLossRecords = useMemo(() => {
    return lossRecords.filter((lr) => {
      // 音符フィルター（いずれかの音符タイプを含む）
      if (noteFilter.length > 0) {
        const hasAnyNote = noteFilter.some((nf) => hasNoteType(lr, nf))
        if (!hasAnyNote) {
          return false
        }
      }
      // 星フィルター
      if (
        starFilter.length > 0 &&
        !starFilter.includes(String(lr.star))
      ) {
        return false
      }
      return true
    })
  }, [lossRecords, noteFilter, starFilter])

  const handleClick = (id: number) => {
    if (selectedIds.includes(id)) {
      onDeselect(id)
    } else {
      if (selectedIds.length < maxSelection) {
        onSelect(id)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-w-2xl flex-col gap-0 overflow-hidden">
        <DialogHeader className="shrink-0 pb-4">
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-slate-500">
            選択中: {selectedIds.length} / {maxSelection}
          </p>
        </DialogHeader>

        {/* フィルターセクション */}
        <div className="shrink-0 border-b pb-3">
          <div className="flex flex-col gap-2">
            {/* 音符フィルター */}
            <div>
              <div className="mb-1 text-xs font-medium text-slate-500">音符</div>
              <ToggleGroup
                type="multiple"
                value={noteFilter}
                onValueChange={setNoteFilter}
                className="flex flex-wrap gap-0"
              >
                {NOTE_FILTERS.map((note) => (
                  <ToggleGroupItem
                    key={note.value}
                    value={note.value}
                    aria-label={`${note.label}音符でフィルター`}
                    className="h-7 px-2 text-xs"
                    variant="outline"
                  >
                    {note.imagePath && (
                      <Image
                        src={note.imagePath}
                        alt={note.label}
                        width={16}
                        height={16}
                        className="mr-0.5 h-4 w-4"
                      />
                    )}
                    <span>{note.label}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* 星フィルター */}
            <div>
              <div className="mb-1 text-xs font-medium text-slate-500">レアリティ</div>
              <ToggleGroup
                type="multiple"
                value={starFilter}
                onValueChange={setStarFilter}
                className="flex gap-0"
              >
                {STAR_FILTERS.map((star) => (
                  <ToggleGroupItem
                    key={star.value}
                    value={star.value}
                    aria-label={`${star.label}でフィルター`}
                    className="h-7 px-2 text-xs"
                    variant="outline"
                  >
                    {star.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
        </div>

        {/* ロスレコリスト（スクロール可能） */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 p-2 sm:grid-cols-3 md:grid-cols-4">
            {filteredLossRecords.map((lr) => (
              <LossRecordCard
                key={lr.id}
                lossRecord={lr}
                isSelected={selectedIds.includes(lr.id)}
                onClick={() => handleClick(lr.id)}
                compact
              />
            ))}
            {filteredLossRecords.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm text-slate-500">
                該当するロスレコがありません
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
