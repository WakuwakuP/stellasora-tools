'use client'

import { calculateBuildPerformance } from 'actions/calculateBuildScore'
import { getCharacterIdByName } from 'actions/getAllCharacters'
import { type SelectedTalent } from 'components/build'
import { useEffect, useState } from 'react'

/**
 * ビルドスコアを計算するフック
 *
 * キャラクター、素質、ロスレコの選択状態から
 * LLMベースのスコア計算を実行します。
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

    // LLMベースのスコア計算を実行
    const calculateRealScore = async () => {
      setIsCalculating(true)

      try {
        // キャラクター名からIDを取得
        const characterIds = await Promise.all(
          characters.map((c) => getCharacterIdByName(c.name!)),
        )

        // IDが取得できなかった場合はエラー
        if (characterIds.some((id) => id === null)) {
          console.error('Failed to fetch character IDs')
          setScore(undefined)
          setIsCalculating(false)
          return
        }

        // 正確に3つのキャラクターIDが必要
        if (characterIds.length !== 3) {
          setScore(undefined)
          setIsCalculating(false)
          return
        }

        // ロスレコIDを結合
        const allDiscIds = [...mainLossRecordIds, ...subLossRecordIds]

        // 正確に3つのロスレコが必要
        if (allDiscIds.length < 3) {
          setScore(undefined)
          setIsCalculating(false)
          return
        }

        // ビルドスコアを計算
        const result = await calculateBuildPerformance({
          characterIds: characterIds as [number, number, number],
          discIds: allDiscIds.slice(0, 3) as [number, number, number],
        })

        setScore(result.totalScore)
      } catch (error) {
        console.error('Failed to calculate build score:', error)
        setScore(undefined)
      } finally {
        setIsCalculating(false)
      }
    }

    calculateRealScore()
  }, [characters, selectedTalents, mainLossRecordIds, subLossRecordIds])

  return { isCalculating, score }
}
