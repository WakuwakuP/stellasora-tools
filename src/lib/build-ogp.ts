/**
 * ビルドOGP画像URL生成ユーティリティ
 */

interface BuildOgpParams {
  /** ビルド名 */
  name?: string | null
  /** キャラクター名（3人） */
  characters: (string | null)[]
  /** メインロスレコID（3個） */
  mainLossRecords?: number[] | null
  /** サブロスレコID（3個） */
  subLossRecords?: number[] | null
}

/**
 * ビルド情報からOGP画像URLを生成する
 */
export function generateBuildOgpUrl(params: BuildOgpParams): string {
  const searchParams = new URLSearchParams()

  // ビルド名
  if (params.name) {
    searchParams.set('name', params.name)
  }

  // キャラクター（nullを除外）
  const characters = params.characters.filter(
    (char): char is string => char != null && char.trim() !== '',
  )
  if (characters.length > 0) {
    searchParams.set('characters', characters.join(','))
  }

  // メインロスレコ
  if (params.mainLossRecords && params.mainLossRecords.length > 0) {
    searchParams.set('mainLossRecords', params.mainLossRecords.join(','))
  }

  // サブロスレコ
  if (params.subLossRecords && params.subLossRecords.length > 0) {
    searchParams.set('subLossRecords', params.subLossRecords.join(','))
  }

  return `/api/build/ogp?${searchParams.toString()}`
}
