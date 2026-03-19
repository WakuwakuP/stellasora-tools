'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { ELEMENT_COLORS, STAR_COLORS } from '@/constants/lossRecordColors'
import { getNoteImagePath } from '@/constants/noteImageMap'
import Image from 'next/image'
import { type FC, useMemo, useState } from 'react'
import type { LossRecordInfo, SkillRequirement, SupportNote } from '@/types/lossRecord'
import { replaceSkillParams } from '@/utils/skillUtils'

/**
 * 複数のロスレコのサポート音符を合計する
 * @param lossRecords - 合計対象のロスレコ情報配列
 * @returns 合計されたサポート音符の配列
 */
function sumSupportNotes(lossRecords: LossRecordInfo[]): SupportNote[] {
  const noteMap = new Map<string, number>()

  for (const lr of lossRecords) {
    for (const note of lr.supportNote) {
      const current = noteMap.get(note.name) ?? 0
      noteMap.set(note.name, current + note.quantity)
    }
  }

  return Array.from(noteMap.entries()).map(([name, quantity]) => ({
    name,
    quantity,
  }))
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
            role="img"
            aria-label={`${req.name} ${req.quantity}個必要`}
            className="inline-flex items-center gap-0.5 text-xs text-slate-600 dark:text-slate-300"
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

  // サブロスレコの初期取得音符を合計
  const totalSupportNotes = useMemo(
    () => sumSupportNotes(subLossRecords),
    [subLossRecords],
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

      {/* サブロスレコセクション - 初期取得音符の合計を表示 */}
      {subLossRecords.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-lg">
            <span>⊖</span>
            サブロスレコ初期取得音符
          </h3>
          <Card className="py-4">
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                {totalSupportNotes.map((note) => {
                  const imagePath = getNoteImagePath(note.name)
                  return (
                    <div
                      key={note.name}
                      role="img"
                      aria-label={`${note.name} ${note.quantity}個`}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800"
                    >
                      {imagePath ? (
                        <Image
                          src={imagePath}
                          alt={note.name}
                          width={24}
                          height={24}
                          className="h-6 w-6"
                        />
                      ) : (
                        <span className="text-lg">🎵</span>
                      )}
                      <span className="font-medium text-lg">{note.quantity}</span>
                    </div>
                  )
                })}
              </div>
              {totalSupportNotes.length === 0 && (
                <p className="text-slate-500 text-sm">
                  サブロスレコに初期取得音符がありません
                </p>
              )}
            </CardContent>
          </Card>
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

interface SecondarySkillItemProps {
  skill: LossRecordInfo['secondarySkills'][number]
  index: number
  lossRecordId: number
  getSkillLevel: LossRecordSkillCardProps['getSkillLevel']
  onSkillLevelChange: LossRecordSkillCardProps['onSkillLevelChange']
}

/**
 * セカンダリスキルアイテムコンポーネント
 * useMemoを使用してスキル説明文の置換をキャッシュする
 */
const SecondarySkillItem: FC<SecondarySkillItemProps> = ({
  skill,
  index,
  lossRecordId,
  getSkillLevel,
  onSkillLevelChange,
}) => {
  const maxLevel = skill.params.length
  const currentLevel = getSkillLevel(lossRecordId, index, maxLevel)
  const currentParams = skill.params[currentLevel] ?? []
  const currentRequirements = skill.requirements[currentLevel] ?? []

  // currentParamsを文字列化してメモ化の依存配列として使用
  const paramsKey = currentParams.join(',')
  const description = useMemo(
    () => replaceSkillParams(skill.description, currentParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [skill.description, paramsKey],
  )

  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
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
              onSkillLevelChange(lossRecordId, index, values[0])
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
        {lossRecord.secondarySkills.map((skill, index) => (
          <SecondarySkillItem
            key={`${lossRecord.id}-secondary-${skill.name}`}
            skill={skill}
            index={index}
            lossRecordId={lossRecord.id}
            getSkillLevel={getSkillLevel}
            onSkillLevelChange={onSkillLevelChange}
          />
        ))}
      </CardContent>
    </Card>
  )
}
