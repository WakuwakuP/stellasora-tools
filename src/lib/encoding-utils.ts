/**
 * 共通エンコード/デコードユーティリティ
 *
 * Base64URL変換と7進数変換のための共通関数を提供します。
 * build-encoder-v2.ts と BuildCreator.tsx の両方から使用されます。
 */

/**
 * Base64URL文字セット（RFC 4648）
 */
export const BASE64URL_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

/**
 * 素質レベルの基数（0-6の7進数）
 */
export const TALENT_LEVELS = 7

/**
 * 数値配列を7進数としてBigIntに変換
 * 最下位桁から順に処理します
 */
export function arrayToBase7BigInt(arr: number[]): bigint {
  let result = BigInt(0)
  const base = BigInt(TALENT_LEVELS)

  // 最下位桁から順に処理
  for (let i = arr.length - 1; i >= 0; i--) {
    result = result * base + BigInt(arr[i])
  }

  return result
}

/**
 * BigIntから指定個数の7進数配列に変換
 */
export function base7BigIntToArray(value: bigint, count: number): number[] {
  const result: number[] = []
  const base = BigInt(TALENT_LEVELS)
  let remaining = value

  for (let i = 0; i < count; i++) {
    result.push(Number(remaining % base))
    remaining = remaining / base
  }

  return result
}

/**
 * BigIntをBase64URL文字列に変換
 */
export function bigIntToBase64Url(value: bigint): string {
  if (value === BigInt(0)) {
    return BASE64URL_CHARS[0]
  }

  let result = ''
  let remaining = value
  const base = BigInt(64)

  while (remaining > BigInt(0)) {
    result = BASE64URL_CHARS[Number(remaining % base)] + result
    remaining = remaining / base
  }

  return result
}

/**
 * Base64URL文字列をBigIntに変換
 * @throws Error 不正な文字が含まれている場合
 */
export function base64UrlToBigInt(str: string): bigint {
  let result = BigInt(0)
  const base = BigInt(64)

  for (const char of str) {
    const index = BASE64URL_CHARS.indexOf(char)
    if (index === -1) {
      throw new Error(`Invalid Base64URL character: ${char}`)
    }
    result = result * base + BigInt(index)
  }

  return result
}
