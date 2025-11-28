'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'components/ui/dialog'
import { ToggleGroup, ToggleGroupItem } from 'components/ui/toggle-group'
import { type FC, useEffect, useMemo, useState } from 'react'
import type { LossRecordInfo } from 'types/lossRecord'
import { sortLossRecords } from 'utils/lossRecordSort'
import { LossRecordCard } from './LossRecordCard'

/** 属性フィルター定義 */
export const ELEMENT_FILTERS = [
  { color: 'text-red-500', label: '火', value: '火' },
  { color: 'text-blue-500', label: '水', value: '水' },
  { color: 'text-green-500', label: '風', value: '風' },
  { color: 'text-amber-600', label: '地', value: '地' },
  { color: 'text-yellow-500', label: '光', value: '光' },
  { color: 'text-purple-500', label: '闇', value: '闇' },
  { color: 'text-slate-400', label: 'なし', value: 'なし' },
] as const

/** 星フィルター定義 */
export const STAR_FILTERS = [
  { label: '★3', value: '3' },
  { label: '★4', value: '4' },
  { label: '★5', value: '5' },
] as const

export interface LossRecordSelectDialogProps {
  /** ダイアログの開閉状態 */
  open: boolean
  /** ダイアログの開閉状態変更ハンドラー */
  onOpenChange: (open: boolean) => void
  /** 選択可能なロスレコ情報のリスト */
  lossRecords: LossRecordInfo[]
  /** 現在選択中のロスレコID（メインは最大3個） */
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
 * メインロスレコ選択ダイアログコンポーネント
 *
 * ロスレコを選択するためのダイアログ。
 * グリッド表示でロスレコを表示し、クリックで選択できる。
 * 属性と星でフィルタリング可能。
 */
export const LossRecordSelectDialog: FC<LossRecordSelectDialogProps> = ({
  open,
  onOpenChange,
  lossRecords,
  selectedIds,
  onSelect,
  onDeselect,
  title,
  maxSelection = 3,
}) => {
  const [elementFilter, setElementFilter] = useState<string[]>([])
  const [starFilter, setStarFilter] = useState<string[]>([])

  // ダイアログを閉じたときにフィルター状態をリセット
  useEffect(() => {
    if (!open) {
      setElementFilter([])
      setStarFilter([])
    }
  }, [open])

  // フィルタリング・ソートされたロスレコリスト
  const filteredLossRecords = useMemo(() => {
    const filtered = lossRecords.filter((lr) => {
      // 属性フィルター
      if (
        elementFilter.length > 0 &&
        !elementFilter.includes(lr.element)
      ) {
        return false
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
    // ソート: レアリティ（降順）、属性、名前
    return sortLossRecords(filtered)
  }, [lossRecords, elementFilter, starFilter])

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
      <DialogContent className="flex h-[80vh] max-w-7xl flex-col gap-0 overflow-hidden sm:max-w-7xl">
        <DialogHeader className="shrink-0 pb-4">
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-slate-500">
            選択中: {selectedIds.length} / {maxSelection}
          </p>
        </DialogHeader>

        {/* フィルターセクション */}
        <div className="shrink-0 border-b pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            {/* 属性フィルター */}
            <div className="sm:flex-1">
              <div className="mb-1 text-xs font-medium text-slate-500">属性</div>
              <ToggleGroup
                type="multiple"
                value={elementFilter}
                onValueChange={setElementFilter}
                className="flex flex-wrap gap-0"
              >
                {ELEMENT_FILTERS.map((element) => (
                  <ToggleGroupItem
                    key={element.value}
                    value={element.value}
                    aria-label={`${element.label}属性でフィルター`}
                    className="h-7 px-2 text-xs"
                    variant="outline"
                  >
                    <span className={element.color}>{element.label}</span>
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
          <div
            className="grid gap-3 p-2"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            }}
          >
            {filteredLossRecords.map((lr) => (
              <LossRecordCard
                key={lr.id}
                lossRecord={lr}
                isSelected={selectedIds.includes(lr.id)}
                onClick={() => handleClick(lr.id)}
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
