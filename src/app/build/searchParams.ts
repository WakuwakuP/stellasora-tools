/**
 * ビルドページのクエリパラメータ定義（nuqs使用）
 *
 * 短いパラメータ名で型安全なURL状態管理を提供:
 * - c1, c2, c3: キャラクター名（主力、支援1、支援2）
 * - t: 素質レベル配列（Base64URLエンコード）
 * - m: メインロスレコID配列（カンマ区切り）
 * - s: サブロスレコID配列（カンマ区切り）
 */
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from 'nuqs/server'

/**
 * キャラクター名のパーサー（null許容）
 */
export const parseChar = parseAsString

/**
 * 素質コードのパーサー（Base64URL形式）
 */
export const parseTalents = parseAsString

/**
 * ロスレコID配列のパーサー
 */
export const parseLossRecordIds = parseAsArrayOf(parseAsInteger, ',')

/**
 * ビルドページのクエリパラメータキー（短縮形）
 */
export const buildSearchParamKeys = {
  /** 主力キャラクター名 */
  char1: 'c1',
  /** 支援1キャラクター名 */
  char2: 'c2',
  /** 支援2キャラクター名 */
  char3: 'c3',
  /** 素質コード */
  talents: 't',
  /** メインロスレコID */
  mainLossRecords: 'm',
  /** サブロスレコID */
  subLossRecords: 's',
} as const

/**
 * サーバーサイド用のクエリパラメータキャッシュ
 */
export const buildSearchParamsCache = createSearchParamsCache({
  [buildSearchParamKeys.char1]: parseChar,
  [buildSearchParamKeys.char2]: parseChar,
  [buildSearchParamKeys.char3]: parseChar,
  [buildSearchParamKeys.talents]: parseTalents,
  [buildSearchParamKeys.mainLossRecords]: parseLossRecordIds,
  [buildSearchParamKeys.subLossRecords]: parseLossRecordIds,
})
