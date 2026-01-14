'use server'

import { unstable_cache } from 'next/cache'

/** API Base URL */
const STELLA_SORA_API_BASE_URL = 'https://api.ennead.cc'

/** キャッシュ時間（4時間 = 14400秒） */
const CACHE_REVALIDATE_SECONDS = 14400

/**
 * キャラクター情報の型
 */
export interface CharacterDetail {
  element: string
  id: number
  name: string
  potentials: {
    common: Array<{ description: string; name: string }>
    mainCore: Array<{ description: string; name: string }>
    mainNormal: Array<{ description: string; name: string }>
    supportCore: Array<{ description: string; name: string }>
    supportNormal: Array<{ description: string; name: string }>
  }
  /** キャラクターステータス（Lv90時点） */
  stats?: {
    hp_lv90: number
    atk_lv90: number
  }
  /** スキル情報 */
  skills?: {
    normal?: {
      name?: string
      description?: string
      description_lv10?: string
    }
    main?: {
      name?: string
      description?: string
      description_lv10?: string
      cooldown?: number
    }
    support?: {
      name?: string
      description?: string
      description_lv10?: string
      cooldown?: number
    }
    ultimate?: {
      name?: string
      description?: string
      description_lv10?: string
      cooldown?: number
    }
  }
}

/**
 * キャラクター情報を取得するServer Action
 *
 * @param characterId - キャラクターID
 * @param lang - 言語（デフォルト: JP）
 * @returns キャラクター詳細情報
 */
export async function getCharacterInfo(
  characterId: number,
  lang = 'JP',
): Promise<CharacterDetail> {
  const cacheKey = `character-info:${characterId}:${lang}`

  const cachedFunction = unstable_cache(
    async () => {
      const url = `${STELLA_SORA_API_BASE_URL}/stella/character/${characterId}?lang=${lang}`

      const response = await fetch(url, {
        next: { revalidate: CACHE_REVALIDATE_SECONDS },
      })

      if (!response.ok) {
        throw new Error(
          `Failed to fetch character info: ${response.status} for character ${characterId}`,
        )
      }

      return response.json() as Promise<CharacterDetail>
    },
    [cacheKey],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: ['character-info', cacheKey],
    },
  )

  return cachedFunction()
}
