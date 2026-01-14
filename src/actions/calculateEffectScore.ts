'use server'

import { unstable_cache } from 'next/cache'
import { type EffectInfo, type EffectType } from 'types/buildScore'

/**
 * 単一効果のダメージ増加率を計算する Server Action
 *
 * キャラクター情報と効果1つのセットでキャッシュし、
 * 素質ごと・ロスレコスキルごとにダメージ増加率を計算する
 */

/** キャッシュ時間（4時間 = 14400秒） */
const CACHE_REVALIDATE_SECONDS = 14400

/** シミュレーション時間（秒） */
const SIMULATION_DURATION = 120

/** 常時発動効果のデフォルト稼働時間（秒） */
const DEFAULT_PERMANENT_UPTIME = 999999

/** 完全稼働率 */
const FULL_UPTIME_COVERAGE = 1.0

/** パーセンテージ変換用の基準値 */
const PERCENTAGE_BASE = 100

/** デフォルトの基本会心ダメージ（%） */
const DEFAULT_BASE_CRIT_DAMAGE = 150

/** デフォルトの基本会心率（%） */
const DEFAULT_BASE_CRIT_RATE = 20

/** 防御力減少のダメージ変換係数 */
const DEF_DECREASE_DAMAGE_FACTOR = 0.5

/**
 * 効果のソース種別
 */
export type EffectSource = 'talent' | 'lossreco_main' | 'lossreco_sub'

/**
 * キャラクターの基本情報（計算に必要な最小限）
 */
export interface CharacterContext {
  /** キャラクター名 */
  name: string
  /** 属性 */
  element: string
  /** 攻撃力（Lv90） */
  atk_lv90: number
  /** HP（Lv90） */
  hp_lv90: number
  /** 基本会心率（%） */
  baseCritRate?: number
  /** 基本会心ダメージ（%） */
  baseCritDamage?: number
}

/**
 * 効果スコア計算の入力
 */
export interface EffectScoreInput {
  /** キャラクターコンテキスト */
  character: CharacterContext
  /** 効果情報 */
  effect: EffectInfo
  /** 効果のソース */
  source: EffectSource
  /** ソース識別子（素質名やスキル名） */
  sourceId: string
}

/**
 * 効果スコア計算の結果
 */
export interface EffectScoreResult {
  /** 平均ダメージ増加率（%） */
  averageDamageIncrease: number
  /** 稼働率（0-1） */
  uptimeCoverage: number
  /** スコア計算の詳細 */
  details: {
    /** ベースの効果量 */
    baseValue: number
    /** 稼働時間（秒） */
    uptimeSeconds: number
    /** スタック考慮後の効果量 */
    stackAdjustedValue: number
  }
}

/**
 * 加算タイプの効果（ダメージ増加系）
 * 将来的な拡張用に定義
 */
const _ADDITIVE_EFFECT_TYPES: EffectType[] = [
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
 * 稼働率を計算する
 */
function calculateUptimeCoverage(effect: EffectInfo): number {
  // 値の検証
  const uptime =
    typeof effect.uptime === 'number' && !Number.isNaN(effect.uptime)
      ? effect.uptime
      : DEFAULT_PERMANENT_UPTIME
  const cooldown =
    typeof effect.cooldown === 'number' && !Number.isNaN(effect.cooldown)
      ? effect.cooldown
      : 0

  // 常時発動の効果
  if (cooldown === 0 && uptime >= SIMULATION_DURATION) {
    return FULL_UPTIME_COVERAGE
  }

  // クールダウンがない場合は効果時間ベース
  if (cooldown === 0) {
    return Math.min(uptime / SIMULATION_DURATION, FULL_UPTIME_COVERAGE)
  }

  // クールダウンがある場合
  // 1サイクル = 効果時間 + クールダウン
  const cycleTime = uptime + cooldown

  // シミュレーション時間内のサイクル数
  const cycles = Math.floor(SIMULATION_DURATION / cycleTime)
  const remainingTime = SIMULATION_DURATION - cycles * cycleTime

  // 総稼働時間
  const totalUptime = cycles * uptime + Math.min(remainingTime, uptime)

  return totalUptime / SIMULATION_DURATION
}

/**
 * 効果量を正規化する（単位に応じて%に変換）
 */
function normalizeEffectValue(effect: EffectInfo): number {
  // 値の検証
  const rawValue =
    typeof effect.value === 'number' && !Number.isNaN(effect.value)
      ? effect.value
      : 0
  let value = rawValue

  if (effect.unit === '回') {
    // 回数ベースの効果は、1回あたり10%として扱う
    value = rawValue * 10
  } else if (effect.unit === '秒') {
    // 時間ベースの効果は、1秒あたり1%として扱う
    value = rawValue
  }

  return value
}

/**
 * 単一効果の平均ダメージ増加率を計算する（内部実装）
 */
function calculateSingleEffectScore(
  character: CharacterContext,
  effect: EffectInfo,
): EffectScoreResult {
  // 稼働率を計算
  const uptimeCoverage = calculateUptimeCoverage(effect)

  // 効果量を正規化
  const baseValue = normalizeEffectValue(effect)

  // スタック数を考慮（デフォルト値1）
  const maxStacks =
    typeof effect.maxStacks === 'number' &&
    !Number.isNaN(effect.maxStacks) &&
    effect.maxStacks > 0
      ? effect.maxStacks
      : 1
  const stackAdjustedValue = baseValue * maxStacks

  // 稼働率を考慮した平均増加率
  let averageDamageIncrease = stackAdjustedValue * uptimeCoverage

  // NaNチェック
  if (Number.isNaN(averageDamageIncrease)) {
    console.warn(
      `[calculateSingleEffectScore] NaN detected for effect: ${effect.name}, baseValue: ${baseValue}, maxStacks: ${maxStacks}, uptimeCoverage: ${uptimeCoverage}`,
    )
    averageDamageIncrease = 0
  }

  // 乗算タイプの効果は追加の計算が必要
  if (MULTIPLICATIVE_EFFECT_TYPES.includes(effect.type)) {
    // 乗算タイプのみを処理（他のタイプはここには来ない）
    const multiplicativeType = effect.type as
      | 'atk_increase'
      | 'crit_rate'
      | 'crit_damage'
      | 'speed_increase'
      | 'cooldown_reduction'

    switch (multiplicativeType) {
      case 'atk_increase':
        // 攻撃力増加はダメージに直接影響
        // 既にダメージ増加率として扱う
        break
      case 'crit_rate': {
        // 会心率は確率的なダメージ増加
        // 基本会心ダメージを150%と仮定
        const baseCritDamage =
          character.baseCritDamage ?? DEFAULT_BASE_CRIT_DAMAGE
        averageDamageIncrease =
          (averageDamageIncrease / PERCENTAGE_BASE) *
          (baseCritDamage / PERCENTAGE_BASE) *
          PERCENTAGE_BASE
        break
      }
      case 'crit_damage': {
        // 会心ダメージ増加は会心率に依存
        const baseCritRate = character.baseCritRate ?? DEFAULT_BASE_CRIT_RATE
        averageDamageIncrease =
          (baseCritRate / PERCENTAGE_BASE) *
          (averageDamageIncrease / PERCENTAGE_BASE) *
          PERCENTAGE_BASE
        break
      }
      case 'speed_increase':
      case 'cooldown_reduction':
        // これらは実行回数に影響するが、簡易的に同等として扱う
        break
    }
  }

  // 防御力減少の効果計算（デバフ）
  if (effect.type === 'def_decrease') {
    // 防御力減少は実効的なダメージ増加に変換
    // 基本防御800、防御によるダメージ軽減率 = 防御 / (防御 + 1000)
    // 簡易計算: 防御10%減少 ≒ ダメージ5%増加程度
    averageDamageIncrease = averageDamageIncrease * DEF_DECREASE_DAMAGE_FACTOR
  }

  return {
    averageDamageIncrease,
    details: {
      baseValue,
      stackAdjustedValue,
      uptimeSeconds: uptimeCoverage * SIMULATION_DURATION,
    },
    uptimeCoverage,
  }
}

/**
 * 単一効果のダメージ増加率を計算する（キャッシュ付き）
 *
 * @param input - 効果スコア計算の入力
 * @returns 効果スコア計算の結果
 */
export async function calculateEffectScore(
  input: EffectScoreInput,
): Promise<EffectScoreResult> {
  const { character, effect, source, sourceId } = input

  // キャッシュキーを生成
  // キャラクター名、効果の全属性、ソースをキーにする
  const cacheKey = [
    'effect-score',
    character.name,
    effect.name,
    effect.type,
    effect.value,
    effect.uptime,
    effect.cooldown,
    effect.maxStacks,
    effect.level ?? 1,
    source,
    sourceId,
  ].join(':')

  // unstable_cacheでキャッシュ付き関数を作成
  const cachedCalculate = unstable_cache(
    async (charName: string, charElement: string, eff: EffectInfo) =>
      calculateSingleEffectScore(
        { ...character, element: charElement, name: charName },
        eff,
      ),
    [cacheKey],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: ['effect-score', `effect-score:${character.name}`],
    },
  )

  return cachedCalculate(character.name, character.element, effect)
}

/**
 * 複数の効果のスコアを一括計算する
 *
 * @param inputs - 効果スコア計算の入力配列
 * @returns 効果スコア計算の結果配列
 */
export async function calculateEffectScores(
  inputs: EffectScoreInput[],
): Promise<EffectScoreResult[]> {
  return Promise.all(inputs.map(calculateEffectScore))
}

/**
 * キャラクターと素質の組み合わせでスコアを計算する
 */
export async function calculateTalentEffectScore(
  character: CharacterContext,
  talentName: string,
  effect: EffectInfo,
): Promise<EffectScoreResult> {
  return calculateEffectScore({
    character,
    effect,
    source: 'talent',
    sourceId: talentName,
  })
}

/**
 * キャラクターとロスレコスキルの組み合わせでスコアを計算する
 */
export async function calculateLossRecoSkillScore(
  character: CharacterContext,
  skillName: string,
  effect: EffectInfo,
  isMainSkill: boolean,
): Promise<EffectScoreResult> {
  return calculateEffectScore({
    character,
    effect,
    source: isMainSkill ? 'lossreco_main' : 'lossreco_sub',
    sourceId: skillName,
  })
}
