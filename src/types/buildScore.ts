/**
 * ビルドスコア計算の型定義
 */

/**
 * キャラクター詳細データ（APIから取得）
 */
export interface CharacterDetail {
  /** キャラクターID */
  id: number
  /** キャラクター名 */
  name: string
  /** 素質データ */
  potentials?: {
    mainCore: PotentialEntry[]
    mainNormal: PotentialEntry[]
    supportCore: PotentialEntry[]
    supportNormal: PotentialEntry[]
    common: PotentialEntry[]
  }
}

/**
 * 素質エントリー
 */
export interface PotentialEntry {
  /** 素質名 */
  name: string
  /** 説明文 */
  description: string
  /** パラメータ */
  params: string[]
}

/**
 * ディスク詳細データ（APIから取得）
 */
export interface DiscDetail {
  /** ディスクID */
  id: number
  /** ディスク名 */
  name: string
  /** メインスキル */
  mainSkill: {
    name: string
    description: string
    params: string[][]
  }
  /** セカンダリスキル */
  secondarySkills: Array<{
    name: string
    description: string
    params: string[][]
  }>
}

/**
 * LLMで変換された効果データ
 */
export interface ParsedEffect {
  /** 効果名 */
  name: string
  /** 効果の種類（例: damage_increase, crit_rate, elemental_damage） */
  type: string
  /** 効果の値（パーセント表記の場合は数値のみ） */
  value: number
  /** 効果の単位（%, 秒など） */
  unit: string
  /** 持続時間（秒、永続の場合は-1） */
  duration: number
  /** 発動条件（なければnull） */
  condition: string | null
  /** スタック可能かどうか */
  stackable: boolean
  /** 最大スタック数 */
  maxStacks: number
}

/**
 * 素質の解析結果
 */
export interface ParsedTalent {
  /** 素質名 */
  talentName: string
  /** 解析された効果 */
  effects: ParsedEffect[]
}

/**
 * ディスクスキルの解析結果
 */
export interface ParsedDiscSkill {
  /** スキル名 */
  skillName: string
  /** 解析された効果 */
  effects: ParsedEffect[]
}

/**
 * ビルド構成（入力データ）
 */
export interface BuildConfiguration {
  /** キャラクター3人のID */
  characterIds: [number, number, number]
  /** メインディスク3つのID */
  discIds: [number, number, number]
}

/**
 * 戦闘シミュレーション結果
 */
export interface CombatSimulationResult {
  /** 基準ダメージ（効果なし） */
  baseDamage: number
  /** 実際のダメージ（効果あり） */
  actualDamage: number
  /** ダメージ増加率（%） */
  damageIncreaseRate: number
}

/**
 * 個別効果の評価結果
 */
export interface EffectEvaluation {
  /** 効果名 */
  effectName: string
  /** 効果の種類 */
  effectType: string
  /** 平均ダメージ増加率（%） */
  averageDamageIncrease: number
  /** 詳細なシミュレーション結果 */
  simulationResult: CombatSimulationResult
}

/**
 * ビルドスコア計算結果
 */
export interface BuildScoreResult {
  /** ビルドスコア（全効果の合計平均ダメージ増加率） */
  buildScore: number
  /** キャラクター別の効果評価 */
  characterEvaluations: Array<{
    characterId: number
    characterName: string
    talentEvaluations: EffectEvaluation[]
  }>
  /** ディスク別の効果評価 */
  discEvaluations: Array<{
    discId: number
    discName: string
    skillEvaluations: EffectEvaluation[]
  }>
  /** 計算日時 */
  calculatedAt: Date
}

/**
 * LLM変換のリクエストデータ
 */
export interface LLMConversionRequest {
  /** 素質またはスキルの説明文 */
  description: string
  /** パラメータ配列 */
  params: string[]
  /** キャラクター情報（コンテキスト） */
  characterInfo?: {
    name: string
    element: string
  }
}

/**
 * LLM変換のレスポンスデータ
 */
export interface LLMConversionResponse {
  /** 解析された効果リスト */
  effects: ParsedEffect[]
  /** 変換が成功したかどうか */
  success: boolean
  /** エラーメッセージ（失敗時） */
  error?: string
}
