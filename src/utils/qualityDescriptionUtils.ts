/**
 * 素質説明テキストの処理ユーティリティ
 *
 * StellaSoraAPIから取得した素質のdescriptionを表示用に整形する
 */

/**
 * 素質の説明文を処理してリッチな表示用テキストに変換する
 *
 * 処理内容:
 * 1. &ParamN& プレースホルダーを params 配列の値で置換（レベル1の値を使用）
 * 2. <color=#...>...</color> タグを削除
 * 3. ##テキスト#数字# 形式のリンク表現を「テキスト」のみに変換
 * 4. 特殊文字（絵文字など）を削除
 *
 * @param description - 元の説明文（&Param1&, &Param2&などを含む）
 * @param params - パラメータ配列（各要素は "/" 区切りでレベル1-9の値を含む）
 * @param targetLevel - 表示対象のレベル（デフォルト: 1）
 * @returns 処理済みの説明文
 *
 * @example
 * const description = "攻撃速度が<color=#ec6d21>&Param1&</color>上昇し、##風属性の印#1017#が付与される🔥"
 * const params = ["2.7%/3.6%/4.5%/5.4%/6.3%/7.2%/8.1%/9%/10%"]
 * processQualityDescription(description, params, 1)
 * // => "攻撃速度が2.7%上昇し、風属性の印が付与される"
 */
export function processQualityDescription(
  description: string,
  params?: string[],
  targetLevel = 1,
): string {
  let processed = description

  // 1. &ParamN& プレースホルダーを params 配列の値で置換
  if (params?.length) {
    processed = processed.replace(/&Param(\d+)&/g, (match, index) => {
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

  // 2. <color=#...>...</color> タグを削除（内容のみ残す）
  processed = processed.replace(/<color=#[^>]+>([^<]*)<\/color>/g, '$1')

  // 3. ##テキスト#数字# 形式のリンク表現を「テキスト」のみに変換
  processed = processed.replace(/##([^#]+)#\d+#/g, '$1')

  // 4. 特殊文字（絵文字）を削除
  // Unicode絵文字の範囲を削除
  processed = processed.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
    '',
  )

  return processed
}

/**
 * QualityCard での説明文の置換（既存の関数との互換性のため）
 *
 * @param description - 説明文（&Param1&, &Param2&などを含む）
 * @param params - パラメータ配列
 * @param targetLevel - 表示するレベル（1-9）
 * @returns 置換後の説明文（色タグやリンク表現も削除済み）
 */
export function replaceDescriptionWithLevel(
  description: string,
  params: string[] | undefined,
  targetLevel: number,
): string {
  return processQualityDescription(description, params, targetLevel)
}
