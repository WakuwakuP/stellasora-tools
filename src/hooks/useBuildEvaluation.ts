import { type SelectedTalent } from 'components/build'
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

/**
 * ビルド評価メトリクスを計算するカスタムフック
 *
 * 現在のビルド構成から評価スコアを算出します。
 * キャラクターが選択されていない場合はnullを返します。
 */
export function useBuildEvaluation(
  input: BuildEvaluationInput,
): BuildEvaluationMetrics | null {
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
      return null
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
    const defenseScore = baseScore + talentScore * 0.5 + lossRecordScore * 0.5
    const critEfficiencyScore =
      baseScore + talentScore * 0.7 + lossRecordScore * 0.8
    const elementalDamageScore =
      baseScore + talentScore * 0.9 + lossRecordScore * 0.9
    const dpsScore = baseScore + talentScore * 0.85 + lossRecordScore * 0.85

    // 総合スコア（重み付き平均）
    const totalScore =
      attackScore * 0.2 +
      defenseScore * 0.1 +
      critEfficiencyScore * 0.25 +
      elementalDamageScore * 0.2 +
      dpsScore * 0.25

    return {
      attackScore,
      breakdown: {
        attack: attackScore * 0.2,
        critEfficiency: critEfficiencyScore * 0.25,
        defense: defenseScore * 0.1,
        dps: dpsScore * 0.25,
        elementalDamage: elementalDamageScore * 0.2,
      },
      critEfficiencyScore,
      defenseScore,
      dpsScore,
      elementalDamageScore,
      totalScore,
    }
  }, [input])
}
