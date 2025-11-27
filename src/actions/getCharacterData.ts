'use server'

import { unstable_cache } from 'next/cache'
import { type CharacterQualities, type QualitiesData } from 'types/quality'

/**
 * StellaSoraAPI からキャラクターデータを取得する Server Action
 *
 * 注意: 現在のStellaSoraAPI (/stella/character) は talents を main/support 形式で
 * 返さないため、ローカルの qualities.json を使用しています。
 * 将来的にAPIが対応した場合は、APIからのデータ取得に切り替えることができます。
 */

/** キャッシュ時間（4時間 = 14400秒） */
const CACHE_REVALIDATE_SECONDS = 14400

// ============================================================================
// ローカルデータ読み込み
// ============================================================================

/**
 * ローカルのqualities.jsonからデータを読み込む
 */
async function loadLocalQualitiesData(): Promise<QualitiesData> {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')

  const filePath = path.join(
    process.cwd(),
    'public',
    'datasets',
    'qualities.json',
  )
  const data = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(data) as QualitiesData
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * 素質データを取得する Server Action
 *
 * - unstable_cacheを使用して4時間キャッシュする
 * - ローカルのqualities.jsonを使用（StellaSoraAPIのtalentsフォーマットが異なるため）
 *
 * @see https://github.com/torikushiii/StellaSoraAPI/blob/main/docs/characters.md
 */
export async function getQualitiesData(): Promise<QualitiesData> {
  const cachedFetch = unstable_cache(
    loadLocalQualitiesData,
    ['qualities-data'],
    { revalidate: CACHE_REVALIDATE_SECONDS },
  )

  return cachedFetch()
}

/**
 * キャラクター名一覧を取得する Server Action
 */
export async function getCharacterNames(): Promise<string[]> {
  const cachedFetch = unstable_cache(
    async (): Promise<string[]> => {
      const qualitiesData = await loadLocalQualitiesData()
      return Object.keys(qualitiesData)
    },
    ['character-names'],
    { revalidate: CACHE_REVALIDATE_SECONDS },
  )

  return cachedFetch()
}

/**
 * 利用可能なキャラクターデータのみを抽出
 * main と sub の両方が存在し、かつ要素を持つキャラクターのみを返す
 */
export async function getAvailableCharacters(): Promise<
  Record<string, CharacterQualities>
> {
  const qualitiesData = await getQualitiesData()

  return Object.entries(qualitiesData).reduce(
    (acc, [name, qualities]) => {
      if (
        qualities.main &&
        qualities.main.length > 0 &&
        qualities.sub &&
        qualities.sub.length > 0
      ) {
        acc[name] = qualities
      }
      return acc
    },
    {} as Record<string, CharacterQualities>,
  )
}
