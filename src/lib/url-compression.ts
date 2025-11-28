/**
 * URLエンコード/デコードユーティリティ
 *
 * ビルドページのクエリパラメータをBase64URL形式にエンコードし、
 * 短縮URL `/b/{code}` を生成する機能を提供します。
 *
 * エンコード形式:
 * - クエリパラメータ文字列をUTF-8バイト配列に変換
 * - Base64URL形式にエンコード
 */

/** Base64のブロックサイズ（4文字単位） */
const BASE64_BLOCK_SIZE = 4

/** Base64URL変換用の正規表現パターン */
const PLUS_PATTERN = /\+/g
const SLASH_PATTERN = /\//g
const PADDING_PATTERN = /=+$/
const MINUS_PATTERN = /-/g
const UNDERSCORE_PATTERN = /_/g

/**
 * バイト配列をBase64URL文字列に変換
 */
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  // btoa を使用して Base64 エンコード
  const base64 = btoa(binary)
  // Base64 -> Base64URL 変換
  return base64
    .replace(PLUS_PATTERN, '-')
    .replace(SLASH_PATTERN, '_')
    .replace(PADDING_PATTERN, '')
}

/**
 * Base64URL文字列をバイト配列に変換
 */
function base64UrlToBytes(str: string): Uint8Array {
  // Base64URL -> Base64 変換
  let base64 = str.replace(MINUS_PATTERN, '+').replace(UNDERSCORE_PATTERN, '/')
  // パディングを追加
  const paddingNeeded =
    (BASE64_BLOCK_SIZE - (base64.length % BASE64_BLOCK_SIZE)) %
    BASE64_BLOCK_SIZE
  base64 += '='.repeat(paddingNeeded)

  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * クエリ文字列をBase64URL形式にエンコード
 *
 * @param queryString - クエリ文字列（例: "?c1=キャラ1&c2=キャラ2&..."）
 * @returns エンコードされたコード
 */
export function compressQueryString(queryString: string): string {
  // ?を除去
  const query = queryString.startsWith('?') ? queryString.slice(1) : queryString
  // UTF-8バイト配列に変換
  const encoder = new TextEncoder()
  const bytes = encoder.encode(query)
  // Base64URLエンコード
  return bytesToBase64Url(bytes)
}

/**
 * Base64URL形式のコードからクエリ文字列をデコード
 *
 * @param code - エンコードされたコード
 * @returns デコードされたクエリ文字列（?なし）
 */
export function decompressToQueryString(code: string): string {
  try {
    // Base64URLデコード
    const bytes = base64UrlToBytes(code)
    // UTF-8デコード
    const decoder = new TextDecoder()
    return decoder.decode(bytes)
  } catch {
    throw new Error('Invalid encoded code')
  }
}

/**
 * ビルドURLから短縮コードを生成
 *
 * @param buildUrl - ビルドページのURL（例: "/build?c1=キャラ1&c2=キャラ2&..."）
 * @returns 短縮コード
 */
export function generateShareCode(buildUrl: string): string {
  // URLからクエリ文字列を抽出
  const questionIndex = buildUrl.indexOf('?')
  if (questionIndex === -1) {
    throw new Error('No query string in URL')
  }
  const queryString = buildUrl.slice(questionIndex + 1)
  return compressQueryString(queryString)
}

/**
 * 短縮コードからビルドページのURLを生成
 *
 * @param code - 短縮コード
 * @returns ビルドページのURL
 */
export function expandShareCode(code: string): string {
  const queryString = decompressToQueryString(code)
  return `/build?${queryString}`
}

/**
 * 短縮URL（/b/{code}）を生成
 *
 * @param buildUrl - ビルドページのURL
 * @returns 短縮URL
 */
export function generateShortUrl(buildUrl: string): string {
  const code = generateShareCode(buildUrl)
  return `/b/${code}`
}
