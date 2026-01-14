/**
 * ビルドページのクエリパラメータ定義（nuqs使用）
 *
 * URL形式: /build?c1={主力}&c2={支援1}&c3={支援2}&t={素質コード}&m={メインロスレコ}&s={サブロスレコ}&n={ビルド名}
 * 例: /build?c1=チトセ&c2=アヤメ&c3=テレサ&t=BOUxNSlPuQ7-DiZKNN9HY3&m=214026,214005&s=214031
 *
 * 短いパラメータ名で型安全なURL状態管理を提供:
 * - n: ビルド名
 * - c1, c2, c3: キャラクター名（主力、支援1、支援2）
 * - t: 素質レベル配列（Base64URLエンコード）
 *   - 長さで自動判別: 長さ24文字以上=v2（Base-10、レベル0-9）、23文字以下=v1（Base-7、レベル0-6）
 * - m: メインロスレコID配列（カンマ区切り）
 * - s: サブロスレコID配列（カンマ区切り）
 */
import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from 'nuqs/server'

/**
 * ビルド名のパーサー
 */
export const parseBuildName = parseAsString

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
  /** ビルド名 */
  name: 'n',
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
 * クエリパラメータのパーサー定義（アルファベット順）
 */
export const buildSearchParamsParsers = {
  [buildSearchParamKeys.char1]: parseChar,
  [buildSearchParamKeys.char2]: parseChar,
  [buildSearchParamKeys.char3]: parseChar,
  [buildSearchParamKeys.mainLossRecords]: parseLossRecordIds,
  [buildSearchParamKeys.name]: parseBuildName,
  [buildSearchParamKeys.subLossRecords]: parseLossRecordIds,
  [buildSearchParamKeys.talents]: parseTalents,
}

/**
 * サーバーサイド用のクエリパラメータキャッシュ
 */
export const buildSearchParamsCache = createSearchParamsCache(buildSearchParamsParsers)

/**
 * URL生成用のシリアライザー
 * URLSearchParamsの代わりにnuqsのcreateSerializerを使用
 */
export const buildSerializer = createSerializer(buildSearchParamsParsers)
