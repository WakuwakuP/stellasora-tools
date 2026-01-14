'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { unstable_cache } from 'next/cache'
import { type EffectInfo } from 'types/buildScore'

/** Gemini API Key */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? ''

/** キャッシュ時間（7日間 = 604800秒） */
const CACHE_REVALIDATE_SECONDS = 604800

/** JSON抽出用の正規表現 */
const JSON_EXTRACT_REGEX = /```json\s*([\s\S]*?)\s*```/

/** 常時発動効果のデフォルト稼働時間（秒） */
const DEFAULT_PERMANENT_UPTIME = 999999

/** キャッシュキーの表示長 */
const CACHE_KEY_DISPLAY_LENGTH = 80

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. LLM features will not be available.')
}

/**
 * プロンプトテンプレート
 * キャラクターステータス、スキル情報、素質情報を含む
 */
const EFFECT_EXTRACTION_PROMPT = `あなたはステラソラというゲームのスキルや素質の効果を解析するAIです。
与えられたキャラクター情報（Lv90ステータス、スキルLv10説明）と素質の説明文から、各レベルの効果を以下のJSON形式に変換してください。

【出力形式】
必ずJSON配列を返してください。説明文や補足は不要です。
素質にレベルがある場合は、レベル1からレベル6までの効果をすべて出力してください。
レベルがない場合（コア素質など）は1つだけ出力してください。

\`\`\`json
[
  {
    "name": "効果名（素質名）",
    "type": "効果の種類",
    "value": 効果量（数値）,
    "unit": "効果量の単位（%、回、秒のいずれか）",
    "uptime": 効果時間（秒、常時発動の場合は999999）,
    "cooldown": 次に効果が発動するまでの時間（秒、常時発動の場合は0）,
    "maxStacks": 重複上限（記載がなければ1）,
    "level": レベル（1-6、レベルがない場合は1）
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
- レベルによって効果量が変化する場合は、各レベルごとに別々のオブジェクトを出力してください
- 効果時間やクールダウンが記載されていない場合は、スキル情報のクールダウンを参考にして推測してください
- 常時発動の効果はuptime=999999、cooldown=0としてください
- 数値が明記されていない効果は無視してください
- レベルがない素質（コア素質など）はlevel=1として1つだけ出力してください
- キャラクターステータス（HP、ATK）とスキル情報を参考に、効果量を正確に解析してください

【入力データ】
`

/**
 * キャラクターの詳細情報型（ステータスとスキル情報を含む）
 */
export interface CharacterStats {
  /** Lv90時点のHP */
  hp_lv90: number
  /** Lv90時点のATK */
  atk_lv90: number
}

export interface SkillInfo {
  /** スキル名 */
  name: string
  /** スキルLv10時点の数値を当てはめた説明テキスト */
  description: string
  /** クールダウン（秒、通常攻撃の場合は0） */
  cooldown?: number
  /** スキル種別 */
  type: 'normal' | 'main_skill' | 'support_skill' | 'ultimate'
}

/**
 * 効果抽出のオプション
 */
export interface ExtractEffectsOptions {
  characterName: string
  element: string
  characterStats: CharacterStats
  skills: SkillInfo[]
  talentName: string
  talentDescription: string
}

/**
 * 効果情報を正規化する（デフォルト値を設定し、NaNを防ぐ）
 */
function normalizeEffectInfo(
  effect: Partial<EffectInfo>,
  talentName: string,
): EffectInfo {
  return {
    cooldown:
      typeof effect.cooldown === 'number' && !Number.isNaN(effect.cooldown)
        ? effect.cooldown
        : 0,
    level:
      typeof effect.level === 'number' && !Number.isNaN(effect.level)
        ? effect.level
        : 1,
    maxStacks:
      typeof effect.maxStacks === 'number' && !Number.isNaN(effect.maxStacks)
        ? effect.maxStacks
        : 1,
    name: effect.name || talentName,
    type: effect.type || 'damage_increase',
    unit: effect.unit || '%',
    uptime:
      typeof effect.uptime === 'number' && !Number.isNaN(effect.uptime)
        ? effect.uptime
        : DEFAULT_PERMANENT_UPTIME,
    value:
      typeof effect.value === 'number' && !Number.isNaN(effect.value)
        ? effect.value
        : 0,
  }
}

/**
 * Gemini AI を使用して素質情報を効果情報に変換する
 * キャラクターステータス、スキル情報（Lv10）を含む
 *
 * @param options - 効果抽出のオプション
 * @returns 効果情報の配列（レベル1-6を含む）
 */
async function extractEffectsWithGemini(
  options: ExtractEffectsOptions,
): Promise<EffectInfo[]> {
  const {
    characterName,
    element,
    characterStats,
    skills,
    talentName,
    talentDescription,
  } = options

  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

  // プロンプトを構築
  const inputData = {
    character: {
      element,
      name: characterName,
      stats_lv90: characterStats,
    },
    skills_lv10: skills,
    talent: {
      description: talentDescription,
      name: talentName,
    },
  }

  const prompt = `${EFFECT_EXTRACTION_PROMPT}
${JSON.stringify(inputData, null, 2)}
`

  // LLMリクエストのログ出力
  console.log(
    `[LLM Request] キャラクター: ${characterName}, 素質/スキル: ${talentName}`,
  )

  try {
    // Gemini 2.0 Flash Lite を使用
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // JSON部分を抽出（```json ... ``` で囲まれている場合に対応）
    const jsonMatch = text.match(JSON_EXTRACT_REGEX)
    const jsonText = jsonMatch ? jsonMatch[1] : text

    // JSONをパース
    const rawEffects = JSON.parse(jsonText) as EffectInfo[]

    // 型チェック
    if (!Array.isArray(rawEffects)) {
      throw new Error('Invalid response format: expected array')
    }

    // 各効果のデフォルト値を設定し、NaNを防ぐ
    const effects: EffectInfo[] = rawEffects.map((effect) =>
      normalizeEffectInfo(effect, talentName),
    )

    // LLMレスポンスのログ出力
    console.log(`[LLM Response] ${talentName}: ${effects.length}件の効果を抽出`)
    for (const effect of effects) {
      console.log(
        `  - Lv${effect.level}: ${effect.type} +${effect.value}${effect.unit} (uptime: ${effect.uptime}s, cd: ${effect.cooldown}s)`,
      )
    }

    return effects
  } catch (error) {
    console.error('Failed to extract talent effects with Gemini:', error)
    throw new Error('素質効果情報の抽出に失敗しました')
  }
}

/**
 * 素質情報から効果情報を抽出するServer Action（キャッシュ付き）
 * キャラクターステータス（Lv90）とスキル情報（Lv10）を含む
 *
 * @param options - 効果抽出のオプション
 * @returns 効果情報の配列（レベル1-6を含む）
 */
export async function extractTalentEffects(
  options: ExtractEffectsOptions,
): Promise<EffectInfo[]> {
  // 説明文のハッシュを生成（キャッシュキー用）
  // 同じ説明文であれば同じキャッシュを使う
  const descriptionHash = Buffer.from(options.talentDescription).toString(
    'base64url',
  )

  // キャッシュキーを生成（説明文ハッシュを含む）
  const cacheKey = `talent-effects:${options.characterName}:${options.talentName}:${descriptionHash}`

  // リクエスト受信のログ（キャッシュキーも表示）
  console.log(
    `[extractTalentEffects] キャラクター: ${options.characterName}, 素質/スキル: ${options.talentName}, キャッシュキー: ${cacheKey.substring(0, CACHE_KEY_DISPLAY_LENGTH)}...`,
  )

  // unstable_cacheでキャッシュ付き関数を作成
  // 第2引数のkeyPartsにキャッシュキーを渡すことで、同じキーなら同じキャッシュを使う
  const cachedExtract = unstable_cache(
    async (extractOptions: ExtractEffectsOptions) =>
      extractEffectsWithGemini(extractOptions),
    [cacheKey],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: ['talent-effects', cacheKey],
    },
  )

  return cachedExtract(options)
}
