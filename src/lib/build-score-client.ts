/**
 * クライアントサイドでのビルドスコア計算ユーティリティ
 * バックエンドから取得したJSONデータを元に計算を行う
 */

import {
  type BuildEffectsData,
  type BuildScoreResult,
  type EffectEvaluation,
  type ParsedEffect,
} from 'types/buildScore'

/**
 * 効果タイプごとのラベルマップ
 */
const EFFECT_TYPE_LABELS: Record<string, string> = {
  atk_increase: '攻撃力',
  cooldown_reduction: 'クールダウン',
  crit_damage: '会心ダメージ',
  crit_rate: '会心率',
  damage_increase: 'ダメージ',
  damage_taken_increase: '被ダメージ増加',
  dark_damage: '闇属性ダメージ',
  dark_mark_damage: '闇印ダメージ',
  earth_damage: '地属性ダメージ',
  earth_mark_damage: '地印ダメージ',
  fire_damage: '火属性ダメージ',
  fire_mark_damage: '火印ダメージ',
  light_damage: '光属性ダメージ',
  light_mark_damage: '光印ダメージ',
  normal_attack_damage: '通常攻撃ダメージ',
  skill_damage: 'スキルダメージ',
  speed: '速度',
  ultimate_damage: '必殺技ダメージ',
  water_damage: '水属性ダメージ',
  water_mark_damage: '水印ダメージ',
  wind_damage: '風属性ダメージ',
  wind_mark_damage: '風印ダメージ',
}

/**
 * 効果から平均ダメージ増加率を計算（簡易版）
 */
// biome-ignore lint/style/noMagicNumbers: 定数化すると可読性が下がる（パーセント変換、仮定値）
function calculateEffectDamageIncrease(effect: ParsedEffect): number {
  const effectType = effect.type
  const value = effect.value

  // 効果タイプに応じてダメージ増加率を計算
  switch (effectType) {
    case 'damage_increase':
    case 'normal_attack_damage':
    case 'skill_damage':
    case 'ultimate_damage':
    case 'water_mark_damage':
    case 'fire_mark_damage':
    case 'wind_mark_damage':
    case 'earth_mark_damage':
    case 'light_mark_damage':
    case 'dark_mark_damage':
    case 'water_damage':
    case 'fire_damage':
    case 'wind_damage':
    case 'earth_damage':
    case 'light_damage':
    case 'dark_damage':
      // ダメージ系は値をそのまま使用
      return value

    case 'atk_increase':
      // 攻撃力はダメージに直接影響
      return value

    case 'crit_rate':
      // 会心率（簡易計算: 会心率 × 50%会心ダメージと仮定）
      return (value / 100) * 50

    case 'crit_damage':
      // 会心ダメージ（簡易計算: ベース会心率を20%と仮定）
      return (value / 100) * 20

    case 'speed':
      // 速度（簡易計算: 攻撃回数増加として10%の効果と仮定）
      return value * 0.1

    case 'cooldown_reduction':
      // クールダウン（簡易計算: スキル使用回数増加として値の50%と仮定）
      return value * 0.5

    case 'damage_taken_increase':
      // 被ダメージ増加（デバフとして値をそのまま使用）
      return value

    default:
      return 0
  }
}

/**
 * 効果タイプごとに集計
 */
function aggregateEffectsByType(
  talentEffects: Array<{
    effectName: string
    effectType: string
    averageDamageIncrease: number
  }>,
  discEffects: Array<{
    effectName: string
    effectType: string
    averageDamageIncrease: number
  }>,
): Record<string, number> {
  const aggregated: Record<string, number> = {}

  const allEffects = [...talentEffects, ...discEffects]

  for (const effect of allEffects) {
    const type = effect.effectType
    if (!aggregated[type]) {
      aggregated[type] = 0
    }
    aggregated[type] += effect.averageDamageIncrease || 0
  }

  return aggregated
}

/**
 * 総合スコアを計算
 * 計算式: (攻撃力バフ) × (最高属性ダメージ + 最高攻撃種別ダメージ) × (会心率) × (会心ダメージ) × (被ダメ増加)
 * ベース: 攻撃力100%, 会心率5%, 会心ダメージ50%, その他100%
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: スコア計算は多数の効果タイプ処理が必要
// biome-ignore lint/style/noMagicNumbers: 定数化すると可読性が下がる（パーセント変換、デフォルト値）
function calculateTotalScore(aggregated: Record<string, number>): number {
  // 攻撃力バフ（ベース100% + バフ量）
  const atkBuff = 1 + (aggregated.atk_increase || 0) / 100

  // 属性ダメージの最大値
  const elementalDamages = [
    aggregated.water_damage || 0,
    aggregated.fire_damage || 0,
    aggregated.wind_damage || 0,
    aggregated.earth_damage || 0,
    aggregated.light_damage || 0,
    aggregated.dark_damage || 0,
  ]
  const maxElementalDamage = Math.max(...elementalDamages)

  // 攻撃種別ダメージの最大値
  const attackTypeDamages = [
    aggregated.damage_increase || 0,
    aggregated.normal_attack_damage || 0,
    aggregated.skill_damage || 0,
    aggregated.ultimate_damage || 0,
    aggregated.water_mark_damage || 0,
    aggregated.fire_mark_damage || 0,
    aggregated.wind_mark_damage || 0,
    aggregated.earth_mark_damage || 0,
    aggregated.light_mark_damage || 0,
    aggregated.dark_mark_damage || 0,
  ]
  const maxAttackTypeDamage = Math.max(...attackTypeDamages)

  // ダメージバフ（ベース100% + バフ量）
  const damageBuff = 1 + (maxElementalDamage + maxAttackTypeDamage) / 100

  // 会心率（ベース5% + バフ量）
  const critRate = 0.05 + (aggregated.crit_rate || 0) / 100

  // 会心ダメージ（ベース50% + バフ量）
  const critDamage = 0.5 + (aggregated.crit_damage || 0) / 100

  // 被ダメ増加（ベース100% + バフ量）
  const damageTaken = 1 + (aggregated.damage_taken_increase || 0) / 100

  // 総合スコア
  const totalScore = atkBuff * damageBuff * critRate * critDamage * damageTaken

  // パーセント表記に変換（100%を基準とした増加率）
  return (totalScore - 1) * 100
}

/**
 * ビルド効果データからビルドスコアを計算
 */
export function calculateBuildScoreFromEffects(
  effectsData: BuildEffectsData,
): BuildScoreResult {
  // 素質効果の評価
  // biome-ignore lint/style/noMagicNumbers: baseDamageは100固定（計算用）
  const talentEffectEvaluations: EffectEvaluation[] = []

  for (const talent of effectsData.talentEffects) {
    for (const effect of talent.effects) {
      const damageIncrease = calculateEffectDamageIncrease(effect)

      talentEffectEvaluations.push({
        averageDamageIncrease: damageIncrease,
        effectName: `${talent.talentName} - ${effect.name}`,
        effectType: effect.type,
        simulationResult: {
          actualDamage: 100 + damageIncrease,
          baseDamage: 100,
          damageIncreaseRate: damageIncrease,
        },
      })
    }
  }

  // ディスク効果の評価
  const discEffectEvaluations: EffectEvaluation[] = []

  for (const disc of effectsData.discEffects) {
    for (const effect of disc.effects) {
      const damageIncrease = calculateEffectDamageIncrease(effect)

      discEffectEvaluations.push({
        averageDamageIncrease: damageIncrease,
        effectName: `${disc.skillName} - ${effect.name}`,
        effectType: effect.type,
        simulationResult: {
          actualDamage: 100 + damageIncrease,
          baseDamage: 100,
          damageIncreaseRate: damageIncrease,
        },
      })
    }
  }

  // 効果タイプごとに集計
  const aggregated = aggregateEffectsByType(
    talentEffectEvaluations,
    discEffectEvaluations,
  )

  // 総合スコアを計算
  const buildScore = calculateTotalScore(aggregated)

  return {
    // 集計データを追加
    aggregatedEffects: aggregated,
    allDiscEvaluations: discEffectEvaluations,
    allTalentEvaluations: talentEffectEvaluations,
    buildScore,
    calculatedAt: effectsData.fetchedAt,
    characterEvaluations: [],
    discEvaluations: [],
  }
}

/**
 * 効果タイプのラベルを取得
 */
export function getEffectTypeLabel(type: string): string {
  return EFFECT_TYPE_LABELS[type] || type
}

/**
 * 属性ダメージの効果タイプかどうか
 */
export function isElementalDamageType(type: string): boolean {
  return [
    'water_damage',
    'fire_damage',
    'wind_damage',
    'earth_damage',
    'light_damage',
    'dark_damage',
  ].includes(type)
}

/**
 * 攻撃種別ダメージの効果タイプかどうか
 */
export function isAttackTypeDamageType(type: string): boolean {
  return [
    'damage_increase',
    'normal_attack_damage',
    'skill_damage',
    'ultimate_damage',
    'water_mark_damage',
    'fire_mark_damage',
    'wind_mark_damage',
    'earth_mark_damage',
    'light_mark_damage',
    'dark_mark_damage',
  ].includes(type)
}
