import { type SelectedTalent } from 'components/build'
import { type CalculationDetails } from 'components/build/BuildEvaluationDisplay'
import { useMemo } from 'react'
import { type BuildEvaluationMetrics } from 'types/damage-calculation'

interface BuildEvaluationInput {
  mainCharacterName: string | null
  support1CharacterName: string | null
  support2CharacterName: string | null
  selectedTalents: SelectedTalent[]
  mainLossRecordIds: number[]
  subLossRecordIds: number[]
}

export interface BuildEvaluationResult {
  metrics: BuildEvaluationMetrics | null
  details: CalculationDetails | null
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
  return useMemo(() => {
    const {
      mainCharacterName,
      support1CharacterName,
      support2CharacterName,
      selectedTalents,
      mainLossRecordIds,
      subLossRecordIds,
    } = input

    // キャラクターが全て選択されていない場合はnull
    if (
      !(mainCharacterName && support1CharacterName && support2CharacterName)
    ) {
      return { details: null, metrics: null }
    }

    // 簡易的な評価計算
    // TODO: 実際のステータス値を取得して正確な計算を行う

    // 選択された素質の合計レベルを計算
    const totalTalentLevel = selectedTalents.reduce(
      (sum, talent) => sum + talent.level,
      0,
    )

    // 素質の数
    const _talentCount = selectedTalents.length

    // ロスレコの数
    const mainLossRecordCount = mainLossRecordIds.length
    const subLossRecordCount = subLossRecordIds.length

    // 簡易スコア計算（仮実装）
    // 素質レベルとロスレコ数に基づいてスコアを算出
    const baseScore = 30 // 基本スコア

    // 素質レベルによる加算（最大40点）
    const talentScore = Math.min((totalTalentLevel / 100) * 40, 40)

    // ロスレコによる加算（最大30点）
    const lossRecordScore =
      ((mainLossRecordCount + subLossRecordCount) / 6) * 30

    // 各スコアを計算
    const attackScore = baseScore + talentScore * 0.8 + lossRecordScore * 0.7
    const critEfficiencyScore =
      baseScore + talentScore * 0.7 + lossRecordScore * 0.8
    const elementalDamageScore =
      baseScore + talentScore * 0.9 + lossRecordScore * 0.9
    const dpsScore = baseScore + talentScore * 0.85 + lossRecordScore * 0.85
    const buffUptimeScore =
      baseScore + talentScore * 0.6 + lossRecordScore * 0.7

    // 総合スコア（重み付き平均）
    const totalScore =
      attackScore * 0.2 +
      critEfficiencyScore * 0.25 +
      elementalDamageScore * 0.15 +
      dpsScore * 0.25 +
      buffUptimeScore * 0.15

    // 仮の計算詳細データ（実装例）
    const atk = 2500 + totalTalentLevel * 15 + mainLossRecordCount * 200
    const baselineAtk = 3000
    const critRate = 0.45 + lossRecordScore * 0.005
    const critDmg = 0.8 + talentScore * 0.01
    const dps = 4000 + totalTalentLevel * 30 + lossRecordScore * 100
    const baselineDps = 5000
    const damageBonusTotal = 40 + talentScore * 0.8
    const defPenValue = 15 + lossRecordScore * 0.3

    // サンプルバフデータ
    const buffs = [
      {
        amount: 30,
        cooldown: 10,
        duration: 8,
        type: '攻撃力バフ',
        uptime: 8 / (8 + 10),
      },
      {
        amount: 25,
        cooldown: 15,
        duration: 12,
        type: 'スキルダメージバフ',
        uptime: 12 / (12 + 15),
      },
    ]

    const details: CalculationDetails = {
      atk,
      baselineAtk,
      baselineDps,
      buffs,
      critDmg,
      critRate,
      damageBonusTotal,
      defPenValue,
      dps,
    }

    return {
      details,
      metrics: {
        attackScore,
        breakdown: {
          attack: attackScore * 0.2,
          buffUptime: buffUptimeScore * 0.15,
          critEfficiency: critEfficiencyScore * 0.25,
          dps: dpsScore * 0.25,
          elementalDamage: elementalDamageScore * 0.15,
        },
        buffUptimeScore,
        critEfficiencyScore,
        dpsScore,
        elementalDamageScore,
        totalScore,
      },
    }
  }, [input])
}
