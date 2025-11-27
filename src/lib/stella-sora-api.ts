import { unstable_cache } from 'next/cache'
import {
  type CharacterQualities,
  type QualitiesData,
  type QualityInfo,
} from 'types/quality'

/**
 * StellaSoraAPI クライアント
 *
 * APIドキュメント: https://github.com/torikushiii/StellaSoraAPI/tree/main/docs
 *
 * 利用可能なエンドポイント:
 * - GET /stella/characters?lang=JP - キャラクター一覧（軽量版）
 * - GET /stella/character/{idOrName}?lang=JP - キャラクター詳細（talents含む）
 *
 * langパラメータ: EN, JP, KR, CN, TW（デフォルト: EN）
 */

/** API Base URL（docs/characters.md より） */
const STELLA_SORA_API_BASE_URL = 'https://api.ennead.cc'

/** キャッシュ時間（4時間 = 14400秒） */
const CACHE_REVALIDATE_SECONDS = 14400

// ============================================================================
// API Response Types（docs/characters.md に基づく）
// ============================================================================

/**
 * キャラクター一覧レスポンス（GET /stella/characters）
 * docs/characters.md の Example より
 */
interface ApiCharacterListItem {
  id: number
  name: string
  icon: string // e.g., "/stella/assets/Amber.png"
  portrait: string // e.g., "/stella/assets/head_10301_XL.png"
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
 * 個々の素質（talent）情報
 * docs/characters.md では "talents": { "...": "..." } と省略されているため、
 * 実際のAPIレスポンス構造に基づいて定義
 */
interface ApiTalentEntry {
  name: string
  description: string
  icon?: string
  params?: string[]
}

/**
 * キャラクターの素質データ
 * APIの構造: talents.main（主力用）と talents.support（支援用）
 */
interface ApiTalents {
  main?: ApiTalentEntry[]
  support?: ApiTalentEntry[]
}

/**
 * キャラクター詳細レスポンス（GET /stella/character/{idOrName}）
 * docs/characters.md の Example より（一部抜粋）
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
  normalAttack?: {
    name: string
    description: string
    shortDescription: string
    params: string[]
  }
  skill?: {
    name: string
    description: string
    shortDescription: string
    params: string[]
    cooldown: string
  }
  supportSkill?: unknown
  ultimate?: unknown
  potentials?: unknown
  talents?: ApiTalents
  stats?: unknown
  upgrades?: unknown
  skillUpgrades?: unknown
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
 * フォールバック用のアイコンパスを生成する
 * APIからアイコンが取得できない場合に使用
 */
function generateFallbackIconPath(
  characterName: string,
  role: 'main' | 'sub',
  index: number,
): string {
  const paddedIndex = String(index).padStart(2, '0')
  return `/datasets/${characterName}/${role}/cropped_image${paddedIndex}.png`
}

/**
 * APIの素質データをアプリケーションの形式に変換する
 */
function convertTalentToQualityInfo(
  talent: ApiTalentEntry,
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

  // 素質データが空の場合はnullを返す
  if (mainTalents.length === 0 && supportTalents.length === 0) {
    return null
  }

  return {
    main: mainTalents.map((talent, index) =>
      convertTalentToQualityInfo(talent, index, detail.name, 'main'),
    ),
    sub: supportTalents.map((talent, index) =>
      convertTalentToQualityInfo(talent, index, detail.name, 'sub'),
    ),
  }
}

// ============================================================================
// エクスポート関数
// ============================================================================

/**
 * StellaSoraAPIから全キャラクターの素質データを取得する
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

    // Step 3: 素質データを整形
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
 *
 * - unstable_cacheを使用して4時間キャッシュする
 * - APIが利用できない場合はローカルのqualities.jsonを使用する
 *
 * @see https://github.com/torikushiii/StellaSoraAPI/blob/main/docs/characters.md
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
