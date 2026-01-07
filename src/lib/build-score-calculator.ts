/**
 * ビルドスコア計算サービス
 */

import { fetchCharactersByIds, fetchDiscsByIds } from 'lib/api-client'
import { simulateSingleEffect } from 'lib/combat-simulator'
import { convertMultipleDescriptions } from 'lib/gemini-service'
import {
  type BuildConfiguration,
  type BuildScoreResult,
  type EffectEvaluation,
  type LLMConversionRequest,
} from 'types/buildScore'

/**
 * キャラクターの素質を解析
 */
async function analyzeCharacterTalents(
  // biome-ignore lint/suspicious/noExplicitAny: API response type is dynamic
  characterData: any,
): Promise<EffectEvaluation[]> {
  const evaluations: EffectEvaluation[] = []

  if (!characterData.potentials) {
    return evaluations
  }

  const { mainCore, mainNormal, supportCore, supportNormal, common } =
    characterData.potentials

  // 全ての素質を収集
  const allTalents = [
    ...mainCore,
    ...mainNormal,
    ...supportCore,
    ...supportNormal,
    ...common,
  ]

  // LLM変換リクエストを作成
  const requests: LLMConversionRequest[] = allTalents.map((talent) => ({
    characterInfo: {
      element: characterData.element || 'Unknown',
      name: characterData.name,
    },
    description: talent.description,
    params: talent.params || [],
  }))

  // 並列でLLM変換を実行
  const responses = await convertMultipleDescriptions(requests)

  // 各素質の効果を評価
  for (let i = 0; i < allTalents.length; i++) {
    const talent = allTalents[i]
    const response = responses[i]

    if (!response?.success || response.effects.length === 0) {
      continue
    }

    // 各効果についてシミュレーション
    for (const effect of response.effects) {
      const simulationResult = simulateSingleEffect(effect)

      evaluations.push({
        averageDamageIncrease: simulationResult.damageIncreaseRate,
        effectName: `${talent?.name} - ${effect.name}`,
        effectType: effect.type,
        simulationResult,
      })
    }
  }

  return evaluations
}

/**
 * ディスクのスキルを解析
 */
async function analyzeDiscSkills(
  // biome-ignore lint/suspicious/noExplicitAny: API response type is dynamic
  discData: any,
): Promise<EffectEvaluation[]> {
  const evaluations: EffectEvaluation[] = []

  // メインスキルとセカンダリスキルを収集
  const allSkills = [
    discData.mainSkill,
    ...(discData.secondarySkills || []),
  ].filter(Boolean)

  // LLM変換リクエストを作成
  const requests: LLMConversionRequest[] = allSkills.map((skill) => ({
    description: skill.description,
    // 最大レベルのパラメータを使用
    params: skill.params[skill.params.length - 1] || [],
  }))

  // 並列でLLM変換を実行
  const responses = await convertMultipleDescriptions(requests)

  // 各スキルの効果を評価
  for (let i = 0; i < allSkills.length; i++) {
    const skill = allSkills[i]
    const response = responses[i]

    if (!response?.success || response.effects.length === 0) {
      continue
    }

    // 各効果についてシミュレーション
    for (const effect of response.effects) {
      const simulationResult = simulateSingleEffect(effect)

      evaluations.push({
        averageDamageIncrease: simulationResult.damageIncreaseRate,
        effectName: `${skill?.name} - ${effect.name}`,
        effectType: effect.type,
        simulationResult,
      })
    }
  }

  return evaluations
}

/**
 * ビルドスコアを計算
 */
export async function calculateBuildScore(
  config: BuildConfiguration,
): Promise<BuildScoreResult> {
  // キャラクターとディスクのデータを取得
  const [charactersData, discsData] = await Promise.all([
    fetchCharactersByIds([...config.characterIds]),
    fetchDiscsByIds([...config.discIds]),
  ])

  // キャラクターごとに素質を解析
  const characterEvaluations = await Promise.all(
    charactersData.map(async (characterData, index) => {
      const talentEvaluations = await analyzeCharacterTalents(characterData)
      return {
        characterId: config.characterIds[index] || 0,
        characterName: characterData.name || 'Unknown',
        talentEvaluations,
      }
    }),
  )

  // ディスクごとにスキルを解析
  const discEvaluations = await Promise.all(
    discsData.map(async (discData, index) => {
      const skillEvaluations = await analyzeDiscSkills(discData)
      return {
        discId: config.discIds[index] || 0,
        discName: discData.name || 'Unknown',
        skillEvaluations,
      }
    }),
  )

  // 全ての効果のダメージ増加率を合算してビルドスコアを計算
  let totalDamageIncrease = 0

  for (const charEval of characterEvaluations) {
    for (const talentEval of charEval.talentEvaluations) {
      totalDamageIncrease += talentEval.averageDamageIncrease
    }
  }

  for (const discEval of discEvaluations) {
    for (const skillEval of discEval.skillEvaluations) {
      totalDamageIncrease += skillEval.averageDamageIncrease
    }
  }

  return {
    buildScore: totalDamageIncrease,
    calculatedAt: new Date(),
    characterEvaluations,
    discEvaluations,
  }
}
