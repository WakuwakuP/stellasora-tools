/**
 * ロスレコ（Loss Record / Disc）データの型定義
 * StellaSoraAPI から取得するデータの型
 * @see https://github.com/torikushiii/StellaSoraAPI/blob/main/docs/discs.md
 */

/** ロスレコ一覧で取得する軽量データ */
export interface LossRecordListItem {
  /** ロスレコID */
  id: number
  /** ロスレコ名 */
  name: string
  /** アイコンのパス */
  icon: string
  /** ベース画像のパス */
  base: string
  /** 星の数（3-5） */
  star: number
  /** 属性 */
  element: string
}

/** サポート音符情報 */
export interface SupportNote {
  /** 音符名 */
  name: string
  /** 必要数 */
  quantity: number
}

/** スキルパラメータ */
export interface SkillParams {
  /** パラメータ配列（レベルごと） */
  params: string[][]
}

/** メインスキル情報 */
export interface MainSkill {
  /** スキル名 */
  name: string
  /** スキル説明（{1}, {2}等のプレースホルダーを含む） */
  description: string
  /** パラメータ配列（レベルごと） */
  params: string[][]
}

/** セカンダリスキルの要件 */
export interface SkillRequirement {
  /** 音符名 */
  name: string
  /** 必要数 */
  quantity: number
}

/** セカンダリスキル情報 */
export interface SecondarySkill {
  /** スキル名 */
  name: string
  /** スキル説明 */
  description: string
  /** パラメータ配列（レベルごと） */
  params: string[][]
  /** 要件配列（レベルごと） */
  requirements: SkillRequirement[][]
}

/** ステータス情報 */
export interface StatInfo {
  /** ステータスID (hp, atk, etc.) */
  id: string
  /** ステータス名 */
  label: string
  /** 値 */
  value: number
  /** 単位（%など、オプション） */
  unit?: string
}

/** ロスレコ詳細データ */
export interface LossRecordDetail {
  /** ロスレコID */
  id: number
  /** ロスレコ名 */
  name: string
  /** アイコンのパス */
  icon: string
  /** 背景画像のパス */
  background: string
  /** バリアント画像群 */
  variants: Record<string, string>
  /** 星の数（3-5） */
  star: number
  /** 属性 */
  element: string
  /** タグ（汎用、元素、必殺技など） */
  tag: string[]
  /** メインスキル */
  mainSkill: MainSkill
  /** セカンダリスキル配列 */
  secondarySkills: SecondarySkill[]
  /** サポート音符（レベルごと） */
  supportNote: SupportNote[][]
  /** ステータス（レベルごと） */
  stats: StatInfo[][]
}

/** 全ロスレコデータ（ID -> 詳細） */
export interface LossRecordData {
  [id: number]: LossRecordDetail
}

/** アプリケーション内で使用するロスレコ情報（簡略化） */
export interface LossRecordInfo {
  /** ロスレコID */
  id: number
  /** ロスレコ名 */
  name: string
  /** アイコンURL */
  iconUrl: string
  /** 星の数（3-5） */
  star: number
  /** 属性 */
  element: string
  /** メインスキル名 */
  mainSkillName: string
  /** メインスキル説明（最大レベル時） */
  mainSkillDescription: string
  /** サポート音符（最大レベル時） - サブロスレコ用 */
  supportNote: SupportNote[]
  /** セカンダリスキルの必要音符（最大レベル時） - メインロスレコ用 */
  secondarySkillNotes: SupportNote[]
  /** 最大レベル時のステータス */
  maxStats: StatInfo[]
}
