'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { unstable_cache } from 'next/cache'
import { type EffectInfo } from 'types/buildScore'

/**
 * Gemini AI を使用してスキルや素質情報を効果情報JSONに変換する
 */

/** Gemini API Key */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? ''

/** キャッシュ時間（7日間 = 604800秒） */
const CACHE_REVALIDATE_SECONDS = 604800

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. LLM features will not be available.')
}

/** Gemini AI クライアントのファクトリー関数 */
function createGeminiClient() {
  if (!GEMINI_API_KEY) {
    return null
  }
  return new GoogleGenerativeAI(GEMINI_API_KEY)
}

/**
 * プロンプトテンプレート
 */
const EFFECT_EXTRACTION_PROMPT = `あなたはステラソラというゲームのスキルや素質の効果を解析するAIです。
与えられたキャラクター情報、スキル情報、素質効果の説明文から、効果を以下のJSON形式に変換してください。

【出力形式】
必ずJSON配列を返してください。説明文や補足は不要です。
\`\`\`json
[
  {
    "name": "効果名（スキル名または素質名）",
    "type": "効果の種類",
    "value": 効果量（数値）,
    "unit": "効果量の単位（%、回、秒のいずれか）",
    "uptime": 効果時間（秒、常時発動の場合は999999）,
    "cooldown": 次に効果が発動するまでの時間（秒、常時発動の場合は0）,
    "maxStacks": 重複上限（記載がなければ1）
  }
]
\`\`\`

【効果の種類（type）】
- damage_increase: 全体的なダメージ増加
- damage_normal_attack: 通常攻撃ダメージ増加
- damage_skill: スキルダメージ増加
- damage_ultimate: 必殺技ダメージ増加
- damage_mark: 印ダメージ増加
- damage_elemental: 属性ダメージ増加（水/火/風/地/光/闇）
- damage_additional: 追撃ダメージ
- atk_increase: 攻撃力増加
- speed_increase: 速度増加
- cooldown_reduction: クールダウン減少
- crit_rate: 会心率増加
- crit_damage: 会心ダメージ増加
- damage_taken_increase: 被ダメージ増加（敵に付与するデバフ）
- def_decrease: 防御力減少（敵に付与するデバフ、damage_taken_increaseとして扱う）

【注意事項】
- キャラクター情報から属性（element）を判定し、属性ダメージ増加の場合はdamage_elementalを使用してください
- 防御力減少は被ダメージ増加（damage_taken_increase）として扱ってください
- 複数の効果がある場合は、配列に複数のオブジェクトを含めてください
- 効果時間やクールダウンが記載されていない場合は、常識的な値を推測してください
- 常時発動の効果はuptime=999999、cooldown=0としてください
- 数値が明記されていない効果は無視してください

【入力データ】
`

/**
 * Gemini AI を使用してスキル/素質情報を効果情報に変換する
 */
async function convertToEffectInfoWithGemini(
  characterName: string,
  element: string,
  descriptions: { name: string; description: string }[],
  genAI?: GoogleGenerativeAI | null,
): Promise<EffectInfo[]> {
  const client = genAI ?? createGeminiClient()

  if (!client) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  // プロンプトを構築
  const inputData = {
    characterName,
    effects: descriptions,
    element,
  }

  const prompt = `${EFFECT_EXTRACTION_PROMPT}
${JSON.stringify(inputData, null, 2)}
`

  try {
    // Gemini 1.5 Flash を使用（コスト効率が良い）
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // JSON部分を抽出（```json ... ``` で囲まれている場合に対応）
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    const jsonText = jsonMatch ? jsonMatch[1] : text

    // JSONをパース
    const effects = JSON.parse(jsonText) as EffectInfo[]

    // 型チェック
    if (!Array.isArray(effects)) {
      throw new Error('Invalid response format: expected array')
    }

    return effects
  } catch (error) {
    console.error('Failed to convert to effect info with Gemini:', error)
    throw new Error('効果情報の変換に失敗しました')
  }
}

/**
 * スキル/素質情報を効果情報に変換する（キャッシュ付き）
 *
 * @param characterName - キャラクター名
 * @param element - 属性
 * @param descriptions - 説明文のリスト
 * @param genAI - テスト用のGemini AIクライアント（省略可）
 */
export async function convertToEffectInfo(
  characterName: string,
  element: string,
  descriptions: { name: string; description: string }[],
  genAI?: GoogleGenerativeAI | null,
): Promise<EffectInfo[]> {
  // キャッシュキーを生成（入力データのハッシュ）
  const cacheKey = `effect-info:${characterName}:${JSON.stringify(descriptions)}`

  const cachedFunction = unstable_cache(
    async () =>
      convertToEffectInfoWithGemini(
        characterName,
        element,
        descriptions,
        genAI,
      ),
    [cacheKey],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: ['effect-info'],
    },
  )

  return cachedFunction()
}

/**
 * キャラクターの素質情報を効果情報に変換する
 *
 * @param characterName - キャラクター名
 * @param element - 属性
 * @param talents - 素質情報のリスト
 * @param genAI - テスト用のGemini AIクライアント（省略可）
 */
export async function convertTalentsToEffectInfo(
  characterName: string,
  element: string,
  talents: { name: string; description: string }[],
  genAI?: GoogleGenerativeAI | null,
): Promise<EffectInfo[]> {
  return convertToEffectInfo(characterName, element, talents, genAI)
}

/**
 * ロスレコのスキル情報を効果情報に変換する
 *
 * @param discName - ロスレコ名
 * @param element - 属性
 * @param skills - スキル情報のリスト
 * @param genAI - テスト用のGemini AIクライアント（省略可）
 */
export async function convertDiscSkillsToEffectInfo(
  discName: string,
  element: string,
  skills: { name: string; description: string }[],
  genAI?: GoogleGenerativeAI | null,
): Promise<EffectInfo[]> {
  return convertToEffectInfo(discName, element, skills, genAI)
}
