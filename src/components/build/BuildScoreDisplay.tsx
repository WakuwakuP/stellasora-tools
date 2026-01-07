/**
 * ビルドスコア表示コンポーネント
 * 各素質・スキルの平均ダメージ増加率と、効果タイプごとの集計を表示
 */

import { Badge } from 'components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card'
import { Skeleton } from 'components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'components/ui/tooltip'
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
  normal_attack_damage: '通常攻撃',
  skill_damage: 'スキル',
  ultimate_damage: '必殺技',
  mark_damage: '印',
  
  // 属性ダメージ
  elemental_damage: '属性ダメージ',
  water_damage: '水属性',
  fire_damage: '火属性',
  wind_damage: '風属性',
  earth_damage: '地属性',
  light_damage: '光属性',
  dark_damage: '闇属性',
  
  // ステータス系
  atk_increase: '攻撃力',
  speed_increase: '速度',
  crit_rate: '会心率',
  crit_damage: '会心ダメージ',
  
  // その他
  cooldown_reduction: 'クールダウン',
  damage_taken_increase: '被ダメ増加',
  def_decrease: '被ダメ増加', // 防御力減少は被ダメージ増加として扱う
}

interface AggregatedEffect {
  type: string
  label: string
  totalIncrease: number
}

/**
 * 効果タイプごとの集計を計算
 */
function aggregateEffectsByType(
  evaluations: EffectEvaluation[],
): Map<string, AggregatedEffect> {
  const typeMap = new Map<string, number>()

  for (const evaluation of evaluations) {
    const current = typeMap.get(evaluation.effectType) ?? 0
    const increase = evaluation.averageDamageIncrease ?? 0
    typeMap.set(evaluation.effectType, current + increase)
  }

  const resultMap = new Map<string, AggregatedEffect>()
  for (const [type, totalIncrease] of typeMap.entries()) {
    resultMap.set(type, {
      type,
      label: EFFECT_TYPE_LABELS[type] ?? type,
      totalIncrease,
    })
  }

  return resultMap
}

/**
 * 総合スコアを計算
 * (攻撃力) * (最高属性ダメージ + 最高攻撃種別ダメージ) * (会心率) * (会心ダメージ) * (被ダメ増加)
 */
function calculateTotalScore(effectsMap: Map<string, AggregatedEffect>): number {
  // 攻撃力バフ（1 + 増加率）
  const atkBuff = 1 + ((effectsMap.get('atk_increase')?.totalIncrease ?? 0) / 100)
  
  // 最高属性ダメージバフ
  const elementalTypes = ['elemental_damage', 'water_damage', 'fire_damage', 'wind_damage', 'earth_damage', 'light_damage', 'dark_damage']
  const maxElementalDamage = Math.max(
    0,
    ...elementalTypes.map(type => effectsMap.get(type)?.totalIncrease ?? 0)
  )
  
  // 最高攻撃種別ダメージバフ
  const attackTypes = ['damage_increase', 'normal_attack_damage', 'skill_damage', 'ultimate_damage', 'mark_damage']
  const maxAttackDamage = Math.max(
    0,
    ...attackTypes.map(type => effectsMap.get(type)?.totalIncrease ?? 0)
  )
  
  // 会心率（1 + 増加率）
  const critRate = 1 + ((effectsMap.get('crit_rate')?.totalIncrease ?? 0) / 100)
  
  // 会心ダメージ（1 + 増加率）
  const critDamage = 1 + ((effectsMap.get('crit_damage')?.totalIncrease ?? 0) / 100)
  
  // 被ダメ増加（1 + 増加率）
  const damageTaken = 1 + ((effectsMap.get('damage_taken_increase')?.totalIncrease ?? 0) / 100)
  
  // 総合スコア = (攻撃力) * (属性 + 攻撃種別) * (会心率) * (会心ダメージ) * (被ダメ増加)
  // パーセント表記のため100を掛ける
  const score = atkBuff * (maxElementalDamage + maxAttackDamage) * critRate * critDamage * damageTaken
  
  return score
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
  const effectsMap = aggregateEffectsByType(allEvaluations)
  
  // 新しい総合スコアを計算
  const totalScore = calculateTotalScore(effectsMap)
  
  // 属性ダメージグループ
  const elementalDamages = [
    effectsMap.get('elemental_damage'),
    effectsMap.get('water_damage'),
    effectsMap.get('fire_damage'),
    effectsMap.get('wind_damage'),
    effectsMap.get('earth_damage'),
    effectsMap.get('light_damage'),
    effectsMap.get('dark_damage'),
  ].filter((e): e is AggregatedEffect => e !== undefined && e.totalIncrease > 0)
    .sort((a, b) => b.totalIncrease - a.totalIncrease)
  
  // 攻撃種別ダメージグループ
  const attackDamages = [
    effectsMap.get('damage_increase'),
    effectsMap.get('normal_attack_damage'),
    effectsMap.get('skill_damage'),
    effectsMap.get('ultimate_damage'),
    effectsMap.get('mark_damage'),
  ].filter((e): e is AggregatedEffect => e !== undefined && e.totalIncrease > 0)
    .sort((a, b) => b.totalIncrease - a.totalIncrease)

  const StatRow: FC<{ label: string; value: number; tooltip?: string }> = ({ label, value, tooltip }) => (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
      <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
      {tooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-semibold text-sm text-primary cursor-help">
                +{value.toFixed(1)}%
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span className="font-semibold text-sm text-primary">
          +{value.toFixed(1)}%
        </span>
      )}
    </div>
  )

  const DamageGroup: FC<{ damages: AggregatedEffect[]; title: string }> = ({ damages, title }) => {
    if (damages.length === 0) return null
    
    const topDamage = damages[0]
    const others = damages.slice(1)
    
    if (others.length === 0) {
      return <StatRow label={topDamage.label} value={topDamage.totalIncrease} />
    }
    
    const tooltipText = others.map(d => `${d.label}: +${d.totalIncrease.toFixed(1)}%`).join('\n')
    
    return (
      <StatRow
        label={topDamage.label}
        value={topDamage.totalIncrease}
        tooltip={tooltipText}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>総合スコア</span>
          <Badge variant="default" className="text-lg px-4 py-1">
            {totalScore.toFixed(1)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* 2列グリッドレイアウト */}
        <div className="grid gap-2 grid-cols-2">
          {/* 攻撃力 */}
          <StatRow 
            label="攻撃力" 
            value={effectsMap.get('atk_increase')?.totalIncrease ?? 0} 
          />
          
          {/* 被ダメ増加 */}
          <StatRow 
            label="被ダメ増加" 
            value={effectsMap.get('damage_taken_increase')?.totalIncrease ?? 0} 
          />
        </div>
        
        {/* ダメージ（全幅） */}
        {effectsMap.get('damage_increase') && (
          <StatRow 
            label="ダメージ" 
            value={effectsMap.get('damage_increase')!.totalIncrease} 
          />
        )}
        
        <div className="grid gap-2 grid-cols-2">
          {/* 最高属性ダメージ */}
          <DamageGroup damages={elementalDamages} title="属性ダメージ" />
          
          {/* 最高攻撃種別ダメージ */}
          <DamageGroup damages={attackDamages} title="攻撃種別" />
        </div>
        
        <div className="grid gap-2 grid-cols-2">
          {/* 会心率 */}
          <StatRow 
            label="会心率" 
            value={effectsMap.get('crit_rate')?.totalIncrease ?? 0} 
          />
          
          {/* 会心ダメージ */}
          <StatRow 
            label="会心ダメージ" 
            value={effectsMap.get('crit_damage')?.totalIncrease ?? 0} 
          />
          
          {/* 速度 */}
          <StatRow 
            label="速度" 
            value={effectsMap.get('speed_increase')?.totalIncrease ?? 0} 
          />
          
          {/* クールダウン */}
          <StatRow 
            label="クールダウン" 
            value={effectsMap.get('cooldown_reduction')?.totalIncrease ?? 0} 
          />
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
