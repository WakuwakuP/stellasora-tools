'use client'

import { Badge } from 'components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card'
import { Slider } from 'components/ui/slider'
import { getNoteImagePath } from 'constants/noteImageMap'
import Image from 'next/image'
import { type FC, useMemo, useState } from 'react'
import type { LossRecordInfo, SkillRequirement } from 'types/lossRecord'

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

/**
 * スキル説明文のプレースホルダーを置換する
 */
function replaceSkillParams(description: string, params?: string[]): string {
  if (!params || params.length === 0) {
    return description
  }
  // HTMLカラータグを削除
  let result = description.replace(/<color=[^>]+>|<\/color>/g, '')
  // {N}プレースホルダーを置換
  for (let i = 0; i < params.length; i++) {
    result = result.replaceAll(`{${i + 1}}`, params[i])
  }
  return result
}

export interface LossRecordSkillSectionProps {
  /** メインロスレコ情報 */
  mainLossRecords: LossRecordInfo[]
  /** サブロスレコ情報 */
  subLossRecords: LossRecordInfo[]
}

/**
 * スキル必要音符を表示するコンポーネント
 */
const SkillRequirementDisplay: FC<{ requirements: SkillRequirement[] }> = ({
  requirements,
}) => {
  if (!requirements || requirements.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      <span className="text-xs text-slate-500">必要音符:</span>
      {requirements.map((req) => {
        const imagePath = getNoteImagePath(req.name)
        return (
          <span
            key={req.name}
            className="inline-flex items-center gap-0.5 text-xs text-slate-600 dark:text-slate-300"
            title={req.name}
          >
            {imagePath ? (
              <Image
                src={imagePath}
                alt={req.name}
                width={16}
                height={16}
                className="h-4 w-4"
              />
            ) : (
              <span>🎵</span>
            )}
            <span>{req.quantity}</span>
          </span>
        )
      })}
    </div>
  )
}

/**
 * ロスレコスキルセクションコンポーネント
 *
 * メインロスレコとサブロスレコのスキル情報を表示する。
 * セカンダリスキルはレベルを切り替えて表示できる。
 */
export const LossRecordSkillSection: FC<LossRecordSkillSectionProps> = ({
  mainLossRecords,
  subLossRecords,
}) => {
  // 各セカンダリスキルのレベル状態を管理
  // キー: `{ロスレコID}-{スキルインデックス}`, 値: 選択中のレベル (0-indexed)
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({})

  const handleSkillLevelChange = (
    lossRecordId: number,
    skillIndex: number,
    level: number,
  ) => {
    setSkillLevels((prev) => ({
      ...prev,
      [`${lossRecordId}-${skillIndex}`]: level,
    }))
  }

  const getSkillLevel = (
    lossRecordId: number,
    skillIndex: number,
    maxLevel: number,
  ): number => {
    const key = `${lossRecordId}-${skillIndex}`
    return skillLevels[key] ?? maxLevel - 1 // デフォルトは最大レベル
  }

  const allLossRecords = useMemo(
    () => [...mainLossRecords, ...subLossRecords],
    [mainLossRecords, subLossRecords],
  )

  if (allLossRecords.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center text-slate-500">
        <p>ロスレコが選択されていません</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* メインロスレコセクション */}
      {mainLossRecords.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-lg">
            <span>⊕</span>
            メインロスレコ
          </h3>
          <div className="grid gap-4">
            {mainLossRecords.map((lr) => (
              <LossRecordSkillCard
                key={lr.id}
                lossRecord={lr}
                skillLevels={skillLevels}
                getSkillLevel={getSkillLevel}
                onSkillLevelChange={handleSkillLevelChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* サブロスレコセクション */}
      {subLossRecords.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-lg">
            <span>⊖</span>
            サブロスレコ
          </h3>
          <div className="grid gap-4">
            {subLossRecords.map((lr) => (
              <LossRecordSkillCard
                key={lr.id}
                lossRecord={lr}
                skillLevels={skillLevels}
                getSkillLevel={getSkillLevel}
                onSkillLevelChange={handleSkillLevelChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface LossRecordSkillCardProps {
  lossRecord: LossRecordInfo
  skillLevels: Record<string, number>
  getSkillLevel: (
    lossRecordId: number,
    skillIndex: number,
    maxLevel: number,
  ) => number
  onSkillLevelChange: (
    lossRecordId: number,
    skillIndex: number,
    level: number,
  ) => void
}

/**
 * 個別のロスレコスキルカードコンポーネント
 */
const LossRecordSkillCard: FC<LossRecordSkillCardProps> = ({
  lossRecord,
  getSkillLevel,
  onSkillLevelChange,
}) => {
  const starColor = STAR_COLORS[lossRecord.star] ?? 'text-slate-400'
  const elementColor = ELEMENT_COLORS[lossRecord.element] ?? 'text-slate-400'

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3">
          {/* ロスレコアイコン */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
            <Image
              src={lossRecord.iconUrl}
              alt={lossRecord.name}
              fill
              sizes="48px"
              className="object-contain p-1"
            />
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {lossRecord.name}
              <span className={`text-sm ${starColor}`}>
                {'★'.repeat(lossRecord.star)}
              </span>
              {lossRecord.element !== 'なし' && (
                <Badge variant="outline" className={elementColor}>
                  {lossRecord.element}
                </Badge>
              )}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* メインスキル */}
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
          <div className="mb-1 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              メインスキル
            </Badge>
            <span className="font-medium text-sm">{lossRecord.mainSkill.name}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
            {lossRecord.mainSkillDescription}
          </p>
        </div>

        {/* セカンダリスキル */}
        {lossRecord.secondarySkills.map((skill, index) => {
          const maxLevel = skill.params.length
          const currentLevel = getSkillLevel(lossRecord.id, index, maxLevel)
          const currentParams = skill.params[currentLevel] ?? []
          const currentRequirements = skill.requirements[currentLevel] ?? []
          const description = replaceSkillParams(skill.description, currentParams)

          return (
            <div
              key={`${lossRecord.id}-secondary-${skill.name}`}
              className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50"
            >
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  サブスキル {index + 1}
                </Badge>
                <span className="font-medium text-sm">{skill.name}</span>
              </div>

              {/* レベルスライダー */}
              {maxLevel > 1 && (
                <div className="mb-3 mt-2">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-slate-500">スキルレベル</span>
                    <span className="font-medium text-xs">
                      Lv.{currentLevel + 1} / {maxLevel}
                    </span>
                  </div>
                  <Slider
                    value={[currentLevel]}
                    onValueChange={(values) =>
                      onSkillLevelChange(lossRecord.id, index, values[0])
                    }
                    min={0}
                    max={maxLevel - 1}
                    step={1}
                    className="w-full"
                    aria-label={`${skill.name}のスキルレベル`}
                  />
                </div>
              )}

              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                {description}
              </p>

              {/* 必要音符 */}
              <SkillRequirementDisplay requirements={currentRequirements} />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
