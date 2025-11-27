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
  /** 素質の名前 */
  title: string
}

/** キャラクターの素質データ（主力/支援） */
export interface CharacterQualities {
  /** 主力用素質（16個） */
  main: QualityInfo[]
  /** 支援用素質（16個） */
  sub: QualityInfo[]
}

/** 全キャラクターの素質データ */
export interface QualitiesData {
  [characterName: string]: CharacterQualities
}
