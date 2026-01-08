'use client'

import {
  type CharacterContext,
  calculateTalentEffectScore,
} from 'actions/calculateEffectScore'
import {
  type CharacterStats,
  extractTalentEffects,
  type SkillInfo,
} from 'actions/extractTalentEffects'
import { type CharacterDetail } from 'actions/getCharacterInfo'
import { type SelectedTalent } from 'components/build'
import { useEffect, useState } from 'react'
import { type EffectInfo } from 'types/buildScore'

/**
 * 素質スコアマップの型
 * キー: `${characterName}-${talentIndex}-${level}`
 * 値: 平均ダメージ増加率（%）
 */
export type TalentScoreMap = Record<string, number>

/**
 * 素質効果情報マップの型
 * キー: `${characterName}-${talentIndex}`
 * 値: 効果情報の配列（レベル1-6を含む）
 */
type TalentEffectsMap = Record<string, EffectInfo[]>

/**
 * フォールバック用のスコア計算（Server Actionが失敗した場合）
 */
function calculateFallbackScore(effect: EffectInfo): number {
  // ダメージ増加系は効果量をそのまま使用
  const damageEffectTypes = new Set([
    'damage_increase',
    'damage_normal_attack',
    'damage_skill',
    'damage_ultimate',
    'damage_elemental',
    'damage_additional',
    'damage_mark',
    'atk_increase',
    'crit_rate',
    'crit_damage',
    'damage_taken_increase',
  ])
  return damageEffectTypes.has(effect.type) ? effect.value : 0
}

/**
 * 素質情報を取得するヘルパー関数
 */
function getTalentInfo(
  characterData: CharacterDetail,
  role: 'main' | 'sub',
  index: number,
): { description: string; name: string } | null {
  const allTalents =
    role === 'main'
      ? [
          ...characterData.potentials.mainCore,
          ...characterData.potentials.mainNormal,
        ]
      : [
          ...characterData.potentials.supportCore,
          ...characterData.potentials.supportNormal,
        ]
  return allTalents[index] || null
}

/**
 * スキル情報を構築するヘルパー関数
 */
function buildSkillsInfo(
  characterData: CharacterDetail,
  role: 'main' | 'sub',
): SkillInfo[] {
  const skills: SkillInfo[] = []
  const defaultMainCooldown = 10
  const defaultUltimateCooldown = 60

  // 通常攻撃
  if (characterData.skills?.normal) {
    skills.push({
      cooldown: 0,
      description:
        characterData.skills.normal.description_lv10 ??
        characterData.skills.normal.description ??
        '',
      name: characterData.skills.normal.name ?? '通常攻撃',
      type: 'normal',
    })
  }

  // 主力/支援スキルを選択
  const skillRole =
    role === 'main' ? characterData.skills?.main : characterData.skills?.support
  if (skillRole) {
    skills.push({
      cooldown: skillRole.cooldown ?? defaultMainCooldown,
      description: skillRole.description_lv10 ?? skillRole.description ?? '',
      name: skillRole.name ?? (role === 'main' ? '主力スキル' : '支援スキル'),
      type: role === 'main' ? 'main_skill' : 'support_skill',
    })
  }

  // 必殺技
  if (characterData.skills?.ultimate) {
    skills.push({
      cooldown:
        characterData.skills.ultimate.cooldown ?? defaultUltimateCooldown,
      description:
        characterData.skills.ultimate.description_lv10 ??
        characterData.skills.ultimate.description ??
        '',
      name: characterData.skills.ultimate.name ?? '必殺技',
      type: 'ultimate',
    })
  }

  return skills
}

/**
 * CharacterContextを構築するヘルパー関数
 */
function buildCharacterContext(
  characterData: CharacterDetail,
): CharacterContext {
  const defaultBaseCritDamage = 150
  const defaultBaseCritRate = 20
  return {
    atk_lv90: characterData.stats?.atk_lv90 ?? 0,
    baseCritDamage: defaultBaseCritDamage,
    baseCritRate: defaultBaseCritRate,
    element: characterData.element,
    hp_lv90: characterData.stats?.hp_lv90 ?? 0,
    name: characterData.name,
  }
}

/**
 * 素質スコアを計算・管理するフック
 *
 * 各素質に対してLLMで効果情報を抽出し、レベル別のスコアを計算します。
 */
export function useTalentScores(
  characters: Array<{
    characterData: CharacterDetail | null
    name: string | null
  }>,
  selectedTalents: SelectedTalent[],
) {
  const [talentScores, setTalentScores] = useState<TalentScoreMap>({})
  const [talentEffects, setTalentEffects] = useState<TalentEffectsMap>({})
  const [isCalculating, setIsCalculating] = useState(false)

  // 選択された素質の効果情報を抽出
  useEffect(() => {
    if (selectedTalents.length === 0) {
      setTalentScores({})
      setTalentEffects({})
      return
    }

    const extractEffects = async () => {
      setIsCalculating(true)

      try {
        const newEffectsMap: TalentEffectsMap = {}
        const newScoresMap: TalentScoreMap = {}

        // 並列で各素質の効果情報を抽出
        const extractionPromises = selectedTalents.map(async (talent) => {
          const character = characters.find(
            (c) => c.name === talent.characterName,
          )
          if (!character?.characterData) return null

          const { characterData } = character
          const effectsKey = `${talent.characterName}-${talent.index}`

          // すでに抽出済みの場合はスキップ
          if (newEffectsMap[effectsKey]) return null

          // 素質情報を取得
          const talentInfo = getTalentInfo(
            characterData,
            talent.role,
            talent.index,
          )
          if (!talentInfo) return null

          // キャラクターステータス（Lv90）を構築
          const characterStats: CharacterStats = {
            atk_lv90: characterData.stats?.atk_lv90 ?? 0,
            hp_lv90: characterData.stats?.hp_lv90 ?? 0,
          }

          // スキル情報（Lv10）を構築
          const skills = buildSkillsInfo(characterData, talent.role)

          // LLMで効果情報を抽出（レベル1-6を含む）
          const effects = await extractTalentEffects({
            characterName: characterData.name,
            characterStats,
            element: characterData.element,
            skills,
            talentDescription: talentInfo.description,
            talentName: talentInfo.name,
          })

          return {
            characterData,
            effects,
            effectsKey,
            talent,
            talentName: talentInfo.name,
          }
        })

        // 並列実行の結果を待つ
        const results = await Promise.all(extractionPromises)

        // 有効な結果のみをフィルタ
        const validResults = results.filter(
          (r): r is NonNullable<typeof r> => r !== null,
        )

        // effectsMapを構築
        for (const result of validResults) {
          newEffectsMap[result.effectsKey] = result.effects
        }

        // 全ての結果に対してスコア計算を並列実行
        const allScorePromises = validResults.flatMap((result) => {
          const characterContext = buildCharacterContext(result.characterData)

          return result.effects.map(async (effect) => {
            const level = effect.level ?? 1
            const scoreKey = `${result.talent.characterName}-${result.talent.index}-${level}`

            try {
              const scoreResult = await calculateTalentEffectScore(
                characterContext,
                result.talentName,
                effect,
              )
              return { score: scoreResult.averageDamageIncrease, scoreKey }
            } catch (error) {
              console.error(`Failed to calculate score for ${scoreKey}:`, error)
              return { score: calculateFallbackScore(effect), scoreKey }
            }
          })
        })

        const scoreResults = await Promise.all(allScorePromises)
        for (const { score, scoreKey } of scoreResults) {
          newScoresMap[scoreKey] = score
        }

        setTalentEffects(newEffectsMap)
        setTalentScores(newScoresMap)
      } catch (error) {
        console.error('Failed to extract talent effects:', error)
      } finally {
        setIsCalculating(false)
      }
    }

    extractEffects()
  }, [characters, selectedTalents])

  // 選択された素質の総合スコアを計算
  const totalScore = selectedTalents.reduce((sum, talent) => {
    const scoreKey = `${talent.characterName}-${talent.index}-${talent.level}`
    const score = talentScores[scoreKey] ?? 0
    return sum + score
  }, 0)

  return {
    isCalculating,
    talentEffects,
    talentScores,
    totalScore,
  }
}
