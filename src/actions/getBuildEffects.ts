'use server'

/**
 * ビルド効果データ取得のServer Action
 * 選択された素質とロスレコの効果をJSON形式で返す
 */

import { fetchCharactersByIds, fetchDiscsByIds } from 'lib/api-client'
import { convertMultipleDescriptions } from 'lib/gemini-service'
import { unstable_cache } from 'next/cache'
import {
  type BuildEffectsData,
  type BuildEffectsRequest,
  type LLMConversionRequest,
  type ParsedDiscSkillEffect,
  type ParsedTalentWithLevel,
} from 'types/buildScore'

/**
 * キャッシュ時間（24時間 = 86400秒）
 */
const CACHE_REVALIDATE_SECONDS = 86400

/**
 * params配列からレベル別の値を抽出
 * 例: ["27%/44%/60%/76%/92%/109%"] -> level=3の場合は "60%"
 */
function extractLevelValue(params: string[], level: number): string[] {
  return params.map((param) => {
    // スラッシュ区切りの値がある場合、レベルに応じた値を取得
    if (param.includes('/')) {
      const values = param.split('/')
      // レベルは1-6なので、配列インデックスは0-5
      const index = Math.max(0, Math.min(level - 1, values.length - 1))
      return values[index] || param
    }
    // スラッシュがない場合はそのまま返す
    return param
  })
}

/**
 * 選択された素質のみを解析
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: 素質解析は複雑な条件分岐が必要
async function analyzeSelectedTalents(
  // biome-ignore lint/suspicious/noExplicitAny: API response type is dynamic
  characterData: any,
  characterName: string,
  selectedTalentsForChar: Array<{
    role: 'main' | 'sub'
    index: number
    level: number
  }>,
): Promise<ParsedTalentWithLevel[]> {
  const evaluations: ParsedTalentWithLevel[] = []

  if (!characterData.potentials || selectedTalentsForChar.length === 0) {
    return evaluations
  }

  const { mainCore, mainNormal, supportCore, supportNormal, common } =
    characterData.potentials

  // LLM変換リクエストを作成（選択された素質のみ）
  const requests: Array<{
    request: LLMConversionRequest
    talentName: string
    talentIndex: number
    selectedLevel: number
  }> = []

  for (const selectedTalent of selectedTalentsForChar) {
    const { role, index, level } = selectedTalent

    // 素質を取得
    let talent:
      | { name: string; description: string; params: string[] }
      | undefined

    if (role === 'main') {
      const allMainTalents = [...mainCore, ...mainNormal, ...common]
      talent = allMainTalents[index]
    } else {
      const allSubTalents = [...supportCore, ...supportNormal, ...common]
      talent = allSubTalents[index]
    }

    if (!talent) continue

    // レベルに応じたパラメータ値を抽出
    const levelSpecificParams =
      level > 0
        ? extractLevelValue(talent.params || [], level)
        : talent.params || []

    requests.push({
      request: {
        characterInfo: {
          element: characterData.element || 'Unknown',
          name: characterData.name,
        },
        description: talent.description,
        params: levelSpecificParams,
      },
      selectedLevel: level,
      talentIndex: index,
      talentName: talent.name,
    })
  }

  if (requests.length === 0) {
    return evaluations
  }

  // LLM変換を実行
  const llmRequests = requests.map((r) => r.request)
  const conversionResults = await convertMultipleDescriptions(llmRequests)

  // 結果を整形
  for (let i = 0; i < requests.length; i++) {
    const req = requests[i]
    const result = conversionResults[i]

    if (result?.success && result.effects.length > 0) {
      evaluations.push({
        characterName,
        effects: result.effects,
        selectedLevel: req.selectedLevel,
        talentIndex: req.talentIndex,
        talentName: req.talentName,
      })
    }
  }

  return evaluations
}

/**
 * ディスクスキルを解析
 */
async function analyzeDiscSkills(
  // biome-ignore lint/suspicious/noExplicitAny: API response type is dynamic
  discData: any,
): Promise<ParsedDiscSkillEffect[]> {
  const evaluations: ParsedDiscSkillEffect[] = []

  if (!discData.mainSkill) {
    return evaluations
  }

  // メインスキルのみを解析
  const skill = discData.mainSkill

  // params配列の最初の要素を使用（レベル1の値）
  const params = skill.params && skill.params.length > 0 ? skill.params[0] : []

  const request: LLMConversionRequest = {
    description: skill.description,
    params,
  }

  const conversionResults = await convertMultipleDescriptions([request])
  const result = conversionResults[0]

  if (result?.success && result.effects.length > 0) {
    evaluations.push({
      discId: discData.id,
      discName: discData.name,
      effects: result.effects,
      skillName: skill.name,
    })
  }

  return evaluations
}

/**
 * ビルド効果データを取得する（キャッシュ付き）
 */
export async function getBuildEffectsAction(
  request: BuildEffectsRequest,
): Promise<BuildEffectsData> {
  // キャッシュキーを生成
  const talentKey = request.selectedTalents
    .map((t) => `${t.characterName}-${t.role}-${t.index}-${t.level}`)
    .sort()
    .join('_')
  const cacheKey = `build-effects:chars:${request.characterIds.join('-')}:discs:${request.discIds.join('-')}:talents:${talentKey}`

  // キャッシュ化された関数を作成
  const cachedFetch = unstable_cache(
    async () => {
      // APIからキャラクターとディスクデータを取得
      const [charactersData, discsData] = await Promise.all([
        fetchCharactersByIds(request.characterIds, 'JP'),
        fetchDiscsByIds(request.discIds, 'JP'),
      ])

      // 各キャラクターの選択された素質を解析
      const talentEffects: ParsedTalentWithLevel[] = []

      for (let i = 0; i < charactersData.length; i++) {
        const charData = charactersData[i]
        const _charId = request.characterIds[i]

        // このキャラクターの選択された素質をフィルタ
        const selectedTalentsForChar = request.selectedTalents.filter((t) => {
          // キャラクター名でマッチング
          return t.characterName === charData.name
        })

        if (selectedTalentsForChar.length > 0) {
          const talents = await analyzeSelectedTalents(
            charData,
            charData.name,
            selectedTalentsForChar,
          )
          talentEffects.push(...talents)
        }
      }

      // ディスクスキルを解析
      const discEffects: ParsedDiscSkillEffect[] = []

      for (const discData of discsData) {
        const effects = await analyzeDiscSkills(discData)
        discEffects.push(...effects)
      }

      return {
        discEffects,
        fetchedAt: new Date(),
        talentEffects,
      }
    },
    [cacheKey],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: [
        'build-effects',
        ...request.characterIds.map((id) => `character:${id}`),
        ...request.discIds.map((id) => `disc:${id}`),
      ],
    },
  )

  return cachedFetch()
}
