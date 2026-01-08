'use server'

import { unstable_cache } from 'next/cache'
import { type TalentLevelScore } from 'types/buildScore'

// TODO: This Server Action needs refactoring to use extractTalentEffects
// Currently not in use - useTalentScores hook uses extractTalentEffects directly

/** 素質レベルの定数 */
const TALENT_LEVELS = [1, 2, 3, 4, 5, 6] as const

/** 素質スコア計算のオプション */
interface TalentScoreOptions {
  characterId: number
  characterName: string
  element: string
  talentName: string
  talentDescription: string
  talentIndex: number
}

/**
 * 素質の特定レベルにおける平均ダメージ増加率を計算する
 *
 * @param options - 素質情報のオプション
 * @param level - レベル（1-6）
 * @returns 平均ダメージ増加率
 */
export async function calculateTalentLevelScore(
  options: TalentScoreOptions,
  level: number,
): Promise<TalentLevelScore> {
  const {
    characterId,
    // characterName, // TODO: Will be used when refactored to use extractTalentEffects
    // element, // TODO: Will be used when refactored to use extractTalentEffects
    talentName,
    // talentDescription, // TODO: Will be used when refactored to use extractTalentEffects
    talentIndex,
  } = options

  // キャッシュキーを生成
  const cacheKey = `talent-score:${characterId}:${talentIndex}:${level}`

  const cachedFunction = unstable_cache(
    async () => {
      try {
        // TODO: Replace with extractTalentEffects
        // For now, return empty score as this function is not actively used
        return {
          averageIncrease: 0,
          characterId,
          level,
          talentIndex,
          talentName,
        }
      } catch (error) {
        console.error('Failed to calculate talent level score:', error)
        return {
          averageIncrease: 0,
          characterId,
          level,
          talentIndex,
          talentName,
        }
      }
    },
    [cacheKey],
    {
      revalidate: 604800, // 7日間（素質情報は変わらない）
      tags: ['talent-score', cacheKey],
    },
  )

  return cachedFunction()
}

/**
 * 素質の全レベル（1-6）における平均ダメージ増加率を一括計算する
 *
 * @param options - 素質情報のオプション
 * @returns レベル別のスコア配列
 */
export async function calculateTalentAllLevelsScore(
  options: TalentScoreOptions,
): Promise<TalentLevelScore[]> {
  // 全レベルのスコアを並行して計算
  const scores = await Promise.all(
    TALENT_LEVELS.map((level) => calculateTalentLevelScore(options, level)),
  )

  return scores
}
