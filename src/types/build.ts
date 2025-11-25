/**
 * ステラソラ編成（ビルド）の型定義
 *
 * 編成構成:
 * - キャラクター: 主力1人、支援2人
 * - 素質: コア素質（最大2個）、サブ素質（主力6個、支援5個）、レベル1-6
 * - ロスレコ: メイン3つ、サブ3つ
 */

/** 素質のレベル（1-6） */
export type TalentLevel = 1 | 2 | 3 | 4 | 5 | 6

/** 素質情報 */
export interface Talent {
  /** 素質ID（0-indexed） */
  id: number
  /** レベル（1-6） */
  level: TalentLevel
}

/** キャラクターの素質構成 */
export interface CharacterTalents {
  /** コア素質（最大2個、4つから選択） */
  core: Talent[]
  /** サブ素質（主力6個、支援5個、12個から選択） */
  sub: Talent[]
}

/** キャラクター情報 */
export interface Character {
  /** キャラクター名 */
  name: string
  /** 素質 */
  talents: CharacterTalents
}

/** ロスレコ情報 */
export interface LossRecord {
  /** メインロスレコID（3つ） */
  main: number[]
  /** サブロスレコID（3つ） */
  sub: number[]
}

/** ビルド（編成）情報 */
export interface Build {
  /** 主力キャラクター */
  main: Character
  /** 支援キャラクター（2人） */
  supports: [Character, Character]
  /** ロスレコ */
  lossRecord: LossRecord
}

/** ビルドURLのパースエラー */
export class BuildParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BuildParseError'
  }
}
