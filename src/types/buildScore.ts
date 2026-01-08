/**
 * ビルドスコア計算関連の型定義
 */

/** 効果の種類 */
export type EffectType =
  | 'damage_increase' // 全体的なダメージ増加
  | 'damage_normal_attack' // 通常攻撃ダメージ増加
  | 'damage_skill' // スキルダメージ増加
  | 'damage_ultimate' // 必殺技ダメージ増加
  | 'damage_mark' // 印ダメージ増加
  | 'damage_elemental' // 属性ダメージ増加
  | 'damage_additional' // 追撃ダメージ
  | 'atk_increase' // 攻撃力増加
  | 'speed_increase' // 速度増加
  | 'cooldown_reduction' // クールダウン減少
  | 'crit_rate' // 会心率増加
  | 'crit_damage' // 会心ダメージ増加
  | 'damage_taken_increase' // 被ダメージ増加（敵に付与するデバフ）
  | 'def_decrease' // 防御力減少（敵に付与するデバフ）

/** 効果量の単位 */
export type EffectUnit = '%' | '回' | '秒'

/** 効果情報 */
export interface EffectInfo {
  /** 効果名（スキル名または素質名） */
  name: string
  /** 効果の種類 */
  type: EffectType
  /** 効果量 */
  value: number
  /** 単位 */
  unit: EffectUnit
  /** 効果時間（秒） */
  uptime: number
  /** クールダウン時間（秒） */
  cooldown: number
  /** 重複上限（記載がなければ1） */
  maxStacks: number
  /** レベル（素質の場合のみ、1-6） */
  level?: number
}

/** 戦闘シミュレーションのアクション */
export interface CombatAction {
  /** アクション名 */
  name: string
  /** アクションの種類 */
  type: 'normal_attack' | 'skill' | 'ultimate'
  /** 実行時刻（秒） */
  time: number
  /** 実行時間（秒） */
  duration: number
}

/** 戦闘シミュレーション結果 */
export interface CombatSimulationResult {
  /** アクション履歴 */
  actions: CombatAction[]
  /** 総ダメージ */
  totalDamage: number
  /** 各効果のアップタイムカバレッジ（0-1） */
  effectUptime: Record<string, number>
  /** シミュレーション時間（秒） */
  duration: number
}

/** 効果の平均ダメージ増加率 */
export interface EffectDamageIncrease {
  /** 効果名 */
  name: string
  /** 効果の種類 */
  type: EffectType
  /** 平均ダメージ増加率（%） */
  averageIncrease: number
  /** アップタイムカバレッジ（0-1） */
  uptimeCoverage: number
  /** キャラクター名（素質の場合） */
  characterName?: string
  /** 素質インデックス（素質の場合） */
  talentIndex?: number
  /** レベル（素質の場合、1-6） */
  level?: number
  /** ソースタイプ（素質 or ロスレコ） */
  sourceType?: 'talent' | 'lossreco'
}

/** ビルドスコア */
export interface BuildScore {
  /** 総合スコア */
  totalScore: number
  /** 各効果の貢献度 */
  effectContributions: EffectDamageIncrease[]
  /** シミュレーション結果 */
  simulation: CombatSimulationResult
}

/** ビルド評価用の入力データ */
export interface BuildEvaluationInput {
  /** キャラクターID（3人分） */
  characterIds: [number, number, number]
  /** ロスレコID（3つ分） */
  discIds: [number, number, number]
  /** 選択された素質情報（レベル含む） */
  selectedTalents?: Array<{
    characterId: number
    talentIndex: number
    level: number
  }>
}

/** 素質レベル別のスコア */
export interface TalentLevelScore {
  /** 素質名 */
  talentName: string
  /** キャラクターID */
  characterId: number
  /** 素質インデックス */
  talentIndex: number
  /** レベル */
  level: number
  /** 平均ダメージ増加率（%） */
  averageIncrease: number
}
