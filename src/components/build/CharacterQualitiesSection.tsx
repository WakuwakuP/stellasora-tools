'use client'

import { Avatar, AvatarFallback, AvatarImage } from 'components/ui/avatar'
import type { FC } from 'react'
import type { QualityInfo } from 'types/quality'
import { QualityCard } from './QualityCard'

/** 素質グループの定義 */
export const QUALITY_GROUPS = [
  { name: '特化素質1', start: 0, end: 5 },
  { name: '特化素質2', start: 5, end: 10 },
  { name: '汎用素質', start: 10, end: 16 },
] as const

/** コア素質のインデックス（レベルなし、最大2個選択可能） */
export const CORE_TALENT_INDICES = [0, 1, 5, 6]

/** 素質がコア素質かどうかを判定 */
export const isCoreTalent = (index: number): boolean =>
  CORE_TALENT_INDICES.includes(index)

export interface SelectedTalent {
  characterName: string
  role: 'main' | 'sub'
  index: number
  level: number
}

export interface CharacterQualitiesSectionProps {
  /** キャラクター名 */
  characterName: string
  /** 素質データの配列 */
  qualities: QualityInfo[]
  /** キャラクターの役割 */
  role: 'main' | 'sub'
  /** 選択された素質のリスト */
  selectedTalents: SelectedTalent[]
  /** 素質選択時のハンドラー */
  onTalentSelect: (characterName: string, role: 'main' | 'sub', index: number) => void
  /** 選択した素質の合計レベル */
  totalLevel: number
}

/**
 * キャラクター素質セクションコンポーネント
 *
 * キャラクターごとの素質をグループ分けして表示する。
 * 各素質はクリックで選択/レベルアップ/選択解除できる。
 */
export const CharacterQualitiesSection: FC<CharacterQualitiesSectionProps> = ({
  characterName,
  qualities,
  role,
  selectedTalents,
  onTalentSelect,
  totalLevel,
}) => (
  <div className="mb-6">
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/placeholder-character.png" alt={characterName} />
          <AvatarFallback>{characterName.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="font-bold text-lg">{characterName}</span>
      </div>
      <div className="flex items-center gap-1 text-slate-500">
        <span className="text-xl">⊕</span>
        <span className="font-bold text-lg">{totalLevel}</span>
      </div>
    </div>
    <div className="space-y-3">
      {QUALITY_GROUPS.map((group) => (
        <div key={group.name}>
          <div className="mb-1 text-xs text-slate-500 font-medium">{group.name}</div>
          <div className="flex flex-wrap justify-start gap-2">
            {qualities.slice(group.start, group.end).map((quality, idx) => {
              const index = group.start + idx
              const selectedTalent = selectedTalents.find(
                (t) =>
                  t.characterName === characterName &&
                  t.role === role &&
                  t.index === index,
              )
              const isCore = isCoreTalent(index)
              return (
                <QualityCard
                  key={`${characterName}-${role}-${index}`}
                  quality={quality}
                  index={index}
                  isSelected={selectedTalent !== undefined}
                  level={selectedTalent?.level}
                  isCore={isCore}
                  onClick={() => onTalentSelect(characterName, role, index)}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
)
