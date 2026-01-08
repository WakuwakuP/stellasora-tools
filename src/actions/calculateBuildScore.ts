'use server'

import { calculateBuildScore } from 'lib/build-score-calculator'
import { simulateCombat } from 'lib/combat-simulation'
import {
  convertDiscSkillsToEffectInfo,
  convertTalentsToEffectInfo,
} from 'lib/gemini-effect-parser'
import { unstable_cache } from 'next/cache'
import { type BuildEvaluationInput, type BuildScore } from 'types/buildScore'

/**
 * ビルドスコアを計算する Server Action
 *
 * キャラクターとロスレコの情報から、ビルドの性能を数値化する
 */

/** API Base URL */
const STELLA_SORA_API_BASE_URL = 'https://api.ennead.cc'

/** キャッシュ時間（4時間 = 14400秒） */
const CACHE_REVALIDATE_SECONDS = 14400

/**
 * キャラクター詳細を取得する（API経由）
 */
async function fetchCharacterDetail(
  characterId: number,
  lang = 'JP',
): Promise<{
  name: string
  element: string
  potentials: {
    mainCore: Array<{ name: string; description: string }>
    mainNormal: Array<{ name: string; description: string }>
    supportCore: Array<{ name: string; description: string }>
    supportNormal: Array<{ name: string; description: string }>
    common: Array<{ name: string; description: string }>
  }
}> {
  const url = `${STELLA_SORA_API_BASE_URL}/stella/character/${characterId}?lang=${lang}`

  const response = await fetch(url, {
    next: { revalidate: CACHE_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch character detail: ${response.status} for character ${characterId}`,
    )
  }

  return response.json()
}

/**
 * ロスレコ詳細を取得する（API経由）
 */
async function fetchDiscDetail(
  discId: number,
  lang = 'JP',
): Promise<{
  name: string
  element: string
  mainSkill: { name: string; description: string; params: string[][] }
  secondarySkills: Array<{
    name: string
    description: string
    params: string[][]
  }>
}> {
  const url = `${STELLA_SORA_API_BASE_URL}/stella/disc/${discId}?lang=${lang}`

  const response = await fetch(url, {
    next: { revalidate: CACHE_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch disc detail: ${response.status} for disc ${discId}`,
    )
  }

  return response.json()
}

/**
 * 説明文のパラメータを置換する
 */
function replaceParams(description: string, params: string[]): string {
  if (!params || params.length === 0) {
    return description
  }
  return description.replace(/&Param(\d+)&/g, (match, index) => {
    const paramIndex = Number.parseInt(index, 10) - 1
    return params[paramIndex] ?? match
  })
}

/**
 * ビルドスコアを計算する
 *
 * @param input - ビルド評価用の入力データ
 * @returns ビルドスコア
 */
export async function calculateBuildPerformance(
  input: BuildEvaluationInput,
): Promise<BuildScore> {
  const { characterIds, discIds } = input

  // キャッシュキーを生成
  const cacheKey = `build-score:${characterIds.join('-')}:${discIds.join('-')}`

  const cachedFunction = unstable_cache(
    async () => {
      // Step 1: キャラクター情報を取得
      const [char1, char2, char3] = await Promise.all([
        fetchCharacterDetail(characterIds[0]),
        fetchCharacterDetail(characterIds[1]),
        fetchCharacterDetail(characterIds[2]),
      ])

      // Step 2: ロスレコ情報を取得
      const [disc1, disc2, disc3] = await Promise.all([
        fetchDiscDetail(discIds[0]),
        fetchDiscDetail(discIds[1]),
        fetchDiscDetail(discIds[2]),
      ])

      // Step 3: キャラクターの素質情報を抽出
      const characterTalents = [
        ...char1.potentials.mainCore,
        ...char1.potentials.mainNormal,
        ...char2.potentials.supportCore,
        ...char2.potentials.supportNormal,
        ...char3.potentials.supportCore,
        ...char3.potentials.supportNormal,
      ]

      // Step 4: ロスレコのスキル情報を抽出
      const discSkills = []
      for (const disc of [disc1, disc2, disc3]) {
        // 最大レベルのパラメータを使用
        const maxLevelParams =
          disc.mainSkill.params[disc.mainSkill.params.length - 1] ?? []

        discSkills.push({
          description: replaceParams(
            disc.mainSkill.description,
            maxLevelParams,
          ),
          name: disc.mainSkill.name,
        })

        // セカンダリスキルも追加
        for (const secondarySkill of disc.secondarySkills) {
          const maxSecondaryParams =
            secondarySkill.params[secondarySkill.params.length - 1] ?? []
          discSkills.push({
            description: replaceParams(
              secondarySkill.description,
              maxSecondaryParams,
            ),
            name: secondarySkill.name,
          })
        }
      }

      // Step 5: LLMで効果情報に変換
      const [talentEffects, discEffects] = await Promise.all([
        convertTalentsToEffectInfo(char1.name, char1.element, characterTalents),
        convertDiscSkillsToEffectInfo(disc1.name, disc1.element, discSkills),
      ])

      // Step 6: 全ての効果を結合
      const allEffects = [...talentEffects, ...discEffects]

      // Step 7: 戦闘シミュレーションを実行
      // 主力スキルは簡易的に定義（実際のゲームデータに基づいて調整が必要）
      const mainSkills = [
        { cooldown: 10, duration: 1, name: '主力スキル1' },
        { cooldown: 15, duration: 1, name: '主力スキル2' },
      ]

      const simulation = simulateCombat(allEffects, mainSkills)

      // Step 8: ビルドスコアを計算
      const score = calculateBuildScore(allEffects, simulation)

      return score
    },
    [cacheKey],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: ['build-score', cacheKey],
    },
  )

  return cachedFunction()
}
