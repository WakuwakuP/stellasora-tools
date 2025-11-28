'use client'

import { Avatar, AvatarFallback, AvatarImage } from 'components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'components/ui/dialog'
import { ToggleGroup, ToggleGroupItem } from 'components/ui/toggle-group'
import { type FC, useMemo, useState } from 'react'

/** 属性フィルター定義 */
export const ELEMENT_FILTERS = [
  { value: 'Fire', label: '火', color: 'text-red-500' },
  { value: 'Water', label: '水', color: 'text-blue-500' },
  { value: 'Wind', label: '風', color: 'text-green-500' },
  { value: 'Earth', label: '地', color: 'text-amber-600' },
  { value: 'Light', label: '光', color: 'text-yellow-500' },
  { value: 'Dark', label: '闇', color: 'text-purple-500' },
] as const

/** ロールフィルター定義 */
export const POSITION_FILTERS = [
  { value: 'Attacker', label: 'アタッカー' },
  { value: 'Balancer', label: 'バランサー' },
  { value: 'Supporter', label: 'サポーター' },
] as const

/** キャラクター情報（名前、アイコンURL、属性、ロール） */
export interface CharacterInfo {
  element?: string
  iconUrl?: string
  name: string
  position?: string
}

export interface CharacterSelectDialogProps {
  /** ダイアログの開閉状態 */
  open: boolean
  /** ダイアログの開閉状態変更ハンドラー */
  onOpenChange: (open: boolean) => void
  /** 選択可能なキャラクター情報のリスト */
  characters: CharacterInfo[]
  /** 現在選択中のキャラクター名 */
  selectedName: string | null
  /** キャラクター選択時のハンドラー */
  onSelect: (name: string) => void
  /** スロットのラベル（例: "主力", "支援1"） */
  slotLabel: string
}

/**
 * キャラクター選択ダイアログコンポーネント
 *
 * キャラクターを選択するためのダイアログ。
 * グリッド表示でキャラクターをアバターで表示し、クリックで選択できる。
 * 属性とロールでフィルタリング可能。
 */
export const CharacterSelectDialog: FC<CharacterSelectDialogProps> = ({
  open,
  onOpenChange,
  characters,
  selectedName,
  onSelect,
  slotLabel,
}) => {
  const [elementFilter, setElementFilter] = useState<string[]>([])
  const [positionFilter, setPositionFilter] = useState<string[]>([])

  // フィルタリングされたキャラクターリスト
  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      // 属性フィルター（フィルターが選択されている場合、該当する属性のみを表示）
      if (elementFilter.length > 0) {
        if (!char.element || !elementFilter.includes(char.element)) {
          return false
        }
      }
      // ロールフィルター（フィルターが選択されている場合、該当するロールのみを表示）
      if (positionFilter.length > 0) {
        if (!char.position || !positionFilter.includes(char.position)) {
          return false
        }
      }
      return true
    })
  }, [characters, elementFilter, positionFilter])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!flex h-[80vh] max-w-md !flex-col !gap-0 overflow-hidden">
        <DialogHeader className="shrink-0 pb-4">
          <DialogTitle>{slotLabel}を選択</DialogTitle>
        </DialogHeader>

        {/* フィルターセクション */}
        <div className="shrink-0 space-y-2 border-b pb-3">
          {/* 属性フィルター */}
          <div>
            <div className="mb-1 text-xs font-medium text-slate-500">属性</div>
            <ToggleGroup
              type="multiple"
              value={elementFilter}
              onValueChange={setElementFilter}
              className="flex flex-wrap gap-1"
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

          {/* ロールフィルター */}
          <div>
            <div className="mb-1 text-xs font-medium text-slate-500">ロール</div>
            <ToggleGroup
              type="multiple"
              value={positionFilter}
              onValueChange={setPositionFilter}
              className="flex flex-wrap gap-1"
            >
              {POSITION_FILTERS.map((position) => (
                <ToggleGroupItem
                  key={position.value}
                  value={position.value}
                  aria-label={`${position.label}でフィルター`}
                  className="h-7 px-2 text-xs"
                  variant="outline"
                >
                  {position.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* キャラクターリスト（スクロール可能） */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3 p-2">
            {filteredCharacters.map((char) => (
              <button
                key={char.name}
                type="button"
                onClick={() => {
                  onSelect(char.name)
                  onOpenChange(false)
                }}
                aria-label={`${char.name}を選択`}
                className={`flex flex-col items-center rounded-lg border-2 p-3 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  selectedName === char.name
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <Avatar className="h-14 w-14">
                  <AvatarImage src={char.iconUrl || '/placeholder-character.png'} alt={char.name} />
                  <AvatarFallback className="text-xl">{char.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="mt-2 text-center text-sm font-medium">{char.name}</span>
              </button>
            ))}
            {filteredCharacters.length === 0 && (
              <div className="col-span-3 py-8 text-center text-sm text-slate-500">
                該当するキャラクターがいません
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
