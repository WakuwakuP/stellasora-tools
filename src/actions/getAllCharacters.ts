'use server'

import { unstable_cache } from 'next/cache'

const STELLA_SORA_API_BASE_URL = 'https://api.ennead.cc'

/**
 * キャラクター一覧の型定義
 */
interface Character {
  id: number
  name: string
}

/**
 * キャラクター一覧を取得する（キャッシュ付き）
 * @returns キャラクター一覧
 */
async function fetchAllCharacters(): Promise<Character[]> {
  const response = await fetch(
    `${STELLA_SORA_API_BASE_URL}/stella/characters?lang=JP`,
    {
      next: { revalidate: 14400 }, // 4時間キャッシュ
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch characters: ${response.statusText}`)
  }

  return response.json()
}

/**
 * キャラクター一覧を取得する Server Action
 * @returns キャラクター一覧
 */
export const getAllCharacters = unstable_cache(
  fetchAllCharacters,
  ['all-characters'],
  {
    revalidate: 14400, // 4時間
    tags: ['characters'],
  },
)

/**
 * キャラクター名からIDを取得する Server Action
 * @param name キャラクター名
 * @returns キャラクターID（見つからない場合はnull）
 */
export async function getCharacterIdByName(
  name: string,
): Promise<number | null> {
  try {
    const characters = await getAllCharacters()
    const character = characters.find((c) => c.name === name)
    return character?.id ?? null
  } catch (error) {
    console.error('Failed to get character ID by name:', error)
    return null
  }
}
