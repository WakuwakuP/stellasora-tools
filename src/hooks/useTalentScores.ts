'use client'

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
          if (!character?.characterData) return

          const { characterData } = character
          const effectsKey = `${talent.characterName}-${talent.index}`

          // すでに抽出済みの場合はスキップ
          if (newEffectsMap[effectsKey]) return

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

          if (!talentInfo) return

          // キャラクターステータス（Lv90）を構築
          const characterStats: CharacterStats = {
            atk_lv90: characterData.stats?.atk_lv90 ?? 0,
            hp_lv90: characterData.stats?.hp_lv90 ?? 0,
          }

          // スキル情報（Lv10）を構築
          const skills: SkillInfo[] = []

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
            talent.role === 'main'
              ? characterData.skills?.main
              : characterData.skills?.support
          if (skillRole) {
            skills.push({
              cooldown: skillRole.cooldown ?? 10,
              description:
                skillRole.description_lv10 ?? skillRole.description ?? '',
              name:
                skillRole.name ??
                (talent.role === 'main' ? '主力スキル' : '支援スキル'),
              type: talent.role === 'main' ? 'main_skill' : 'support_skill',
            })
          }

          // 必殺技
          if (characterData.skills?.ultimate) {
            skills.push({
              cooldown: characterData.skills.ultimate.cooldown ?? 60,
              description:
                characterData.skills.ultimate.description_lv10 ??
                characterData.skills.ultimate.description ??
                '',
              name: characterData.skills.ultimate.name ?? '必殺技',
              type: 'ultimate',
            })
          }

          // LLMで効果情報を抽出（レベル1-6を含む）
          const effects = await extractTalentEffects({
            characterName: characterData.name,
            characterStats,
            element: characterData.element,
            skills,
            talentDescription: talentInfo.description,
            talentName: talentInfo.name,
          })

          return { effects, effectsKey }
        })

        // 並列実行の結果を待つ
        const results = await Promise.all(extractionPromises)

        // 結果を集約
        for (const result of results) {
          if (!result) continue

          const { effectsKey, effects } = result
          newEffectsMap[effectsKey] = effects

          // 各レベルのスコアを計算
          for (const effect of effects) {
            const level = effect.level ?? 1
            const talent = selectedTalents.find(
              (t) => `${t.characterName}-${t.index}` === effectsKey,
            )
            if (!talent) continue

            const scoreKey = `${talent.characterName}-${talent.index}-${level}`

            // 簡易スコア計算（実際の値をベースに）
            // ダメージ増加系は効果量をそのまま使用
            let score = 0

            if (
              effect.type === 'damage_increase' ||
              effect.type === 'damage_normal_attack' ||
              effect.type === 'damage_skill' ||
              effect.type === 'damage_ultimate' ||
              effect.type === 'damage_elemental' ||
              effect.type === 'damage_additional' ||
              effect.type === 'damage_mark'
            ) {
              score = effect.value
            } else if (effect.type === 'atk_increase') {
              score = effect.value
            } else if (effect.type === 'crit_rate') {
              score = effect.value
            } else if (effect.type === 'crit_damage') {
              score = effect.value
            } else if (effect.type === 'damage_taken_increase') {
              score = effect.value
            }

            newScoresMap[scoreKey] = score
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
