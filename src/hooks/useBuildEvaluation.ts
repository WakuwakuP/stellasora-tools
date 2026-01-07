import { type SelectedTalent } from 'components/build'
import { type CalculationDetails } from 'components/build/BuildEvaluationDisplay'
import { useMemo } from 'react'
import { type BuildEvaluationMetrics } from 'types/damage-calculation'
import { type QualitiesData, type QualityInfo } from 'types/quality'

interface BuildEvaluationInput {
  mainCharacterName: string | null
  support1CharacterName: string | null
  support2CharacterName: string | null
  selectedTalents: SelectedTalent[]
  mainLossRecordIds: number[]
  subLossRecordIds: number[]
  qualitiesData?: QualitiesData
}

export interface BuildEvaluationResult {
  metrics: BuildEvaluationMetrics | null
  details: CalculationDetails | null
}

// バフ抽出用の正規表現パターン（パフォーマンス最適化のためトップレベル定義）
const REGEX_ATK_BUFF = /(?:攻撃力|ATK)[+＋](\d+(?:\.\d+)?)%/i
const REGEX_SKILL_DMG = /(?:スキル|Skill)(?:ダメージ|DMG)[+＋](\d+(?:\.\d+)?)%/i
const REGEX_NORMAL_ATK_DMG =
  /(?:通常攻撃|Normal Attack)(?:ダメージ|DMG)[+＋](\d+(?:\.\d+)?)%/i
const REGEX_ULTIMATE_DMG =
  /(?:必殺技|Ultimate|大技)(?:ダメージ|DMG)[+＋](\d+(?:\.\d+)?)%/i
const REGEX_ELEMENTAL_DMG =
  /(?:属性|Elemental|元素)(?:ダメージ|DMG)[+＋](\d+(?:\.\d+)?)%/i
const REGEX_TOTAL_DMG =
  /(?:全|すべての|All)(?:ダメージ|DMG)[+＋](\d+(?:\.\d+)?)%/i
const REGEX_CRIT_RATE =
  /(?:会心率|Crit Rate|クリティカル率)[+＋](\d+(?:\.\d+)?)%/i
const REGEX_CRIT_DMG =
  /(?:会心ダメージ|Crit DMG|クリティカルダメージ)[+＋](\d+(?:\.\d+)?)%/i

/**
 * 素質の説明文からバフ情報を抽出する
 */
function extractBuffsFromQuality(
  quality: QualityInfo,
  level: number,
): Array<{
  type: string
  amount: number
  duration?: number
  cooldown?: number
}> {
  const buffs: Array<{
    type: string
    amount: number
    duration?: number
    cooldown?: number
  }> = []

  const description = quality.description || ''
  const params = quality.params || []

  // パラメータを置換
  let processedDesc = description
  params.forEach((param, index) => {
    processedDesc = processedDesc.replace(`&Param${index + 1}&`, param)
  })

  // 攻撃力バフを抽出（例: "攻撃力+15%"、"ATK+20%"）
  const atkBuffMatch = processedDesc.match(REGEX_ATK_BUFF)
  if (atkBuffMatch) {
    buffs.push({
      amount: Number.parseFloat(atkBuffMatch[1]),
      type: 'attack',
    })
  }

  // スキルダメージバフを抽出
  const skillDmgMatch = processedDesc.match(REGEX_SKILL_DMG)
  if (skillDmgMatch) {
    buffs.push({
      amount: Number.parseFloat(skillDmgMatch[1]),
      type: 'skillDmg',
    })
  }

  // 通常攻撃ダメージバフを抽出
  const normalAtkMatch = processedDesc.match(REGEX_NORMAL_ATK_DMG)
  if (normalAtkMatch) {
    buffs.push({
      amount: Number.parseFloat(normalAtkMatch[1]),
      type: 'normalAttackDmg',
    })
  }

  // 必殺技ダメージバフを抽出
  const ultimateDmgMatch = processedDesc.match(REGEX_ULTIMATE_DMG)
  if (ultimateDmgMatch) {
    buffs.push({
      amount: Number.parseFloat(ultimateDmgMatch[1]),
      type: 'ultimateDmg',
    })
  }

  // 属性ダメージバフを抽出
  const elementalDmgMatch = processedDesc.match(REGEX_ELEMENTAL_DMG)
  if (elementalDmgMatch) {
    buffs.push({
      amount: Number.parseFloat(elementalDmgMatch[1]),
      type: 'elementalDmg',
    })
  }

  // 全ダメージバフを抽出
  const totalDmgMatch = processedDesc.match(REGEX_TOTAL_DMG)
  if (totalDmgMatch) {
    buffs.push({
      amount: Number.parseFloat(totalDmgMatch[1]),
      type: 'totalDmg',
    })
  }

  // 会心率バフを抽出
  const critRateMatch = processedDesc.match(REGEX_CRIT_RATE)
  if (critRateMatch) {
    buffs.push({
      amount: Number.parseFloat(critRateMatch[1]),
      type: 'critRate',
    })
  }

  // 会心ダメージバフを抽出
  const critDmgMatch = processedDesc.match(REGEX_CRIT_DMG)
  if (critDmgMatch) {
    buffs.push({
      amount: Number.parseFloat(critDmgMatch[1]),
      type: 'critDmg',
    })
  }

  // レベルによるスケーリングを適用（コア素質以外）
  if (!quality.isCore && level > 1) {
    buffs.forEach((buff) => {
      buff.amount *= level
    })
  }

  return buffs
}

/**
 * ビルド評価メトリクスを計算するカスタムフック
 *
 * 現在のビルド構成から評価スコアを算出します。
 * キャラクターが選択されていない場合はnullを返します。
 */
export function useBuildEvaluation(
  input: BuildEvaluationInput,
): BuildEvaluationResult {
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex calculation logic required for buff aggregation
  return useMemo(() => {
    const {
      mainCharacterName,
      support1CharacterName,
      support2CharacterName,
      selectedTalents,
      mainLossRecordIds,
      subLossRecordIds,
      qualitiesData,
    } = input

    // キャラクターが全て選択されていない場合はnull
    if (
      !(mainCharacterName && support1CharacterName && support2CharacterName)
    ) {
      return { details: null, metrics: null }
    }

    // 選択された素質からバフを抽出して集計
    const aggregatedBuffs: Record<string, { amount: number; count: number }> =
      {}

    for (const talent of selectedTalents) {
      if (!qualitiesData) continue

      const characterQualities = qualitiesData[talent.characterName]
      if (!characterQualities) continue

      const qualities =
        talent.role === 'main'
          ? characterQualities.main
          : characterQualities.sub
      const quality = qualities[talent.index]
      if (!quality) continue

      const buffs = extractBuffsFromQuality(quality, talent.level)
      for (const buff of buffs) {
        if (!aggregatedBuffs[buff.type]) {
          aggregatedBuffs[buff.type] = { amount: 0, count: 0 }
        }
        aggregatedBuffs[buff.type].amount += buff.amount
        aggregatedBuffs[buff.type].count += 1
      }
    }

    // バフ情報を配列に変換
    const buffsArray = Object.entries(aggregatedBuffs).map(
      ([type, { amount }]) => ({
        amount,
        // デフォルトの継続時間とクールダウン（実際のデータがない場合の仮値）
        cooldown: 15,
        duration: 10,
        type: type,
        uptime: 10 / (10 + 15),
      }),
    )

    // 選択された素質の合計レベルを計算
    const totalTalentLevel = selectedTalents.reduce(
      (sum, talent) => sum + talent.level,
      0,
    )

    // ロスレコの数
    const mainLossRecordCount = mainLossRecordIds.length
    const subLossRecordCount = subLossRecordIds.length

    // 実際の集計値を使ってステータスを計算
    const attackBuffTotal = aggregatedBuffs.attack?.amount || 0
    const critRateBuffTotal = aggregatedBuffs.critRate?.amount || 0
    const critDmgBuffTotal = aggregatedBuffs.critDmg?.amount || 0
    const skillDmgTotal = aggregatedBuffs.skillDmg?.amount || 0
    const normalAtkDmgTotal = aggregatedBuffs.normalAttackDmg?.amount || 0
    const ultimateDmgTotal = aggregatedBuffs.ultimateDmg?.amount || 0
    const elementalDmgTotal = aggregatedBuffs.elementalDmg?.amount || 0
    const totalDmgTotal = aggregatedBuffs.totalDmg?.amount || 0

    // 基本ステータス（仮値）+ バフ効果
    const baseAtk = 2000
    const atk =
      baseAtk * (1 + attackBuffTotal / 100) + mainLossRecordCount * 200
    const baselineAtk = 3000

    const baseCritRate = 0.3
    const critRate = Math.min(
      baseCritRate + critRateBuffTotal / 100 + mainLossRecordCount * 0.02,
      1.0,
    )

    const baseCritDmg = 0.5
    const critDmg =
      baseCritDmg + critDmgBuffTotal / 100 + totalTalentLevel * 0.005

    // ダメージボーナス合計
    const damageBonusTotal =
      skillDmgTotal +
      normalAtkDmgTotal +
      ultimateDmgTotal +
      elementalDmgTotal +
      totalDmgTotal

    // 防御貫通値（ロスレコからの仮値）
    const defPenValue = 10 + mainLossRecordCount * 5

    // DPS計算（簡易）
    const baseDps = 3000
    const dps =
      baseDps *
      (1 + attackBuffTotal / 100) *
      (1 + damageBonusTotal / 100) *
      (1 + critRate * critDmg)
    const baselineDps = 5000

    // スコア計算用の基準値
    const baseScore = 30

    // 素質レベルによる加算（最大40点）
    const talentScore = Math.min((totalTalentLevel / 100) * 40, 40)

    // ロスレコによる加算（最大30点）
    const lossRecordScore =
      ((mainLossRecordCount + subLossRecordCount) / 6) * 30

    // 各スコアを計算（バフを考慮）
    const attackScore =
      baseScore +
      talentScore * 0.8 +
      lossRecordScore * 0.7 +
      attackBuffTotal * 0.3
    const critEfficiencyScore =
      baseScore +
      talentScore * 0.7 +
      lossRecordScore * 0.8 +
      (critRateBuffTotal + critDmgBuffTotal) * 0.2
    const elementalDamageScore =
      baseScore +
      talentScore * 0.9 +
      lossRecordScore * 0.9 +
      (elementalDmgTotal + totalDmgTotal) * 0.3
    const dpsScore =
      baseScore +
      talentScore * 0.85 +
      lossRecordScore * 0.85 +
      damageBonusTotal * 0.2
    const buffUptimeScore =
      baseScore +
      talentScore * 0.6 +
      lossRecordScore * 0.7 +
      damageBonusTotal * 0.15

    // 総合スコア（重み付き平均）
    const totalScore =
      attackScore * 0.2 +
      critEfficiencyScore * 0.25 +
      elementalDamageScore * 0.15 +
      dpsScore * 0.25 +
      buffUptimeScore * 0.15

    const details: CalculationDetails = {
      atk,
      baselineAtk,
      baselineDps,
      buffs: buffsArray,
      critDmg,
      critRate,
      damageBonusTotal,
      defPenValue,
      dps,
    }

    return {
      details,
      metrics: {
        attackScore: Math.min(attackScore, 100),
        breakdown: {
          attack: attackScore * 0.2,
          buffUptime: buffUptimeScore * 0.15,
          critEfficiency: critEfficiencyScore * 0.25,
          dps: dpsScore * 0.25,
          elementalDamage: elementalDamageScore * 0.15,
        },
        buffUptimeScore: Math.min(buffUptimeScore, 100),
        critEfficiencyScore: Math.min(critEfficiencyScore, 100),
        dpsScore: Math.min(dpsScore, 100),
        elementalDamageScore: Math.min(elementalDamageScore, 100),
        totalScore: Math.min(totalScore, 100),
      },
    }
  }, [input])
}
