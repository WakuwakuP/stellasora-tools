/**
 * 素質説明テキストの処理ユーティリティ
 *
 * StellaSoraAPIから取得した素質のdescriptionを表示用に整形する
 */

/**
 * サーバーサイドで素質の説明文から不要な文字を削除する
 *
 * 処理内容:
 * 1. <color=#...>...</color> タグを削除（内容のみ残す）
 * 2. ##テキスト#数字# 形式のリンク表現を「テキスト」のみに変換
 * 3. 特殊文字（絵文字など）を削除
 *
 * @param description - 元の説明文（&Param1&などのプレースホルダーは保持）
 * @returns 処理済みの説明文（&Param1&などのプレースホルダーは残る）
 *
 * @example
 * const description = "攻撃速度が<color=#ec6d21>&Param1&</color>上昇し、##風属性の印#1017#が付与される🔥"
 * cleanQualityDescription(description)
 * // => "攻撃速度が&Param1&上昇し、風属性の印が付与される"
 */
export function cleanQualityDescription(description: string): string {
  let processed = description

  // 1. <color=#...>...</color> タグを削除（内容のみ残す）
  processed = processed.replace(/<color=#[^>]+>([^<]+)<\/color>/g, '$1')

  // 2. ##テキスト#数字# 形式のリンク表現を「テキスト」のみに変換
  processed = processed.replace(/##([^#]+)#\d+#/g, '$1')

  // 3. 特殊文字（絵文字）を削除
  // Unicode絵文字の主要な範囲を削除
  processed = processed.replace(
    /[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F1E0}-\u{1F1FF}]/gu,
    '',
  )

  return processed
}

/**
 * クライアントサイドで素質の説明文の&ParamN&プレースホルダーを指定レベルの値で置換する
 *
 * @param description - 説明文（&Param1&, &Param2&などを含む）
 * @param params - パラメータ配列（各要素は "/" 区切りでレベル1-9の値を含む）
 * @param targetLevel - 表示するレベル（1-9）
 * @returns 置換後の説明文
 *
 * @example
 * const description = "攻撃速度が&Param1&上昇し、風属性の印が付与される"
 * const params = ["2.7%/3.6%/4.5%/5.4%/6.3%/7.2%/8.1%/9%/10%"]
 * replaceDescriptionWithLevel(description, params, 3)
 * // => "攻撃速度が4.5%上昇し、風属性の印が付与される"
 */
export function replaceDescriptionWithLevel(
  description: string,
  params: string[] | undefined,
  targetLevel: number,
): string {
  if (!params?.length) {
    return description
  }

  return description.replace(/&Param(\d+)&/g, (match, index) => {
    const paramIndex = Number.parseInt(index, 10) - 1
    if (paramIndex >= params.length) {
      return match
    }

    const param = params[paramIndex]
    // "/" 区切りの場合、targetLevel に応じた値を取得
    if (param.includes('/')) {
      const values = param.split('/')
      const levelIndex = Math.min(targetLevel - 1, values.length - 1)
      return values[levelIndex]?.trim() ?? match
    }

    // "/" 区切りでない場合はそのまま返す
    return param
  })
}
