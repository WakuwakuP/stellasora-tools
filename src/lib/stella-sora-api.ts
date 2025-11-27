import { unstable_cache } from 'next/cache'
import {
  type CharacterQualities,
  type QualitiesData,
  type QualityInfo,
} from 'types/quality'

/**
 * StellaSoraAPI クライアント
 * APIドキュメント: https://github.com/torikushiii/StellaSoraAPI
 */

/** API Base URL */
const STELLA_SORA_API_BASE_URL = 'https://api.ennead.cc'

/** キャッシュ時間（4時間 = 14400秒） */
const CACHE_REVALIDATE_SECONDS = 14400

/**
 * フォールバック用のアイコンパスを生成する
 * @param characterName - キャラクター名
 * @param role - 役割（'main' または 'sub'）
 * @param index - インデックス番号
 * @returns アイコンのファイルパス
 */
function generateFallbackIconPath(
  characterName: string,
  role: 'main' | 'sub',
  index: number,
): string {
  return `/datasets/${characterName}/${role}/cropped_image${String(index).padStart(2, '0')}.png`
}

/** APIから取得するキャラクターの素質情報 */
interface ApiTalentInfo {
  name: string
  description: string
  icon?: string
}

/** APIから取得するキャラクターの素質データ */
interface ApiTalents {
  main?: ApiTalentInfo[]
  support?: ApiTalentInfo[]
}

/** APIから取得するキャラクター詳細 */
interface ApiCharacterDetail {
  id: number
  name: string
  icon?: string
  talents?: ApiTalents
}

/** APIから取得するキャラクター一覧のアイテム */
interface ApiCharacterListItem {
  id: number
  name: string
  icon?: string
}

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

/**
 * StellaSoraAPIからキャラクター一覧を取得する（内部用）
 */
async function fetchCharacterList(
  lang = 'JP',
): Promise<ApiCharacterListItem[]> {
  const response = await fetch(
    `${STELLA_SORA_API_BASE_URL}/stella/characters?lang=${lang}`,
    {
      next: { revalidate: CACHE_REVALIDATE_SECONDS },
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch character list: ${response.status}`)
  }

  return response.json() as Promise<ApiCharacterListItem[]>
}

/**
 * StellaSoraAPIからキャラクター詳細を取得する（内部用）
 */
async function fetchCharacterDetail(
  nameOrId: string | number,
  lang = 'JP',
): Promise<ApiCharacterDetail> {
  const response = await fetch(
    `${STELLA_SORA_API_BASE_URL}/stella/character/${encodeURIComponent(String(nameOrId))}?lang=${lang}`,
    {
      next: { revalidate: CACHE_REVALIDATE_SECONDS },
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch character detail: ${response.status}`)
  }

  return response.json() as Promise<ApiCharacterDetail>
}

/**
 * APIの素質データをアプリケーションの形式に変換する
 */
function convertTalentToQualityInfo(
  talent: ApiTalentInfo,
  index: number,
  characterName: string,
  role: 'main' | 'sub',
): QualityInfo {
  // アイコンパスをAPIから取得するか、フォールバックパスを生成
  const fileName =
    talent.icon || generateFallbackIconPath(characterName, role, index)

  return {
    description: talent.description,
    fileName,
    title: talent.name,
  }
}

/**
 * キャラクター詳細から素質データを抽出して変換する
 */
function extractCharacterQualities(
  detail: ApiCharacterDetail,
): CharacterQualities | null {
  if (!detail.talents) {
    return null
  }

  const mainTalents = detail.talents.main || []
  const supportTalents = detail.talents.support || []

  return {
    main: mainTalents.map((talent, index) =>
      convertTalentToQualityInfo(talent, index, detail.name, 'main'),
    ),
    sub: supportTalents.map((talent, index) =>
      convertTalentToQualityInfo(talent, index, detail.name, 'sub'),
    ),
  }
}

/**
 * StellaSoraAPIから全キャラクターの素質データを取得する
 * APIが利用できない場合はローカルのqualities.jsonを使用する
 */
async function fetchQualitiesDataFromApiOrFallback(): Promise<QualitiesData> {
  try {
    // まずキャラクター一覧を取得
    const characterList = await fetchCharacterList('JP')

    // 各キャラクターの詳細を並行して取得
    const detailPromises = characterList.map((char) =>
      fetchCharacterDetail(char.id, 'JP'),
    )
    const characterDetails = await Promise.all(detailPromises)

    // 素質データを整形
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
 * StellaSoraAPIから全キャラクターの素質データを取得する
 * unstable_cacheを使用して4時間キャッシュする
 * APIが利用できない場合はローカルのqualities.jsonを使用する
 */
export const getQualitiesDataFromApi = unstable_cache(
  fetchQualitiesDataFromApiOrFallback,
  ['stella-sora-api-qualities-data'],
  { revalidate: CACHE_REVALIDATE_SECONDS },
)

/**
 * StellaSoraAPIからキャラクター名一覧を取得する
 */
export const getCharacterNamesFromApi = unstable_cache(
  async (): Promise<string[]> => {
    const characterList = await fetchCharacterList('JP')
    return characterList.map((char) => char.name)
  },
  ['stella-sora-api-character-names'],
  { revalidate: CACHE_REVALIDATE_SECONDS },
)
