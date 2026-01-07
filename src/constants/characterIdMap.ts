/**
 * キャラクター名とIDのマッピング
 * StellaSora APIから取得したデータに基づく
 */

export const CHARACTER_NAME_TO_ID_MAP: Record<string, number> = {
  アヤメ: 111,
  アンズ: 123,
  カシミラ: 108,
  カナーチェ: 120,
  キャラメル: 147,
  クルニス: 118,
  グレイ: 149,
  コゼット: 142,
  コハク: 103,
  シア: 155,
  シーミャオ: 113,
  ジンリン: 117,
  セイナ: 112,
  チトセ: 144,
  チーシア: 141,
  ティリア: 107,
  テレサ: 127,
  ナズナ: 156,
  ナツカ: 133,
  ナノハ: 119,
  フユカ: 134,
  フリージア: 125,
  フローラ: 126,
  ミスティ: 135,
  ミネルバ: 132,
  ラール: 150,
  レイセン: 116,
  聖夜ラール: 158,
}

/**
 * キャラクター名からIDを取得
 * @param name キャラクター名
 * @returns キャラクターID（見つからない場合は0）
 */
export function getCharacterIdByName(name: string): number {
  return CHARACTER_NAME_TO_ID_MAP[name] ?? 0
}

/**
 * 複数のキャラクター名からIDリストを取得
 * @param names キャラクター名の配列
 * @returns キャラクターIDの配列（見つからないものは除外）
 */
export function getCharacterIdsByNames(names: string[]): number[] {
  return names.map((name) => getCharacterIdByName(name)).filter((id) => id > 0)
}
