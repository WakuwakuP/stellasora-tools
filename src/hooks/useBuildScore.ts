'use client'

import { calculateBuildPerformance } from 'actions/calculateBuildScore'
import { getCharacterIdByName } from 'actions/getAllCharacters'
import { type SelectedTalent } from 'components/build'
import { useEffect, useState } from 'react'
import { type EffectDamageIncrease } from 'types/buildScore'

/** ビルドに必要なキャラクター数 */
const REQUIRED_CHARACTER_COUNT = 3

/** ビルドに必要なロスレコ数 */
const REQUIRED_LOSS_RECORD_COUNT = 3

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
  const [effectContributions, setEffectContributions] = useState<
    EffectDamageIncrease[]
  >([])
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
      setEffectContributions([])
      return
    }

    console.log('Calculating build score...')

    // LLMベースのスコア計算を実行
    const calculateRealScore = async () => {
      setIsCalculating(true)

      try {
        // キャラクター名からIDを取得
        const characterIds = await Promise.all(
          characters.map((c) => {
            if (c.name === null) {
              return Promise.resolve(null)
            }
            return getCharacterIdByName(c.name)
          }),
        )

        // IDが取得できなかった場合はエラー
        if (characterIds.some((id) => id === null)) {
          console.error('Failed to fetch character IDs')
          setScore(undefined)
          setEffectContributions([])
          setIsCalculating(false)
          return
        }

        // 正確に3つのキャラクターIDが必要
        if (characterIds.length !== REQUIRED_CHARACTER_COUNT) {
          setScore(undefined)
          setEffectContributions([])
          setIsCalculating(false)
          return
        }

        // ロスレコIDを結合
        const allDiscIds = [...mainLossRecordIds, ...subLossRecordIds]

        // 正確に3つのロスレコが必要
        if (allDiscIds.length < REQUIRED_LOSS_RECORD_COUNT) {
          setScore(undefined)
          setEffectContributions([])
          setIsCalculating(false)
          return
        }

        // ビルドスコアを計算
        const result = await calculateBuildPerformance({
          characterIds: characterIds as [number, number, number],
          discIds: allDiscIds.slice(0, REQUIRED_LOSS_RECORD_COUNT) as [
            number,
            number,
            number,
          ],
        })

        setScore(result.totalScore)
        setEffectContributions(result.effectContributions)
      } catch (error) {
        console.error('Failed to calculate build score:', error)
        setScore(undefined)
        setEffectContributions([])
      } finally {
        setIsCalculating(false)
      }
    }

    calculateRealScore()
  }, [characters, selectedTalents, mainLossRecordIds, subLossRecordIds])

  return { effectContributions, isCalculating, score }
}
