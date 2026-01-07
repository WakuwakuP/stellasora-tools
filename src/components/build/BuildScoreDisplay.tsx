/**
 * ビルドスコア表示コンポーネント
 * 各素質・スキルの平均ダメージ増加率と、効果タイプごとの集計を表示
 */

import { Badge } from 'components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card'
import { Skeleton } from 'components/ui/skeleton'
import type { FC } from 'react'
import type { BuildScoreResult, EffectEvaluation } from 'types/buildScore'

export interface BuildScoreDisplayProps {
  /** ビルドスコア計算結果 */
  buildScore: BuildScoreResult | null
  /** ローディング状態 */
  isLoading?: boolean
}

/**
 * 効果タイプの日本語表記マッピング
 */
const EFFECT_TYPE_LABELS: Record<string, string> = {
  // ダメージ系
  damage_increase: 'ダメージ',
  normal_attack_damage: '通常攻撃ダメージ',
  skill_damage: 'スキルダメージ',
  ultimate_damage: '必殺技ダメージ',
  
  // 属性ダメージ
  elemental_damage: '属性ダメージ',
  water_damage: '属性ダメージ(水)',
  fire_damage: '属性ダメージ(火)',
  wind_damage: '属性ダメージ(風)',
  earth_damage: '属性ダメージ(地)',
  light_damage: '属性ダメージ(光)',
  dark_damage: '属性ダメージ(闇)',
  
  // 印ダメージ
  mark_damage: '印ダメージ',
  water_mark_damage: '印ダメージ(水)',
  fire_mark_damage: '印ダメージ(火)',
  wind_mark_damage: '印ダメージ(風)',
  earth_mark_damage: '印ダメージ(地)',
  light_mark_damage: '印ダメージ(光)',
  dark_mark_damage: '印ダメージ(闇)',
  
  // ステータス系
  atk_increase: '攻撃力',
  speed_increase: '速度',
  crit_rate: '会心率',
  crit_damage: '会心ダメージ',
  
  // その他
  cooldown_reduction: 'クールダウン',
  damage_taken_increase: '被ダメージ増加',
  def_decrease: '被ダメージ増加', // 防御力減少は被ダメージ増加として扱う
}

/**
 * 効果タイプごとの集計を計算
 */
function aggregateEffectsByType(
  evaluations: EffectEvaluation[],
): Array<{ type: string; label: string; totalIncrease: number }> {
  const typeMap = new Map<string, number>()

  for (const evaluation of evaluations) {
    const current = typeMap.get(evaluation.effectType) ?? 0
    const increase = evaluation.averageDamageIncrease ?? 0
    typeMap.set(evaluation.effectType, current + increase)
  }

  return Array.from(typeMap.entries())
    .map(([type, totalIncrease]) => ({
      type,
      label: EFFECT_TYPE_LABELS[type] ?? type,
      totalIncrease,
    }))
    .sort((a, b) => b.totalIncrease - a.totalIncrease)
}

/**
 * ビルドスコア表示コンポーネント
 */
export const BuildScoreDisplay: FC<BuildScoreDisplayProps> = ({
  buildScore,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ビルドスコア計算中...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!buildScore) {
    return null
  }

  // 全ての効果評価を集約
  const allEvaluations: EffectEvaluation[] = []
  for (const charEval of buildScore.characterEvaluations) {
    allEvaluations.push(...charEval.talentEvaluations)
  }
  for (const discEval of buildScore.discEvaluations) {
    allEvaluations.push(...discEval.skillEvaluations)
  }

  // 効果タイプごとに集計
  const aggregatedEffects = aggregateEffectsByType(allEvaluations)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>ビルドスコア</span>
          <Badge variant="default" className="text-lg px-4 py-1">
            {buildScore.buildScore?.toFixed(1) ?? '0.0'}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 効果タイプごとの集計 */}
        <div>
          <h3 className="mb-2 font-semibold text-sm text-slate-600 dark:text-slate-300">
            効果タイプ別ダメージ増加率
          </h3>
          <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
            {aggregatedEffects.map((effect) => (
              <div
                key={effect.type}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800"
              >
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {effect.label}
                </span>
                <span className="font-semibold text-sm text-primary">
                  +{effect.totalIncrease?.toFixed(1) ?? '0.0'}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 素質/スキルの個別ダメージ増加率バッジ
 */
export interface DamageIncreaseBadgeProps {
  /** 効果名（素質名やスキル名） */
  effectName: string
  /** 平均ダメージ増加率 */
  damageIncrease: number
}

export const DamageIncreaseBadge: FC<DamageIncreaseBadgeProps> = ({
  damageIncrease,
}) => {
  if (!damageIncrease || damageIncrease === 0) {
    return null
  }

  return (
    <Badge
      variant="secondary"
      className="ml-1 text-xs font-normal text-primary"
    >
      +{damageIncrease.toFixed(1)}%
    </Badge>
  )
}
