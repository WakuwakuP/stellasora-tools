'use client'

import { type SelectedTalent } from 'components/build'
import { useEffect, useState } from 'react'

/** コア素質のベーススコア（%） */
const CORE_TALENT_SCORE = 5

/** 通常素質のレベルあたりのスコア（%） */
const TALENT_SCORE_PER_LEVEL = 5

/** ロスレコあたりのスコア（%） */
const LOSS_RECORD_SCORE = 15

/** スコア計算の遅延時間（ミリ秒） */
const CALCULATION_DELAY_MS = 300

/**
 * ビルドスコアを計算するフック（簡易版）
 *
 * 現在は素質数に基づく簡易計算を行います。
 * 将来的にはServer Actionを呼び出して実際のLLM計算を行う予定です。
 */
export function useBuildScore(
  characters: Array<{ name: string | null }>,
  selectedTalents: SelectedTalent[],
  mainLossRecordIds: number[],
  subLossRecordIds: number[],
) {
  const [score, setScore] = useState<number | undefined>(undefined)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    // 基本的な検証：キャラクターが3人選択されているか
    const hasAllCharacters = characters.every((c) => c.name !== null)

    // ロスレコが最低1つ選択されているか
    const hasLossRecords =
      mainLossRecordIds.length > 0 || subLossRecordIds.length > 0

    // 素質が最低1つ選択されているか
    const hasTalents = selectedTalents.length > 0

    if (!(hasAllCharacters && hasLossRecords && hasTalents)) {
      setScore(undefined)
      return
    }

    // 簡易的なスコア計算（デモ用）
    // 実際の実装では calculateBuildPerformance を呼び出します
    const calculateDemoScore = () => {
      setIsCalculating(true)

      // 非同期処理をシミュレート
      setTimeout(() => {
        // 簡易計算：素質1つあたり約10%、ロスレコ1つあたり約15%のダメージ増加と仮定
        const talentScore = selectedTalents.reduce((sum, talent) => {
          // コア素質（レベル1固定）は5%
          // 通常素質はレベルに応じて5-30%
          const baseScore =
            talent.level === 1
              ? CORE_TALENT_SCORE
              : talent.level * TALENT_SCORE_PER_LEVEL
          return sum + baseScore
        }, 0)

        const lossRecordScore =
          (mainLossRecordIds.length + subLossRecordIds.length) *
          LOSS_RECORD_SCORE

        const totalScore = talentScore + lossRecordScore

        setScore(totalScore)
        setIsCalculating(false)
      }, CALCULATION_DELAY_MS) // 短い遅延でリアルな感じを出す
    }

    calculateDemoScore()
  }, [characters, selectedTalents, mainLossRecordIds, subLossRecordIds])

  return { isCalculating, score }
}
