/**
 * 素質（Quality）データの型定義
 * StellaSoraAPI から取得するデータの型
 * @see https://github.com/torikushiii/StellaSoraAPI/blob/main/docs/characters.md
 */

/** 個々の素質情報 */
export interface QualityInfo {
  /** 素質の説明 */
  description: string
  /** 素質画像のファイルパス */
  fileName: string
  /** コア素質かどうか */
  isCore: boolean
  /** 素質のパラメータ（説明文の&ParamN&を置換する値） */
  params?: string[]
  /** 素質のレアリティ（1または2） */
  rarity: number
  /** 素質の名前 */
  title: string
}

/** キャラクターの素質データ（主力/支援） */
export interface CharacterQualities {
  /** キャラクターの属性（Fire, Water, Wind, Earth, Light, Dark） */
  element?: string
  /** キャラクターアイコンのURL */
  icon?: string
  /** 主力用素質（16個） */
  main: QualityInfo[]
  /** キャラクターのロール（Attacker, Balancer, Supporter） */
  position?: string
  /** 支援用素質（16個） */
  sub: QualityInfo[]
}

/** 全キャラクターの素質データ */
export interface QualitiesData {
  [characterName: string]: CharacterQualities
}
