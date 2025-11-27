'use client'

import { Avatar, AvatarFallback, AvatarImage } from 'components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'components/ui/dialog'
import type { FC } from 'react'

export interface CharacterSelectDialogProps {
  /** ダイアログの開閉状態 */
  open: boolean
  /** ダイアログの開閉状態変更ハンドラー */
  onOpenChange: (open: boolean) => void
  /** 選択可能なキャラクター名のリスト */
  characterNames: string[]
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
 */
export const CharacterSelectDialog: FC<CharacterSelectDialogProps> = ({
  open,
  onOpenChange,
  characterNames,
  selectedName,
  onSelect,
  slotLabel,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{slotLabel}を選択</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-3 gap-3 p-2">
        {characterNames.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              onSelect(name)
              onOpenChange(false)
            }}
            aria-label={`${name}を選択`}
            className={`flex flex-col items-center rounded-lg border-2 p-3 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
              selectedName === name
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <Avatar className="h-14 w-14">
              <AvatarImage src="/placeholder-character.png" alt={name} />
              <AvatarFallback className="text-xl">{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="mt-2 text-center text-sm font-medium">{name}</span>
          </button>
        ))}
      </div>
    </DialogContent>
  </Dialog>
)
