'use server'

import {
  type CharacterContext,
  calculateLossRecoSkillScore,
} from 'actions/calculateEffectScore'
import { extractTalentEffects } from 'actions/extractTalentEffects'
import { unstable_cache } from 'next/cache'
import { type BuildScore, type EffectDamageIncrease } from 'types/buildScore'

/**
 * ビルドスコアを計算する Server Action
 *
 * キャラクターとロスレコの情報から、ビルドの性能を数値化する
 * 素質ごと、ロスレコスキルごとに平均ダメージ増加率を計算してキャッシュする
 */

/** API Base URL */
const STELLA_SORA_API_BASE_URL = 'https://api.ennead.cc'

/** キャッシュ時間（4時間 = 14400秒） */
const CACHE_REVALIDATE_SECONDS = 14400

/**
 * ビルド評価用の入力データ（拡張版）
 */
export interface BuildEvaluationInputExtended {
  /** キャラクターID（3人分） */
  characterIds: [number, number, number]
  /** ロスレコID（3つ分） */
  discIds: [number, number, number]
  /** 選択された素質情報（オプション） */
  selectedTalents?: Array<{
    characterId: number
    talentIndex: number
    level: number
  }>
}

/**
 * ロスレコスキル情報
 */
interface DiscSkillInfo {
  name: string
  description: string
  isMainSkill: boolean
  discId: number
}

/**
 * 素質情報の型（params含む）
 */
interface TalentInfo {
  name: string
  description: string
  params?: string[]
}

/** 素質処理のオプション */
interface ProcessTalentOptions {
  talent: TalentInfo
  characterName: string
  characterContext: CharacterContext
  talentIndex: number
  coreCount: number
}

/** コア素質の最大レベル */
const CORE_TALENT_MAX_LEVEL = 1
/** 通常素質の最大レベル */
const NORMAL_TALENT_MAX_LEVEL = 6

/**
 * コア素質かどうかを判定
 */
function isCoreTalent(index: number, totalCore: number): boolean {
  return index < totalCore
}

/**
 * 素質処理用のヘルパー関数（素質インデックスとレベル情報を含む）
 * paramsを使ってレベル毎の説明文を生成し、各レベルでスコアを計算する
 */
async function processTalent(options: ProcessTalentOptions) {
  const { talent, characterName, characterContext, talentIndex, coreCount } =
    options

  try {
    // コア素質はレベル1のみ、通常素質はレベル1-6
    const isCore = isCoreTalent(talentIndex, coreCount)
    const maxLevel = isCore ? CORE_TALENT_MAX_LEVEL : NORMAL_TALENT_MAX_LEVEL
    const results: Array<{
      contribution: EffectDamageIncrease
      score: number
    }> = []

    // 各レベルの処理をPromiseとして並列実行
    const levelPromises = Array.from({ length: maxLevel }, (_, i) => i + 1).map(
      async (level) => {
        // レベル毎の説明文を生成
        const descriptionForLevel = replaceParamsForLevel(
          talent.description,
          talent.params,
          level,
        )

        // LLMで効果を抽出（各レベル個別に）
        const effects = await extractTalentEffects({
          characterName,
          characterStats: {
            atk_lv90: characterContext.atk_lv90,
            hp_lv90: characterContext.hp_lv90,
          },
          element: characterContext.element,
          skills: [],
          talentDescription: descriptionForLevel,
          talentName: `${talent.name} Lv${level}`,
        })

        // 各効果のスコアを計算
        const effectPromises = effects.map(async (effect) => {
          const scoreResult = await calculateLossRecoSkillScore(
            characterContext,
            talent.name,
            { ...effect, level },
            false,
          )

          console.log(
            `[TalentScore] ${characterName}: ${talent.name} Lv${level} => +${scoreResult.averageDamageIncrease.toFixed(2)}% (${effect.type})`,
          )

          return {
            contribution: {
              averageIncrease: scoreResult.averageDamageIncrease,
              characterName,
              level,
              name: `${characterName}: ${talent.name} (素質 Lv${level})`,
              sourceType: 'talent' as const,
              talentIndex,
              type: effect.type,
              uptimeCoverage: scoreResult.uptimeCoverage,
            },
            score: scoreResult.averageDamageIncrease,
          }
        })

        return Promise.all(effectPromises)
      },
    )

    const levelResults = await Promise.all(levelPromises)
    for (const levelResult of levelResults) {
      results.push(...levelResult)
    }

    return results
  } catch (error) {
    console.error(`Failed to calculate score for talent ${talent.name}:`, error)
    return []
  }
}

/**
 * パラメータを置換してレベル毎の説明文を生成する
 * params配列の各要素はスラッシュ区切りでレベル毎の値を含む（例: "27%/44%/60%"）
 */
function replaceParamsForLevel(
  description: string,
  params: string[] | undefined,
  level: number,
): string {
  if (!params || params.length === 0) {
    return description
  }

  let result = description
  for (let i = 0; i < params.length; i++) {
    const paramValues = params[i].split('/')
    // レベルに対応する値を取得（0-indexed: level 1 -> index 0）
    const valueIndex = Math.min(level - 1, paramValues.length - 1)
    const value = paramValues[valueIndex] ?? paramValues[0]
    result = result.replace(new RegExp(`&Param${i + 1}&`, 'g'), value)
  }

  // HTMLカラータグを除去
  result = result.replace(/<color=[^>]+>/g, '')
  result = result.replace(/<\/color>/g, '')

  return result
}

/**
 * キャラクター詳細を取得する（API経由）
 */
async function fetchCharacterDetail(
  characterId: number,
  lang = 'JP',
): Promise<{
  name: string
  element: string
  stats?: {
    atk_lv90?: number
    hp_lv90?: number
  }
  potentials: {
    mainCore: TalentInfo[]
    mainNormal: TalentInfo[]
    supportCore: TalentInfo[]
    supportNormal: TalentInfo[]
    common: TalentInfo[]
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
  input: BuildEvaluationInputExtended,
): Promise<BuildScore> {
  const { characterIds, discIds } = input

  // キャッシュキーを生成
  const cacheKey = `build-score:${characterIds.join('-')}:${discIds.join('-')}`

  // unstable_cacheでキャッシュ付き関数を作成
  // 引数を明示的に渡すことで、キャッシュが正しく機能する
  const cachedCalculate = unstable_cache(
    async (
      charIds: [number, number, number],
      dIds: [number, number, number],
    ) => {
      // Step 1: キャラクター情報を取得
      const [char1, char2, char3] = await Promise.all([
        fetchCharacterDetail(charIds[0]),
        fetchCharacterDetail(charIds[1]),
        fetchCharacterDetail(charIds[2]),
      ])

      // Step 2: ロスレコ情報を取得
      const [disc1, disc2, disc3] = await Promise.all([
        fetchDiscDetail(dIds[0]),
        fetchDiscDetail(dIds[1]),
        fetchDiscDetail(dIds[2]),
      ])

      // 主力キャラクターのコンテキストを構築
      const mainCharacterContext: CharacterContext = {
        atk_lv90: char1.stats?.atk_lv90 ?? 0,
        baseCritDamage: 150,
        baseCritRate: 20,
        element: char1.element,
        hp_lv90: char1.stats?.hp_lv90 ?? 0,
        name: char1.name,
      }

      // Step 3: ロスレコのスキル情報を抽出
      const discSkills: DiscSkillInfo[] = []
      for (const disc of [disc1, disc2, disc3]) {
        // メインスキル
        const maxLevelParams =
          disc.mainSkill.params[disc.mainSkill.params.length - 1] ?? []
        discSkills.push({
          description: replaceParams(
            disc.mainSkill.description,
            maxLevelParams,
          ),
          discId: dIds[[disc1, disc2, disc3].indexOf(disc)],
          isMainSkill: true,
          name: disc.mainSkill.name,
        })

        // セカンダリスキル
        for (const secondarySkill of disc.secondarySkills) {
          const maxSecondaryParams =
            secondarySkill.params[secondarySkill.params.length - 1] ?? []
          discSkills.push({
            description: replaceParams(
              secondarySkill.description,
              maxSecondaryParams,
            ),
            discId: dIds[[disc1, disc2, disc3].indexOf(disc)],
            isMainSkill: false,
            name: secondarySkill.name,
          })
        }
      }

      // Step 4: キャラクターの素質情報を抽出してスコアを計算
      const effectContributions: EffectDamageIncrease[] = []
      let totalScore = 0

      // キャラクター1: 主力（mainCore + mainNormal + common）
      const char1CoreCount = char1.potentials.mainCore.length
      const char1Talents = [
        ...char1.potentials.mainCore,
        ...char1.potentials.mainNormal,
        ...char1.potentials.common,
      ]

      // キャラクター2: 支援（supportCore + supportNormal + common）
      const char2CoreCount = char2.potentials.supportCore.length
      const char2Talents = [
        ...char2.potentials.supportCore,
        ...char2.potentials.supportNormal,
        ...char2.potentials.common,
      ]
      const char2Context: CharacterContext = {
        atk_lv90: char2.stats?.atk_lv90 ?? 0,
        baseCritDamage: 150,
        baseCritRate: 20,
        element: char2.element,
        hp_lv90: char2.stats?.hp_lv90 ?? 0,
        name: char2.name,
      }

      // キャラクター3: 支援（supportCore + supportNormal + common）
      const char3CoreCount = char3.potentials.supportCore.length
      const char3Talents = [
        ...char3.potentials.supportCore,
        ...char3.potentials.supportNormal,
        ...char3.potentials.common,
      ]
      const char3Context: CharacterContext = {
        atk_lv90: char3.stats?.atk_lv90 ?? 0,
        baseCritDamage: 150,
        baseCritRate: 20,
        element: char3.element,
        hp_lv90: char3.stats?.hp_lv90 ?? 0,
        name: char3.name,
      }

      // 全キャラクターの素質を並列処理（インデックス付き）
      const talentResults = await Promise.all([
        ...char1Talents.map((talent, index) =>
          processTalent({
            characterContext: mainCharacterContext,
            characterName: char1.name,
            coreCount: char1CoreCount,
            talent,
            talentIndex: index,
          }),
        ),
        ...char2Talents.map((talent, index) =>
          processTalent({
            characterContext: char2Context,
            characterName: char2.name,
            coreCount: char2CoreCount,
            talent,
            talentIndex: index,
          }),
        ),
        ...char3Talents.map((talent, index) =>
          processTalent({
            characterContext: char3Context,
            characterName: char3.name,
            coreCount: char3CoreCount,
            talent,
            talentIndex: index,
          }),
        ),
      ])

      // 素質の結果を集約
      for (const results of talentResults) {
        for (const result of results) {
          effectContributions.push(result.contribution as EffectDamageIncrease)
          totalScore += result.score
        }
      }

      // Step 5: 各ロスレコスキルの効果を抽出してスコアを計算
      const processDiscSkill = async (skill: DiscSkillInfo) => {
        try {
          const effects = await extractTalentEffects({
            characterName: mainCharacterContext.name,
            characterStats: {
              atk_lv90: mainCharacterContext.atk_lv90,
              hp_lv90: mainCharacterContext.hp_lv90,
            },
            element: mainCharacterContext.element,
            skills: [],
            talentDescription: skill.description,
            talentName: skill.name,
          })

          const scoreResults = await Promise.all(
            effects.map((effect) =>
              calculateLossRecoSkillScore(
                mainCharacterContext,
                skill.name,
                effect,
                skill.isMainSkill,
              ).then((scoreResult) => ({
                contribution: {
                  averageIncrease: scoreResult.averageDamageIncrease,
                  name: `${skill.name}${skill.isMainSkill ? ' (メイン)' : ' (サブ)'}`,
                  sourceType: 'lossreco' as const,
                  type: effect.type,
                  uptimeCoverage: scoreResult.uptimeCoverage,
                },
                score: scoreResult.averageDamageIncrease,
              })),
            ),
          )

          return scoreResults
        } catch (error) {
          console.error(
            `Failed to calculate score for skill ${skill.name}:`,
            error,
          )
          return []
        }
      }

      // ロスレコスキルを並列処理
      const discResults = await Promise.all(
        discSkills.map((skill) => processDiscSkill(skill)),
      )

      // ロスレコの結果を集約
      for (const results of discResults) {
        for (const result of results) {
          effectContributions.push(result.contribution as EffectDamageIncrease)
          totalScore += result.score
        }
      }

      return {
        effectContributions,
        simulation: {
          actions: [],
          duration: 120,
          effectUptime: {},
          totalDamage: 0,
        },
        totalScore,
      }
    },
    [cacheKey],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: ['build-score', cacheKey],
    },
  )

  return cachedCalculate(characterIds, discIds)
}
