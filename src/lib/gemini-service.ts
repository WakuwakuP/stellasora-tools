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
 * レート制限管理用の変数
 */
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1000 // 最小リクエスト間隔（ミリ秒）
let remainingRequests: number | null = null
let resetTime: number | null = null

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
 * レート制限に基づいてスロットリング
 */
async function throttleRequest(): Promise<void> {
  const now = Date.now()

  // レート制限の残りリクエスト数をチェック
  if (remainingRequests !== null && remainingRequests <= 0) {
    if (resetTime && resetTime > now) {
      const waitTime = resetTime - now
      console.log(`Rate limit reached. Waiting ${waitTime}ms until reset.`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      // リセット後は残りリクエスト数をクリア
      remainingRequests = null
      resetTime = null
    }
  }

  // 最小リクエスト間隔を確保
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }

  lastRequestTime = Date.now()
}

/**
 * レスポンスヘッダーからレート制限情報を更新
 */
function updateRateLimitInfo(_response: {
  response: { usageMetadata?: unknown }
}): void {
  // Gemini APIのレスポンスにはレート制限情報がusageMetadataに含まれる可能性がある
  // 実際のヘッダー情報は取得できないため、保守的なアプローチを取る
  const now = Date.now()

  // レート制限に達した場合は1秒待機するように設定
  if (remainingRequests !== null) {
    remainingRequests -= 1
    if (remainingRequests <= 0) {
      resetTime = now + 60000 // 1分後にリセット
    }
  }
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
    // レート制限に基づいてスロットリング
    await throttleRequest()

    const ai = getGenAI()
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = generatePrompt(request)
    const result = await model.generateContent(prompt)
    const response = await result.response

    // レート制限情報を更新
    updateRateLimitInfo(result)

    const text = response.text()
    const effects = parseGeminiResponse(text)

    return {
      effects,
      success: true,
    }
  } catch (error) {
    console.error('Error in convertDescriptionToJSON:', error)

    // レート制限エラーの場合は特別な処理
    if (error instanceof Error && error.message.includes('429')) {
      console.warn('Rate limit exceeded, will retry with backoff')
      // 次回のリクエストで自動的にスロットリングされる
      remainingRequests = 0
      resetTime = Date.now() + 60000
    }

    return {
      effects: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false,
    }
  }
}

/**
 * 複数の説明を一括変換（順次実行でレート制限を回避）
 */
export async function convertMultipleDescriptions(
  requests: LLMConversionRequest[],
): Promise<LLMConversionResponse[]> {
  // レート制限を考慮して順次実行
  const results: LLMConversionResponse[] = []
  for (const request of requests) {
    const result = await convertDescriptionToJSON(request)
    results.push(result)
  }
  return results
}
