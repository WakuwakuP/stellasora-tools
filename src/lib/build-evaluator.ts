/**
 * ビルド評価メトリクス計算
 * 各種ステータスからビルドの総合スコアを算出
 */

import {
  type BaseStats,
  type BuildComparisonResult,
  type BuildEvaluationMetrics,
  type DamageBonus,
  type DefensePenetration,
} from 'types/damage-calculation'

/**
 * スコア計算の重み設定
 */
export interface ScoreWeights {
  attack: number
  critEfficiency: number
  elementalDamage: number
  dps: number
  buffUptime: number
}

/**
 * デフォルトの重み設定（DPS重視）
 */
export const DEFAULT_WEIGHTS: ScoreWeights = {
  attack: 0.2,
  buffUptime: 0.15,
  critEfficiency: 0.25,
  dps: 0.25,
  elementalDamage: 0.15,
}

/**
 * 攻撃力スコアを計算
 * ATKの基本値とボーナスを評価
 *
 * @param atk - 総合攻撃力
 * @param baselineAtk - 基準攻撃力（デフォルト: 1000）
 * @returns 攻撃力スコア (0-100)
 */
export function calculateAttackScore(atk: number, baselineAtk = 1000): number {
  // 基準値に対する割合でスコア化
  const ratio = atk / baselineAtk
  // 2倍で100点、それ以上は上限
  return Math.min(ratio * 50, 100)
}

/**
 * 防御力スコアを計算
 * DEFとHPから生存能力を評価
 *
 * @param def - 防御力
 * @param hp - HP
 * @param baselineDef - 基準防御力（デフォルト: 500）
 * @param baselineHp - 基準HP（デフォルト: 10000）
 * @returns 防御力スコア (0-100)
 */
export function calculateDefenseScore(
  def: number,
  hp: number,
  baselineDef = 500,
  baselineHp = 10000,
): number {
  // 実効HP = HP × (1 + DEF / 100)
  const effectiveHp = hp * (1 + def / 100)
  const baselineEffectiveHp = baselineHp * (1 + baselineDef / 100)

  const ratio = effectiveHp / baselineEffectiveHp
  return Math.min(ratio * 50, 100)
}

/**
 * クリティカル効率スコアを計算
 * 会心率と会心ダメージのバランスを評価
 * 会心率100%を最大とし、超える場合はマイナス評価
 *
 * 計算式:
 * - 基本スコア = (会心率 × 会心ダメージ / 理想値) / 1.5 × 100
 * - 理想値 = 0.5 (50%) × 1.0 (100%)
 * - 会心率が100%超過: 1%超過ごとに-0.5点
 *
 * @param critRate - 会心率 (0-1以上)
 * @param critDmg - 会心ダメージ倍率
 * @returns クリティカル効率スコア (0-100、会心率が100%超過でマイナス評価)
 */
export function calculateCritEfficiencyScore(
  critRate: number,
  critDmg: number,
): number {
  // 会心率が100%を超える場合はペナルティを適用
  let effectiveCritRate = critRate
  let penalty = 0

  if (critRate > 1) {
    // 100%超過分に対してペナルティ: 1%超過ごとに-0.5点
    const excessRate = critRate - 1
    penalty = excessRate * 50 // 超過分を%に変換 (1% = 0.01 * 50 = 0.5点)
    effectiveCritRate = 1 // 計算には100%でキャップ
  }

  // クリティカル期待値増加率 = CritRate × CritDmg
  const critValue = effectiveCritRate * critDmg

  // 理想的なバランス（会心率50%, 会心ダメージ100%）を基準に評価
  const idealCritValue = 0.5 * 1.0
  const ratio = critValue / idealCritValue

  // 1.5倍で100点
  const baseScore = Math.min((ratio / 1.5) * 100, 100)

  // ペナルティを適用
  return Math.max(baseScore - penalty, 0)
}

/**
 * 属性ダメージスコアを計算
 * 属性ダメージボーナスと防御貫通を評価
 *
 * @param damageBonus - ダメージボーナス
 * @param defensePen - 防御貫通
 * @returns 属性ダメージスコア (0-100)
 */
export function calculateElementalDamageScore(
  damageBonus: DamageBonus,
  defensePen: DefensePenetration,
): number {
  // 総ダメージボーナス
  const totalBonus =
    damageBonus.skillDmg +
    damageBonus.normalAtkDmg +
    damageBonus.ultimateDmg +
    damageBonus.elementalDmg +
    damageBonus.totalDmg

  // 防御貫通の価値を加算（%無視は特に価値が高い）
  const penValue = defensePen.defIgnore * 200 + defensePen.defPenetrate / 10

  const totalValue = totalBonus + penValue

  // 150%のボーナスで100点
  return Math.min((totalValue / 150) * 100, 100)
}

/**
 * DPSスコアを計算
 *
 * @param dps - 秒間ダメージ
 * @param baselineDps - 基準DPS（デフォルト: 5000）
 * @returns DPSスコア (0-100)
 */
export function calculateDpsScore(dps: number, baselineDps = 5000): number {
  const ratio = dps / baselineDps
  // 2倍で100点
  return Math.min(ratio * 50, 100)
}

/**
 * バフの種類
 */
export type BuffType =
  | 'attack' // 攻撃力バフ
  | 'normalAttackDmg' // 通常攻撃ダメージバフ
  | 'skillDmg' // スキルダメージバフ
  | 'ultimateDmg' // 必殺技ダメージバフ
  | 'elementalDmg' // 属性ダメージバフ
  | 'totalDmg' // 全ダメージバフ
  | 'critRate' // 会心率バフ
  | 'critDmg' // 会心ダメージバフ
  | 'other' // その他

/**
 * バフ情報
 */
export interface BuffInfo {
  type: BuffType
  amount: number // バフ量（%値 or 固定値）
  duration: number // 継続時間（秒）
  cooldown: number // クールダウン時間（秒）
}

/**
 * バフ稼働率スコアを計算
 * バフ・デバフの継続時間と再発動時間からアクティブ割合を評価
 * バフ種類ごとに (バフ量 × 稼働率) を合計して評価
 *
 * 計算式:
 * - 各バフタイプ毎の合計 = Σ(バフ量 × 稼働率)
 * - 稼働率 = 継続時間 / (継続時間 + クールダウン)
 * - 総合スコア = 全タイプの合計を正規化して0-100点に変換
 *
 * @param buffs - バフ情報の配列
 * @returns バフ稼働率スコア (0-100)
 */
export function calculateBuffUptimeScore(buffs?: BuffInfo[]): number {
  if (!buffs || buffs.length === 0) {
    // バフがない場合は中立的な50点
    return 50
  }

  // バフタイプごとに (バフ量 × 稼働率) を合計
  const buffTypeScores: Record<BuffType, number> = {
    attack: 0,
    critDmg: 0,
    critRate: 0,
    elementalDmg: 0,
    normalAttackDmg: 0,
    other: 0,
    skillDmg: 0,
    totalDmg: 0,
    ultimateDmg: 0,
  }

  for (const buff of buffs) {
    // 稼働率 = 継続時間 / (継続時間 + クールダウン)
    const uptime = buff.duration / (buff.duration + buff.cooldown)
    // バフ量 × 稼働率を該当タイプに加算
    buffTypeScores[buff.type] += buff.amount * uptime
  }

  // 各タイプのスコアを合計
  // 攻撃力バフとダメージバフで基準値が異なる
  let totalScore = 0

  // 攻撃力バフ: 50%で50点満点
  totalScore += Math.min((buffTypeScores.attack / 50) * 50, 50)

  // ダメージバフ各種: 合計100%で50点満点
  const totalDmgBuffs =
    buffTypeScores.normalAttackDmg +
    buffTypeScores.skillDmg +
    buffTypeScores.ultimateDmg +
    buffTypeScores.elementalDmg +
    buffTypeScores.totalDmg
  totalScore += Math.min((totalDmgBuffs / 100) * 30, 30)

  // 会心系バフ: 会心率25% + 会心ダメージ50%で20点満点
  const critScore =
    Math.min((buffTypeScores.critRate / 25) * 10, 10) +
    Math.min((buffTypeScores.critDmg / 50) * 10, 10)
  totalScore += critScore

  return Math.min(totalScore, 100)
}

/**
 * ビルドの総合評価を計算
 *
 * @param stats - 基本ステータス
 * @param damageBonus - ダメージボーナス
 * @param defensePen - 防御貫通
 * @param dps - DPS値
 * @param buffs - バフ情報（オプション）
 * @param weights - スコアの重み（オプション）
 * @returns ビルド評価メトリクス
 */
export function evaluateBuild(
  stats: BaseStats,
  damageBonus: DamageBonus,
  defensePen: DefensePenetration,
  dps: number,
  buffs?: BuffInfo[],
  weights: ScoreWeights = DEFAULT_WEIGHTS,
): BuildEvaluationMetrics {
  const attackScore = calculateAttackScore(stats.atk)
  const critEfficiencyScore = calculateCritEfficiencyScore(
    stats.critRate,
    stats.critDmg,
  )
  const elementalDamageScore = calculateElementalDamageScore(
    damageBonus,
    defensePen,
  )
  const dpsScore = calculateDpsScore(dps)
  const buffUptimeScore = calculateBuffUptimeScore(buffs)

  // 重み付き総合スコア
  const totalScore =
    attackScore * weights.attack +
    critEfficiencyScore * weights.critEfficiency +
    elementalDamageScore * weights.elementalDamage +
    dpsScore * weights.dps +
    buffUptimeScore * weights.buffUptime

  return {
    attackScore,
    breakdown: {
      attack: attackScore * weights.attack,
      buffUptime: buffUptimeScore * weights.buffUptime,
      critEfficiency: critEfficiencyScore * weights.critEfficiency,
      dps: dpsScore * weights.dps,
      elementalDamage: elementalDamageScore * weights.elementalDamage,
    },
    buffUptimeScore,
    critEfficiencyScore,
    dpsScore,
    elementalDamageScore,
    totalScore,
  }
}

/**
 * 2つのビルドを比較
 *
 * @param metricsA - ビルドAの評価メトリクス
 * @param metricsB - ビルドBの評価メトリクス
 * @param tolerance - 同点判定の許容誤差（デフォルト: 1.0）
 * @returns ビルド比較結果
 */
export function compareBuilds(
  metricsA: BuildEvaluationMetrics,
  metricsB: BuildEvaluationMetrics,
  tolerance = 1.0,
): BuildComparisonResult {
  const difference = {
    attackScore: metricsA.attackScore - metricsB.attackScore,
    buffUptimeScore: metricsA.buffUptimeScore - metricsB.buffUptimeScore,
    critEfficiencyScore:
      metricsA.critEfficiencyScore - metricsB.critEfficiencyScore,
    dpsScore: metricsA.dpsScore - metricsB.dpsScore,
    elementalDamageScore:
      metricsA.elementalDamageScore - metricsB.elementalDamageScore,
    totalScore: metricsA.totalScore - metricsB.totalScore,
  }

  let winner: 'A' | 'B' | 'Draw' = 'Draw'
  if (Math.abs(difference.totalScore) > tolerance) {
    winner = difference.totalScore > 0 ? 'A' : 'B'
  }

  return {
    buildA: metricsA,
    buildB: metricsB,
    difference,
    winner,
  }
}

/**
 * 次に改善すべきステータスを提案
 * 各ステータスの限界効用を計算し、最も効率的な改善点を特定
 *
 * @param stats - 現在のステータス
 * @param damageBonus - 現在のダメージボーナス
 * @returns 推奨改善ステータス
 */
export function suggestStatPriority(
  stats: BaseStats,
  damageBonus: DamageBonus,
): {
  priority: 'atk' | 'critRate' | 'critDmg' | 'skillDmg' | 'elementalDmg'
  reason: string
} {
  // 簡易的な限界効用分析
  const critRateValue = stats.critDmg * (1 - stats.critRate)
  const critDmgValue = stats.critRate
  const atkValue = 1 / (1 + stats.atk / 1000)

  // ダメージボーナスの飽和度チェック
  const totalDmgBonus =
    damageBonus.skillDmg + damageBonus.elementalDmg + damageBonus.totalDmg
  const dmgBonusValue = 1 / (1 + totalDmgBonus / 100)

  // 最も価値の高いステータスを選択
  const priorities = [
    {
      reason: '会心率の向上が最も効率的です',
      stat: 'critRate' as const,
      value: critRateValue,
    },
    {
      reason: '会心ダメージの向上が最も効率的です',
      stat: 'critDmg' as const,
      value: critDmgValue,
    },
    {
      reason: '攻撃力の向上が最も効率的です',
      stat: 'atk' as const,
      value: atkValue,
    },
    {
      reason: 'スキルダメージボーナスの向上が最も効率的です',
      stat: 'skillDmg' as const,
      value: dmgBonusValue,
    },
    {
      reason: '属性ダメージボーナスの向上が最も効率的です',
      stat: 'elementalDmg' as const,
      value: dmgBonusValue,
    },
  ]

  priorities.sort((a, b) => b.value - a.value)

  return {
    priority: priorities[0].stat,
    reason: priorities[0].reason,
  }
}
