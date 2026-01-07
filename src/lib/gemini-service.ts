/**
 * Gemini AIを使用してスキル説明をJSON形式に変換するサービス
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  type LLMConversionRequest,
  type LLMConversionResponse,
  type ParsedEffect,
} from 'types/buildScore'

/**
 * JSON抽出用の正規表現
 */
const JSON_BLOCK_REGEX = /```json\s*([\s\S]*?)\s*```/

/**
 * Gemini AIクライアントのシングルトンインスタンス
 */
let genAI: GoogleGenerativeAI | null = null

/**
 * Gemini AIクライアントを初期化
 */
function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

/**
 * プロンプトを生成
 */
function generatePrompt(request: LLMConversionRequest): string {
  const { description, params, characterInfo } = request

  // パラメータを説明文に適用
  let processedDescription = description
  for (let i = 0; i < params.length; i++) {
    processedDescription = processedDescription.replace(
      new RegExp(`[&{]Param${i + 1}[}&]`, 'g'),
      params[i] || '',
    )
  }

  // HTMLタグを削除
  processedDescription = processedDescription.replace(/<[^>]*>/g, '')

  const contextInfo = characterInfo
    ? `キャラクター名: ${characterInfo.name}\n属性: ${characterInfo.element}\n\n`
    : ''

  return `${contextInfo}以下のステラソラのスキル/素質説明を解析し、JSON形式で効果を抽出してください。

スキル説明:
${processedDescription}

以下のJSON形式で出力してください（必ずJSONのみを出力し、説明文は含めないでください）:
{
  "effects": [
    {
      "name": "効果の名前",
      "type": "効果の種類（damage_increase, crit_rate, crit_damage, elemental_damage, atk_increase, def_increase, speed_increase, healing, shieldなど）",
      "value": 数値（パーセントの場合は数値のみ、例: 10% → 10）,
      "unit": "単位（%, 秒, 回など）",
      "duration": 持続時間（秒、永続の場合は-1）,
      "condition": "発動条件（なければnull）",
      "stackable": true/false（スタック可能かどうか）,
      "maxStacks": 最大スタック数（スタックできない場合は1）
    }
  ]
}

注意事項:
- 効果が複数ある場合は配列に複数含めてください
- 数値は必ず数字型で出力してください
- conditionがない場合はnullを設定してください
- 必ずJSON形式で出力してください（説明文やマークダウンは含めないでください）`
}

/**
 * Gemini AIのレスポンスをパース
 */
function parseGeminiResponse(responseText: string): ParsedEffect[] {
  try {
    // JSONブロックを抽出（```json ... ```の場合）
    const jsonMatch = responseText.match(JSON_BLOCK_REGEX)
    const jsonText = jsonMatch ? jsonMatch[1] : responseText

    // JSONをパース
    const parsed = JSON.parse(jsonText.trim())

    // effectsプロパティが存在することを確認
    if (!(parsed.effects && Array.isArray(parsed.effects))) {
      throw new Error('Invalid response format: missing effects array')
    }

    return parsed.effects as ParsedEffect[]
  } catch (error) {
    console.error('Failed to parse Gemini response:', error)
    console.error('Response text:', responseText)
    throw new Error('Failed to parse LLM response')
  }
}

/**
 * スキル/素質説明をJSON形式に変換
 */
export async function convertDescriptionToJSON(
  request: LLMConversionRequest,
): Promise<LLMConversionResponse> {
  try {
    const ai = getGenAI()
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = generatePrompt(request)
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const effects = parseGeminiResponse(text)

    return {
      effects,
      success: true,
    }
  } catch (error) {
    console.error('Error in convertDescriptionToJSON:', error)
    return {
      effects: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false,
    }
  }
}

/**
 * 複数の説明を一括変換（並列実行）
 */
export async function convertMultipleDescriptions(
  requests: LLMConversionRequest[],
): Promise<LLMConversionResponse[]> {
  const promises = requests.map((request) => convertDescriptionToJSON(request))
  return Promise.all(promises)
}
