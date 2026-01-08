'use client'

import { extractTalentEffects } from 'actions/extractTalentEffects'
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

        // 各素質に対して効果情報を抽出
        for (const talent of selectedTalents) {
          const character = characters.find(
            (c) => c.name === talent.characterName,
          )
          if (!character?.characterData) continue

          const { characterData } = character
          const effectsKey = `${talent.characterName}-${talent.index}`

          // すでに抽出済みの場合はスキップ
          if (newEffectsMap[effectsKey]) continue

          // 素質情報を取得
          let talentInfo: { description: string; name: string } | null = null

          if (talent.role === 'main') {
            // 主力キャラクターの素質
            const allTalents = [
              ...characterData.potentials.mainCore,
              ...characterData.potentials.mainNormal,
            ]
            talentInfo = allTalents[talent.index] || null
          } else {
            // 支援キャラクターの素質
            const allTalents = [
              ...characterData.potentials.supportCore,
              ...characterData.potentials.supportNormal,
            ]
            talentInfo = allTalents[talent.index] || null
          }

          if (!talentInfo) continue

          // LLMで効果情報を抽出（レベル1-6を含む）
          const effects = await extractTalentEffects(
            characterData.name,
            characterData.element,
            talentInfo.name,
            talentInfo.description,
          )

          newEffectsMap[effectsKey] = effects

          // 各レベルのスコアを計算
          for (const effect of effects) {
            const level = effect.level ?? 1
            const scoreKey = `${talent.characterName}-${talent.index}-${level}`

            // 効果値をそのまま使用（APIから取得した実際の値）
            // LLMが各レベルの正確な数値を抽出しているため係数は不要
            newScoresMap[scoreKey] = effect.value
          }
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
