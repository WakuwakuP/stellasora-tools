import {
  type BuildScore,
  type CombatSimulationResult,
  type EffectDamageIncrease,
  type EffectInfo,
  type EffectType,
} from 'types/buildScore'

/**
 * ビルドスコア計算モジュール
 *
 * 各効果の平均ダメージ増加率を計算し、総合スコアを算出する
 */

/** パーセンテージ変換用の基準値 */
const PERCENTAGE_BASE = 100

/** ベースダメージ（%） */
const BASE_DAMAGE = 100

/** デフォルト会心率（%） */
const DEFAULT_CRIT_RATE = 0.2

/** 会心率によるダメージ増加係数 */
const CRIT_RATE_DAMAGE_FACTOR = 0.5

/**
 * 加算タイプの効果（同一タイプは加算）
 */
const ADDITIVE_EFFECT_TYPES: EffectType[] = [
  'damage_increase',
  'damage_normal_attack',
  'damage_skill',
  'damage_ultimate',
  'damage_mark',
  'damage_elemental',
  'damage_additional',
  'damage_taken_increase',
  'def_decrease',
]

/**
 * 乗算タイプの効果
 */
const MULTIPLICATIVE_EFFECT_TYPES: EffectType[] = [
  'atk_increase',
  'crit_rate',
  'crit_damage',
  'speed_increase',
  'cooldown_reduction',
]

/**
 * ビルドスコアを計算する
 *
 * @param effects - 効果情報のリスト
 * @param simulation - 戦闘シミュレーション結果
 * @returns ビルドスコア
 */
export function calculateBuildScore(
  effects: EffectInfo[],
  simulation: CombatSimulationResult,
): BuildScore {
  const effectContributions: EffectDamageIncrease[] = []

  // 各効果の平均ダメージ増加率を計算
  for (const effect of effects) {
    const uptimeCoverage = simulation.effectUptime[effect.name] ?? 0
    const averageIncrease = calculateAverageIncrease(
      effect,
      uptimeCoverage,
      effects,
    )

    effectContributions.push({
      averageIncrease,
      name: effect.name,
      type: effect.type,
      uptimeCoverage,
    })
  }

  // 総合スコアを計算
  const totalScore = calculateTotalScore(effectContributions)

  return {
    effectContributions,
    simulation,
    totalScore,
  }
}

/**
 * 効果の平均ダメージ増加率を計算する
 */
function calculateAverageIncrease(
  effect: EffectInfo,
  uptimeCoverage: number,
  _allEffects: EffectInfo[],
): number {
  // 効果量を取得
  let effectValue = effect.value

  // 単位が%でない場合は適切に変換
  const DAMAGE_PER_COUNT = 10
  if (effect.unit === '回') {
    // 回数ベースの効果は、実行回数に応じて変換
    // 簡易的に1回あたり10%のダメージ増加として扱う
    effectValue = effect.value * DAMAGE_PER_COUNT
  } else if (effect.unit === '秒') {
    // 時間ベースの効果は、持続時間に応じて変換
    // 簡易的に1秒あたり1%のダメージ増加として扱う
    effectValue = effect.value
  }

  // 稼働率を考慮した平均増加率
  const averageIncrease = effectValue * uptimeCoverage

  // スタック数を考慮
  const stackMultiplier = effect.maxStacks
  const adjustedIncrease = averageIncrease * stackMultiplier

  return adjustedIncrease
}

/**
 * 総合スコアを計算する
 *
 * ルール:
 * - 同一タイプは加算
 * - ダメージ増加系は加算
 * - それ以外は乗算
 */
function calculateTotalScore(contributions: EffectDamageIncrease[]): number {
  // タイプごとにグループ化
  const additiveEffects = contributions.filter((c) =>
    ADDITIVE_EFFECT_TYPES.includes(c.type),
  )
  const multiplicativeEffects = contributions.filter((c) =>
    MULTIPLICATIVE_EFFECT_TYPES.includes(c.type),
  )

  // 加算効果の合計を計算
  const additiveTotal = additiveEffects.reduce(
    (sum, effect) => sum + effect.averageIncrease,
    0,
  )

  // 乗算効果を適用
  let totalScore = BASE_DAMAGE + additiveTotal // ベースダメージ100%に加算効果を加える

  for (const effect of multiplicativeEffects) {
    // 効果の種類に応じて乗算
    switch (effect.type) {
      case 'atk_increase':
        // 攻撃力増加はダメージに直接影響
        totalScore *= 1 + effect.averageIncrease / PERCENTAGE_BASE
        break
      case 'crit_rate':
        // 会心率は確率的なダメージ増加
        // 会心ダメージを150%と仮定（会心ダメージ増加がない場合）
        totalScore *=
          1 +
          (effect.averageIncrease / PERCENTAGE_BASE) * CRIT_RATE_DAMAGE_FACTOR
        break
      case 'crit_damage': {
        // 会心ダメージ増加
        // 会心率を考慮する必要があるが、簡易的に平均的な増加として扱う
        const critRateEffect = multiplicativeEffects.find(
          (e) => e.type === 'crit_rate',
        )
        const assumedCritRate = critRateEffect
          ? critRateEffect.averageIncrease / PERCENTAGE_BASE
          : DEFAULT_CRIT_RATE
        totalScore *=
          1 + assumedCritRate * (effect.averageIncrease / PERCENTAGE_BASE)
        break
      }
      case 'speed_increase':
        // 速度増加は実行回数に影響
        // 簡易的に速度増加%がそのまま実行回数増加に繋がると仮定
        totalScore *= 1 + effect.averageIncrease / PERCENTAGE_BASE
        break
      case 'cooldown_reduction':
        // クールダウン減少は実行回数に影響
        totalScore *= 1 + effect.averageIncrease / PERCENTAGE_BASE
        break
      default:
        break
    }
  }

  // ベースダメージを引いてスコアとして返す
  return totalScore - BASE_DAMAGE
}

/**
 * 効果をタイプ別に集計する
 */
export function aggregateEffectsByType(
  effects: EffectDamageIncrease[],
): Record<EffectType, number> {
  const aggregated: Record<string, number> = {}

  for (const effect of effects) {
    if (!aggregated[effect.type]) {
      aggregated[effect.type] = 0
    }
    aggregated[effect.type] += effect.averageIncrease
  }

  return aggregated as Record<EffectType, number>
}

/**
 * ビルドスコアを人間が読みやすい形式にフォーマットする
 */
export function formatBuildScore(score: BuildScore): string {
  const lines: string[] = []

  lines.push(`総合スコア: ${score.totalScore.toFixed(2)}%`)
  lines.push('')
  lines.push('効果の貢献度:')

  // スコアの高い順にソート
  const sortedContributions = [...score.effectContributions].sort(
    (a, b) => b.averageIncrease - a.averageIncrease,
  )

  for (const contribution of sortedContributions) {
    lines.push(
      `  ${contribution.name}: +${contribution.averageIncrease.toFixed(2)}% (稼働率: ${(contribution.uptimeCoverage * PERCENTAGE_BASE).toFixed(1)}%)`,
    )
  }

  lines.push('')
  lines.push(`シミュレーション時間: ${score.simulation.duration}秒`)
  lines.push(`アクション数: ${score.simulation.actions.length}`)

  return lines.join('\n')
}
