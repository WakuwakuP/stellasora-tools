'use client'

import { Avatar, AvatarFallback, AvatarImage } from 'components/ui/avatar'
import { Badge } from 'components/ui/badge'
import type { FC } from 'react'

export interface CharacterAvatarProps {
  /** キャラクター名 */
  name: string | null
  /** キャラクターアイコンのURL */
  iconUrl?: string
  /** スロットのラベル（例: "主力", "支援1"） */
  label: string
  /** 主力キャラクターかどうか */
  isMain?: boolean
  /** 選択した素質の合計レベル */
  totalLevel?: number
  /** クリックハンドラー */
  onClick?: () => void
}

/**
 * キャラクターアバターコンポーネント
 *
 * キャラクターの選択状態を表示し、クリックで選択ダイアログを開く。
 * 主力キャラクターは赤枠、支援キャラクターはグレー枠で表示。
 */
export const CharacterAvatar: FC<CharacterAvatarProps> = ({
  name,
  iconUrl,
  label,
  isMain = false,
  totalLevel = 0,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`${label}を変更${name ? `（現在: ${name}）` : '（未選択）'}`}
    className={`group relative flex flex-col items-center rounded-lg border-2 p-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
      isMain ? 'border-red-500' : 'border-slate-300'
    }`}
  >
    {isMain && (
      <Badge className="absolute top-0 left-0 z-10 rounded-br-lg rounded-tl-lg bg-red-500 text-white text-xs">
        主力
      </Badge>
    )}
    {!isMain && label && (
      <Badge className="absolute top-0 left-0 z-10 rounded-br-lg rounded-tl-lg bg-slate-500 text-white text-xs">
        支援
      </Badge>
    )}
    <Avatar className="h-16 w-16">
      <AvatarImage src={iconUrl || '/placeholder-character.png'} alt={name || 'キャラクター'} />
      <AvatarFallback className="text-lg">
        {name ? name.charAt(0) : '?'}
      </AvatarFallback>
    </Avatar>
    <span className="mt-1 text-center text-sm font-medium">{name || '未選択'}</span>
    {totalLevel > 0 && (
      <div className="mt-0.5 flex items-center gap-0.5 text-xs text-slate-500">
        <span>⊕</span>
        <span>{totalLevel}</span>
      </div>
    )}
  </button>
)
