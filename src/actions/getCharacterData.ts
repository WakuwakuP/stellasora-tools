'use server'

import { unstable_cache } from 'next/cache'
import {
  type CharacterQualities,
  type QualitiesData,
  type QualityInfo,
} from 'types/quality'

/**
 * StellaSoraAPI からキャラクターデータを取得する Server Action
 *
 * APIドキュメント: https://github.com/torikushiii/StellaSoraAPI/tree/main/docs
 *
 * 利用可能なエンドポイント:
 * - GET /stella/characters?lang=JP - キャラクター一覧（軽量版）
 * - GET /stella/character/{idOrName}?lang=JP - キャラクター詳細（potentials含む）
 *
 * langパラメータ: EN, JP, KR, CN, TW（デフォルト: EN）
 */

/** API Base URL */
const STELLA_SORA_API_BASE_URL = 'https://api.ennead.cc'

/** キャッシュ時間（4時間 = 14400秒） */
const CACHE_REVALIDATE_SECONDS = 14400

// ============================================================================
// API Response Types（docs/characters.md に基づく）
// ============================================================================

/**
 * キャラクター一覧レスポンス（GET /stella/characters）
 */
interface ApiCharacterListItem {
  id: number
  name: string
  icon: string
  portrait: string
  description: string
  grade: number
  element: string
  position: string
  attackType: string
  style: string
  faction: string
  tags: string[]
}

/**
 * 個々のポテンシャル（potential）情報
 */
interface ApiPotentialEntry {
  name: string
  icon: string
  description: string
  shortDescription: string
  params: string[]
  rarity: number
  stype: number
  corner: number | null
  hints?: Record<string, unknown>
}

/**
 * キャラクターのポテンシャルデータ
 * potentials.mainCore + potentials.mainNormal + potentials.common = main (16)
 * potentials.supportCore + potentials.supportNormal + potentials.common = sub (16)
 */
interface ApiPotentials {
  mainCore: ApiPotentialEntry[]
  mainNormal: ApiPotentialEntry[]
  supportCore: ApiPotentialEntry[]
  supportNormal: ApiPotentialEntry[]
  common: ApiPotentialEntry[]
}

/**
 * キャラクター詳細レスポンス（GET /stella/character/{idOrName}）
 */
interface ApiCharacterDetail {
  id: number
  name: string
  icon: string
  portrait: string
  background: string
  variants: Record<string, string>
  description: string
  grade: number
  element: string
  position: string
  attackType: string
  style: string
  faction: string
  tags: string[]
  potentials?: ApiPotentials
}

// ============================================================================
// フォールバック用ローカルデータ読み込み
// ============================================================================

/**
 * ローカルのqualities.jsonからデータを読み込む（フォールバック用）
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
// API通信関数
// ============================================================================

/**
 * StellaSoraAPIからキャラクター一覧を取得する
 * @see https://github.com/torikushiii/StellaSoraAPI/blob/main/docs/characters.md#get-stellacharacters
 */
async function fetchCharacterList(
  lang = 'JP',
): Promise<ApiCharacterListItem[]> {
  const url = `${STELLA_SORA_API_BASE_URL}/stella/characters?lang=${lang}`

  const response = await fetch(url, {
    next: { revalidate: CACHE_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch character list: ${response.status}`)
  }

  return response.json() as Promise<ApiCharacterListItem[]>
}

/**
 * StellaSoraAPIからキャラクター詳細を取得する
 * @see https://github.com/torikushiii/StellaSoraAPI/blob/main/docs/characters.md#get-stellacharacteridorname
 */
async function fetchCharacterDetail(
  idOrName: string | number,
  lang = 'JP',
): Promise<ApiCharacterDetail> {
  const url = `${STELLA_SORA_API_BASE_URL}/stella/character/${encodeURIComponent(String(idOrName))}?lang=${lang}`

  const response = await fetch(url, {
    next: { revalidate: CACHE_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch character detail: ${response.status}`)
  }

  return response.json() as Promise<ApiCharacterDetail>
}

// ============================================================================
// データ変換関数
// ============================================================================

/**
 * APIのアイコン名からフルURLを生成する
 * @example "10301_Potential_01" -> "https://api.ennead.cc/stella/assets/10301_Potential_01_A.png"
 */
function generateIconUrl(iconName: string): string {
  return `${STELLA_SORA_API_BASE_URL}/stella/assets/${iconName}_A.png`
}

/**
 * APIのポテンシャルデータをアプリケーションの形式に変換する
 * @param potential - APIのポテンシャルデータ
 * @param isCore - コア素質かどうか
 */
function convertPotentialToQualityInfo(
  potential: ApiPotentialEntry,
  isCore: boolean,
): QualityInfo {
  return {
    description: potential.shortDescription,
    fileName: generateIconUrl(potential.icon),
    isCore,
    rarity: potential.rarity,
    title: potential.name,
  }
}

/**
 * キャラクター詳細からポテンシャルデータを抽出して変換する
 *
 * main = mainCore (4) + mainNormal (9) + common (3) = 16
 * sub = supportCore (4) + supportNormal (9) + common (3) = 16
 */
function extractCharacterQualities(
  detail: ApiCharacterDetail,
): CharacterQualities | null {
  if (!detail.potentials) {
    return null
  }

  const { common, mainCore, mainNormal, supportCore, supportNormal } =
    detail.potentials

  // main素質: mainCore（コア） + mainNormal（通常） + common（通常）
  const mainPotentials = [
    ...mainCore.map((p) => convertPotentialToQualityInfo(p, true)),
    ...mainNormal.map((p) => convertPotentialToQualityInfo(p, false)),
    ...common.map((p) => convertPotentialToQualityInfo(p, false)),
  ]
  // sub素質: supportCore（コア） + supportNormal（通常） + common（通常）
  const subPotentials = [
    ...supportCore.map((p) => convertPotentialToQualityInfo(p, true)),
    ...supportNormal.map((p) => convertPotentialToQualityInfo(p, false)),
    ...common.map((p) => convertPotentialToQualityInfo(p, false)),
  ]

  // ポテンシャルデータが空の場合はnullを返す
  if (mainPotentials.length === 0 && subPotentials.length === 0) {
    return null
  }

  return {
    main: mainPotentials,
    sub: subPotentials,
  }
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * StellaSoraAPIから全キャラクターのポテンシャルデータを取得する
 * APIが利用できない場合はローカルのqualities.jsonを使用する
 */
async function fetchQualitiesDataFromApiOrFallback(): Promise<QualitiesData> {
  try {
    // Step 1: キャラクター一覧を取得
    const characterList = await fetchCharacterList('JP')

    // Step 2: 各キャラクターの詳細を並行して取得
    const detailPromises = characterList.map((char) =>
      fetchCharacterDetail(char.id, 'JP'),
    )
    const characterDetails = await Promise.all(detailPromises)

    // Step 3: ポテンシャルデータを整形
    const qualitiesData: QualitiesData = {}

    for (const detail of characterDetails) {
      const qualities = extractCharacterQualities(detail)
      if (qualities) {
        qualitiesData[detail.name] = qualities
      }
    }

    return qualitiesData
  } catch (error) {
    // APIが利用できない場合はローカルデータにフォールバック
    console.warn(
      'StellaSoraAPI is not available, falling back to local data:',
      error,
    )
    return loadLocalQualitiesData()
  }
}

/**
 * 素質データを取得する Server Action
 *
 * - unstable_cacheを使用して4時間キャッシュする
 * - StellaSoraAPIからデータを取得
 * - APIが利用できない場合はローカルのqualities.jsonを使用する
 *
 * @see https://github.com/torikushiii/StellaSoraAPI/blob/main/docs/characters.md
 */
export async function getQualitiesData(): Promise<QualitiesData> {
  const cachedFetch = unstable_cache(
    fetchQualitiesDataFromApiOrFallback,
    ['stella-sora-api-qualities-data'],
    { revalidate: CACHE_REVALIDATE_SECONDS },
  )

  return cachedFetch()
}

/**
 * StellaSoraAPIからキャラクター名一覧を取得する Server Action
 */
export async function getCharacterNames(): Promise<string[]> {
  const cachedFetch = unstable_cache(
    async (): Promise<string[]> => {
      try {
        const characterList = await fetchCharacterList('JP')
        return characterList.map((char) => char.name)
      } catch {
        const qualitiesData = await loadLocalQualitiesData()
        return Object.keys(qualitiesData)
      }
    },
    ['stella-sora-api-character-names'],
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
