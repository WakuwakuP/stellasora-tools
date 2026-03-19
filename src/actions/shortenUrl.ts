'use server'

import { db } from '@/lib/db'
import { getBaseUrl } from '@/lib/url-utils'

/** 短縮コードの長さ */
const SHORT_CODE_LENGTH = 8

/** 短縮コード生成に使用する文字セット（英数字） */
const CODE_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

/**
 * ランダムな短縮コードを生成する
 */
function generateShortCode(): string {
  const array = new Uint8Array(SHORT_CODE_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => CODE_CHARS[byte % CODE_CHARS.length]).join(
    '',
  )
}

/**
 * URLが短縮可能な形式かバリデーションする
 * `${getBaseUrl()}/build?...` の形式のみ許可
 */
function isValidBuildUrl(url: string): boolean {
  const baseUrl = getBaseUrl()
  const buildPrefix = `${baseUrl}/build?`
  return url.startsWith(buildPrefix)
}

/**
 * ビルドURLを短縮URLに変換するServer Action
 * @param originalUrl - 短縮対象のURL（`${getBaseUrl()}/build?...` 形式）
 * @returns 短縮コードまたはエラー
 */
export async function createShortenedUrl(
  originalUrl: string,
): Promise<{ code: string } | { error: string }> {
  // URLバリデーション
  if (!isValidBuildUrl(originalUrl)) {
    return { error: '短縮URLは /build?... 形式のURLのみ対応しています' }
  }

  // 同じURLが既に短縮されていないか確認
  const existing = await db.shortenedUrl.findFirst({
    where: { originalUrl },
  })
  if (existing) {
    return { code: existing.code }
  }

  // 一意の短縮コードを生成（衝突時はリトライ）
  const maxRetries = 5
  for (let i = 0; i < maxRetries; i++) {
    const code = generateShortCode()
    try {
      await db.shortenedUrl.create({
        data: {
          code,
          originalUrl,
        },
      })
      return { code }
    } catch {}
  }

  return { error: '短縮URLの生成に失敗しました。再度お試しください。' }
}

/**
 * 短縮コードから元のURLを取得するServer Action
 * @param code - 短縮コード
 * @returns 元のURLまたはnull
 */
export async function resolveShortCode(code: string): Promise<string | null> {
  const record = await db.shortenedUrl.findUnique({
    where: { code },
  })
  return record?.originalUrl ?? null
}
