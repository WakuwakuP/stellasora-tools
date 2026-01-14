'use client'

import { Avatar, AvatarFallback, AvatarImage } from 'components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'components/ui/dialog'
import { ToggleGroup, ToggleGroupItem } from 'components/ui/toggle-group'
import { type FC, useEffect, useMemo, useState } from 'react'

/**
 * 多言語対応の属性マッピング（EN, JP, KR, CN, TW）
 * APIは言語設定によって異なる値を返すため、すべての言語の値をサポート
 */
const ELEMENT_VALUE_GROUPS = {
  fire: ['Ignis', '火', '불'],
  water: ['Aqua', '水', '물'],
  wind: ['Ventus', '風', '风', '바람'],
  earth: ['Terra', '地', '땅'],
  light: ['Lux', '光', '빛'],
  dark: ['Umbra', '闇', '暗', '어둠'],
} as const

/**
 * 多言語対応のロールマッピング（EN, JP, KR, CN, TW）
 */
const POSITION_VALUE_GROUPS = {
  attacker: ['Vanguard', 'アタッカー', '딜러', '先锋', '先鋒'],
  balancer: ['Versatile', 'バランサー', '밸런스', '均衡'],
  supporter: ['Support', 'サポーター', '서포터', '辅助', '輔助'],
} as const

/** 属性フィルター定義 */
export const ELEMENT_FILTERS = [
  { color: 'text-red-500', label: '火', value: 'fire' },
  { color: 'text-blue-500', label: '水', value: 'water' },
  { color: 'text-green-500', label: '風', value: 'wind' },
  { color: 'text-amber-600', label: '地', value: 'earth' },
  { color: 'text-yellow-500', label: '光', value: 'light' },
  { color: 'text-purple-500', label: '闇', value: 'dark' },
] as const

/** ロールフィルター定義 */
export const POSITION_FILTERS = [
  { label: 'アタッカー', value: 'attacker' },
  { label: 'バランサー', value: 'balancer' },
  { label: 'サポーター', value: 'supporter' },
] as const

/**
 * キャラクターの属性が指定されたフィルターグループに一致するかチェック
 */
function matchesElementFilter(charElement: string | undefined, filterKey: keyof typeof ELEMENT_VALUE_GROUPS): boolean {
  if (!charElement) return false
  return ELEMENT_VALUE_GROUPS[filterKey].includes(charElement as never)
}

/**
 * キャラクターのロールが指定されたフィルターグループに一致するかチェック
 */
function matchesPositionFilter(charPosition: string | undefined, filterKey: keyof typeof POSITION_VALUE_GROUPS): boolean {
  if (!charPosition) return false
  return POSITION_VALUE_GROUPS[filterKey].includes(charPosition as never)
}

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

  // ダイアログを閉じたときにフィルター状態をリセット
  useEffect(() => {
    if (!open) {
      setElementFilter([])
      setPositionFilter([])
    }
  }, [open])

  // フィルタリングされたキャラクターリスト
  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      // 属性フィルター（フィルターが選択されている場合、該当する属性のみを表示）
      if (elementFilter.length > 0) {
        const matchesAnyElement = elementFilter.some((filterKey) =>
          matchesElementFilter(char.element, filterKey as keyof typeof ELEMENT_VALUE_GROUPS)
        )
        if (!matchesAnyElement) {
          return false
        }
      }
      // ロールフィルター（フィルターが選択されている場合、該当するロールのみを表示）
      if (positionFilter.length > 0) {
        const matchesAnyPosition = positionFilter.some((filterKey) =>
          matchesPositionFilter(char.position, filterKey as keyof typeof POSITION_VALUE_GROUPS)
        )
        if (!matchesAnyPosition) {
          return false
        }
      }
      return true
    })
  }, [characters, elementFilter, positionFilter])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden sm:max-w-4xl landscape:max-h-[85vh]">
        <DialogHeader className="shrink-0 pb-4">
          <DialogTitle>{slotLabel}を選択</DialogTitle>
        </DialogHeader>

        {/* フィルターセクション（モバイルは縦並び、PCは横並び） */}
        <div className="shrink-0 border-b pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            {/* 属性フィルター */}
            <div className="sm:flex-1">
              <div className="mb-1 text-xs font-medium text-slate-500">属性</div>
              <ToggleGroup
                type="multiple"
                value={elementFilter}
                onValueChange={setElementFilter}
                className="flex gap-0"
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
            <div className="sm:flex-1">
              <div className="mb-1 text-xs font-medium text-slate-500">ロール</div>
              <ToggleGroup
                type="multiple"
                value={positionFilter}
                onValueChange={setPositionFilter}
                className="flex gap-0"
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
        </div>

        {/* キャラクターリスト（スクロール可能） */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div
            className="grid gap-3 p-2"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            }}
          >
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
              <div className="col-span-full py-8 text-center text-sm text-slate-500">
                該当するキャラクターがいません
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
