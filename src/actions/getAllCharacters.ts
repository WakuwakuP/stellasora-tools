'use server'

import { unstable_cache } from 'next/cache'

export interface CharacterListItem {
  id: number
  name: string
}

/**
 * キャラクター一覧を取得する Server Action
 *
 * @returns キャラクター一覧
 */
export async function getAllCharacters(): Promise<CharacterListItem[]> {
  return await unstable_cache(
    async () => {
      const response = await fetch(
        'https://api.ennead.cc/stella/characters?lang=JP',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch characters: ${response.statusText}`)
      }

      const characters = await response.json()
      return characters as CharacterListItem[]
    },
    ['characters-list'],
    {
      revalidate: 60 * 60 * 4, // 4時間キャッシュ
      tags: ['characters-list'],
    },
  )()
}

/**
 * キャラクター名からIDを取得する
 *
 * @param name - キャラクター名
 * @returns キャラクターID（見つからない場合は null）
 */
export async function getCharacterIdByName(
  name: string,
): Promise<number | null> {
  try {
    const characters = await getAllCharacters()
    const character = characters.find((c) => c.name === name)
    return character?.id ?? null
  } catch (error) {
    console.error('Failed to get character ID:', error)
    return null
  }
}
