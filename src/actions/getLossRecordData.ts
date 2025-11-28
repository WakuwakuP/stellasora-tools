'use server'

import { unstable_cache } from 'next/cache'
import {
  type LossRecordDetail,
  type LossRecordInfo,
  type LossRecordListItem,
  type SupportNote,
} from 'types/lossRecord'

/**
 * StellaSoraAPI からロスレコデータを取得する Server Action
 *
 * APIドキュメント: https://github.com/torikushiii/StellaSoraAPI/blob/main/docs/discs.md
 *
 * 利用可能なエンドポイント:
 * - GET /stella/discs?lang=JP - ロスレコ一覧
 * - GET /stella/disc/{idOrName}?lang=JP - ロスレコ詳細
 */

/** API Base URL */
const STELLA_SORA_API_BASE_URL = 'https://api.ennead.cc'

/** キャッシュ時間（4時間 = 14400秒） */
const CACHE_REVALIDATE_SECONDS = 14400

/**
 * スキル説明文のプレースホルダーを置換する
 * @param description - スキル説明（{1}, {2}等のプレースホルダーを含む）
 * @param params - パラメータ配列
 */
function replaceSkillParams(description: string, params?: string[]): string {
  if (!params || params.length === 0) {
    return description
  }
  // HTMLカラータグを削除
  let result = description.replace(/<color=[^>]+>|<\/color>/g, '')
  // {N}プレースホルダーを置換（replaceAllを使用して効率化）
  for (let i = 0; i < params.length; i++) {
    result = result.replaceAll(`{${i + 1}}`, params[i])
  }
  return result
}

/**
 * ロスレコ一覧を取得する
 */
async function fetchLossRecordList(lang = 'JP'): Promise<LossRecordListItem[]> {
  const url = `${STELLA_SORA_API_BASE_URL}/stella/discs?lang=${lang}`

  const response = await fetch(url, {
    next: { revalidate: CACHE_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch loss record list: ${response.status}`)
  }

  return response.json() as Promise<LossRecordListItem[]>
}

/**
 * ロスレコ詳細を取得する
 */
async function fetchLossRecordDetail(
  idOrName: string | number,
  lang = 'JP',
): Promise<LossRecordDetail> {
  const url = `${STELLA_SORA_API_BASE_URL}/stella/disc/${encodeURIComponent(String(idOrName))}?lang=${lang}`

  const response = await fetch(url, {
    next: { revalidate: CACHE_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch loss record detail: ${response.status}`)
  }

  return response.json() as Promise<LossRecordDetail>
}

/**
 * セカンダリスキルから必要音符を集計する
 * Lv1までに必要な音符数を取得し、複数スキルがある場合は各音符のMAXを使用する
 */
function extractSecondarySkillNotes(detail: LossRecordDetail): SupportNote[] {
  const noteMap = new Map<string, number>()

  for (const skill of detail.secondarySkills) {
    if (skill.requirements && skill.requirements.length > 0) {
      // Lv1時の要件を取得（配列の最初の要素）
      const lv1Reqs = skill.requirements[0] ?? []
      for (const req of lv1Reqs) {
        const current = noteMap.get(req.name) ?? 0
        // 複数スキルがある場合はMAXを使用
        noteMap.set(req.name, Math.max(current, req.quantity))
      }
    }
  }

  // Mapを配列に変換
  return Array.from(noteMap.entries()).map(([name, quantity]) => ({
    name,
    quantity,
  }))
}

/**
 * ロスレコ詳細データをアプリケーション用に変換する
 */
function convertToLossRecordInfo(detail: LossRecordDetail): LossRecordInfo {
  // 最大レベル時のパラメータを取得（配列の最後の要素）
  const maxLevelParams =
    detail.mainSkill.params[detail.mainSkill.params.length - 1] ?? []
  const maxLevelSupportNote =
    detail.supportNote[detail.supportNote.length - 1] ?? []
  const maxLevelStats = detail.stats[detail.stats.length - 1] ?? []

  // セカンダリスキルの必要音符を集計
  const secondarySkillNotes = extractSecondarySkillNotes(detail)

  return {
    element: detail.element,
    iconUrl: `${STELLA_SORA_API_BASE_URL}${detail.icon}`,
    id: detail.id,
    mainSkillDescription: replaceSkillParams(
      detail.mainSkill.description,
      maxLevelParams,
    ),
    mainSkillName: detail.mainSkill.name,
    maxStats: maxLevelStats,
    name: detail.name,
    secondarySkillNotes,
    star: detail.star,
    supportNote: maxLevelSupportNote,
  }
}

/**
 * 全ロスレコデータを取得する
 */
async function fetchAllLossRecordData(): Promise<LossRecordInfo[]> {
  let lossRecordList: LossRecordListItem[]
  try {
    // Step 1: ロスレコ一覧を取得
    lossRecordList = await fetchLossRecordList('JP')
  } catch (error) {
    console.error(
      'Failed to fetch loss record list:',
      error instanceof Error ? error.message : 'Unknown error',
      error,
    )
    throw error
  }

  let lossRecordDetails: LossRecordDetail[]
  try {
    // Step 2: 各ロスレコの詳細を並行して取得
    const detailPromises = lossRecordList.map((lr) =>
      fetchLossRecordDetail(lr.id, 'JP'),
    )
    lossRecordDetails = await Promise.all(detailPromises)
  } catch (error) {
    console.error(
      'Failed to fetch loss record details:',
      error instanceof Error ? error.message : 'Unknown error',
      error,
    )
    throw error
  }

  try {
    // Step 3: アプリケーション用に変換
    return lossRecordDetails.map(convertToLossRecordInfo)
  } catch (error) {
    console.error(
      'Failed to convert loss record details:',
      error instanceof Error ? error.message : 'Unknown error',
      error,
    )
    throw error
  }
}

/**
 * ロスレコデータを取得する Server Action
 *
 * - unstable_cacheを使用して4時間キャッシュする
 * - StellaSoraAPIからデータを取得
 *
 * @see https://github.com/torikushiii/StellaSoraAPI/blob/main/docs/discs.md
 */
export async function getLossRecordData(): Promise<LossRecordInfo[]> {
  const cachedFetch = unstable_cache(
    fetchAllLossRecordData,
    ['stella-sora-api-loss-record-data'],
    { revalidate: CACHE_REVALIDATE_SECONDS },
  )

  return cachedFetch()
}

/**
 * ロスレコ一覧のみを取得する（軽量版）
 */
export async function getLossRecordList(): Promise<LossRecordListItem[]> {
  const cachedFetch = unstable_cache(
    async (): Promise<LossRecordListItem[]> => fetchLossRecordList('JP'),
    ['stella-sora-api-loss-record-list'],
    { revalidate: CACHE_REVALIDATE_SECONDS },
  )

  return cachedFetch()
}
