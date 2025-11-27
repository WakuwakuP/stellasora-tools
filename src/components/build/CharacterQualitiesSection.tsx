'use client'

import { Avatar, AvatarFallback, AvatarImage } from 'components/ui/avatar'
import { type FC, useMemo } from 'react'
import type { QualityInfo } from 'types/quality'
import { QualityCard } from './QualityCard'

/** コア素質のインデックス（API: mainCore/supportCoreは最初の4つ） */
export const CORE_TALENT_INDICES = [0, 1, 2, 3]

/** コア素質の最大選択数 */
export const MAX_CORE_TALENTS = 2

/** 通常素質の最大レベル */
export const MAX_TALENT_LEVEL = 6

/** 素質がコア素質かどうかを判定（インデックスまたはisCoreプロパティで判定） */
export const isCoreTalent = (
  index: number,
  quality?: QualityInfo,
): boolean => {
  // QualityInfo に isCore プロパティがあればそれを使用（API経由のデータ）
  if (quality?.isCore !== undefined) {
    return quality.isCore
  }
  // フォールバック: 最初の4つはコア素質（ローカルデータ用）
  // APIデータ構造: mainCore(4) + mainNormal(9) + common(3) = 16
  return CORE_TALENT_INDICES.includes(index)
}

/** 素質を元のインデックスと一緒に保持する型 */
interface QualityWithIndex {
  quality: QualityInfo
  originalIndex: number
}

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
 * キャラクターごとの素質をコア/サブでグループ分けして表示する。
 * サブ素質はレアリティ順（rarity1 → rarity2）で並べる。
 * 各素質はクリックで選択/レベルアップ/選択解除できる。
 */
export const CharacterQualitiesSection: FC<CharacterQualitiesSectionProps> = ({
  characterName,
  qualities,
  role,
  selectedTalents,
  onTalentSelect,
  totalLevel,
}) => {
  // 素質をコア/サブにグループ分けし、サブはレアリティでソート
  const { coreQualities, subQualities } = useMemo(() => {
    const qualitiesWithIndex: QualityWithIndex[] = qualities.map(
      (quality, index) => ({
        quality,
        originalIndex: index,
      }),
    )

    const core = qualitiesWithIndex.filter((q) =>
      isCoreTalent(q.originalIndex, q.quality),
    )
    const sub = qualitiesWithIndex
      .filter((q) => !isCoreTalent(q.originalIndex, q.quality))
      // レアリティ順でソート（rarity1 → rarity2）
      // ローカルデータにはrarityがないためデフォルト値1を使用
      .sort((a, b) => (a.quality.rarity ?? 1) - (b.quality.rarity ?? 1))

    return { coreQualities: core, subQualities: sub }
  }, [qualities])

  const renderQualityGrid = (
    items: QualityWithIndex[],
    groupName: string,
  ) => (
    <div key={groupName}>
      <div className="mb-1 font-medium text-slate-500 text-xs">{groupName}</div>
      <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
        {items.map(({ quality, originalIndex }) => {
          const selectedTalent = selectedTalents.find(
            (t) =>
              t.characterName === characterName &&
              t.role === role &&
              t.index === originalIndex,
          )
          const isCore = isCoreTalent(originalIndex, quality)
          return (
            <QualityCard
              key={`${characterName}-${role}-${originalIndex}`}
              quality={quality}
              isSelected={selectedTalent !== undefined}
              level={selectedTalent?.level}
              isCore={isCore}
              onClick={() => onTalentSelect(characterName, role, originalIndex)}
            />
          )
        })}
      </div>
    </div>
  )

  return (
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
        {renderQualityGrid(coreQualities, 'コア素質')}
        {renderQualityGrid(subQualities, 'サブ素質')}
      </div>
    </div>
  )
}
