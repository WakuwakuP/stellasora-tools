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
  type ParsedEffect,
  type ParsedTalentWithLevel,
} from 'types/buildScore'

/**
 * キャッシュ時間（24時間 = 86400秒）
 */
const CACHE_REVALIDATE_SECONDS = 86400

/**
 * パーセント値の正規表現
 */
const PERCENT_REGEX = /(\d+(?:\.\d+)?)%?/

/**
 * params配列からレベル別の値を抽出
 * 例: "27%/44%/60%/76%/92%/109%" -> level=3の場合は "60%"
 */
function extractValueFromParam(param: string, level: number): string {
  // スラッシュ区切りの値がある場合、レベルに応じた値を取得
  if (param.includes('/')) {
    const values = param.split('/')
    // レベルは1-6なので、配列インデックスは0-5
    const index = Math.max(0, Math.min(level - 1, values.length - 1))
    return values[index] || param
  }
  // スラッシュがない場合はそのまま返す
  return param
}

/**
 * ParsedEffectのvalue値をレベル別に置換
 */
function substituteEffectValues(
  effects: ParsedEffect[],
  params: string[],
  level: number,
): ParsedEffect[] {
  return effects.map((effect) => {
    // effectのvalueがparams配列のどの要素から来たかを判定する必要があるが、
    // 実際にはLLMがparamsから値を抽出しているため、
    // ここでは単純にparams配列の最初の値を使用する
    // より正確には、descriptionとparamsの対応関係を保持する必要がある

    // 簡易実装: params配列が1つの場合、その値をレベル別に置換
    if (params.length > 0) {
      const paramValue = params[0]
      const levelValue = extractValueFromParam(paramValue, level)

      // パーセント値を抽出して置換
      const percentMatch = levelValue.match(PERCENT_REGEX)
      if (percentMatch) {
        return {
          ...effect,
          value: Number.parseFloat(percentMatch[1]),
        }
      }
    }

    return effect
  })
}

/**
 * 選択された素質のみを解析（LLM最適化版）
 * レベル変更時はLLM再実行せず、キャッシュされた結果から値を置換
 */
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

  // 素質ごとにLLM変換を実行（レベル非依存）
  const talentCache = new Map<
    string,
    { effects: ParsedEffect[]; params: string[] }
  >()

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

    // キャッシュキー（レベル非依存）
    const cacheKey = `${characterName}-${role}-${index}`

    // キャッシュから取得または新規にLLM処理
    let cachedData = talentCache.get(cacheKey)

    if (!cachedData) {
      // LLM変換を実行（params配列はそのまま渡す、レベル1の値を使用）
      const baseParams = (talent.params || []).map((param) =>
        extractValueFromParam(param, 1),
      )

      const request: LLMConversionRequest = {
        characterInfo: {
          element: characterData.element || 'Unknown',
          name: characterData.name,
        },
        description: talent.description,
        params: baseParams,
      }

      // biome-ignore lint/performance/noAwaitInLoops: レート制限のため順次実行が必要
      const conversionResults = await convertMultipleDescriptions([request])
      const result = conversionResults[0]

      if (result?.success && result.effects.length > 0) {
        cachedData = {
          effects: result.effects,
          params: talent.params || [],
        }
        talentCache.set(cacheKey, cachedData)
      }
    }

    // レベルに応じた値を置換
    if (cachedData) {
      const levelAdjustedEffects = substituteEffectValues(
        cachedData.effects,
        cachedData.params,
        level,
      )

      evaluations.push({
        characterName,
        effects: levelAdjustedEffects,
        selectedLevel: level,
        talentIndex: index,
        talentName: talent.name,
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
  // キャッシュキーを生成（レベル非依存 - 素質IDのみ）
  const talentKey = request.selectedTalents
    .map((t) => `${t.characterName}-${t.role}-${t.index}`)
    .sort()
    .join('_')
  const cacheKey = `build-effects-v2:chars:${request.characterIds.join('-')}:discs:${request.discIds.join('-')}:talents:${talentKey}`

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
          // biome-ignore lint/performance/noAwaitInLoops: レート制限のため順次実行が必要
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
        // biome-ignore lint/performance/noAwaitInLoops: レート制限のため順次実行が必要
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
