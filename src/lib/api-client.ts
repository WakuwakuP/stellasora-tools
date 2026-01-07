/**
 * StellaSora APIからキャラクターとディスクのデータを取得するクライアント
 */

const API_BASE_URL = 'https://api.ennead.cc'
const CACHE_REVALIDATE_SECONDS = 14400 // 4時間

/**
 * キャラクター詳細を取得
 */
export async function fetchCharacterById(
  characterId: number,
  lang = 'JP',
  // biome-ignore lint/suspicious/noExplicitAny: API response type is dynamic
): Promise<any> {
  const url = `${API_BASE_URL}/stella/character/${characterId}?lang=${lang}`

  const response = await fetch(url, {
    next: { revalidate: CACHE_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch character ${characterId}: ${response.status}`,
    )
  }

  return response.json()
}

/**
 * ディスク詳細を取得
 */
export async function fetchDiscById(
  discId: number,
  lang = 'JP',
  // biome-ignore lint/suspicious/noExplicitAny: API response type is dynamic
): Promise<any> {
  const url = `${API_BASE_URL}/stella/disc/${discId}?lang=${lang}`

  const response = await fetch(url, {
    next: { revalidate: CACHE_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch disc ${discId}: ${response.status}`)
  }

  return response.json()
}

/**
 * 複数のキャラクターを並行して取得
 */
export async function fetchCharactersByIds(
  characterIds: number[],
  lang = 'JP',
  // biome-ignore lint/suspicious/noExplicitAny: API response type is dynamic
): Promise<any[]> {
  const promises = characterIds.map((id) => fetchCharacterById(id, lang))
  return Promise.all(promises)
}

/**
 * 複数のディスクを並行して取得
 */
export async function fetchDiscsByIds(
  discIds: number[],
  lang = 'JP',
  // biome-ignore lint/suspicious/noExplicitAny: API response type is dynamic
): Promise<any[]> {
  const promises = discIds.map((id) => fetchDiscById(id, lang))
  return Promise.all(promises)
}
