/**
 * ビルドURLエンコード/デコードユーティリティ
 *
 * URLフォーマット:
 * /build/{encodedBuild}
 *
 * エンコード形式（Base64URL対応の短縮形式）:
 * - キャラクターID: 2桁16進数 (00-FF)
 * - 素質: コアIDとレベル、サブIDとレベルをパック
 * - ロスレコ: メイン3つ、サブ3つのIDをパック
 */

import {
  type Build,
  BuildParseError,
  type Character,
  type LossRecord,
  type Talent,
  type TalentLevel,
} from 'types/build'

/** 定数 */
const CORE_TALENTS_COUNT = 4
const SUB_TALENTS_COUNT = 12
const MAX_CORE_SELECTED = 2
const MAX_SUB_MAIN = 6
const MAX_SUB_SUPPORT = 5
const MAIN_LOSS_RECORD_COUNT = 3
const SUB_LOSS_RECORD_COUNT = 3
const BASE64_RADIX = 64
const CHAR_ID_LENGTH = 2
const MIN_CHAR_PART_LENGTH = 3 // char ID (2) + at least empty core talents indicator (1)
const TOTAL_CHARACTERS = 3
const MIN_TALENT_LEVEL = 1
const MAX_TALENT_LEVEL = 6

/**
 * Base64URL文字セット（RFC 4648）
 * URL安全な文字のみを使用
 */
const BASE64URL_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

/**
 * 数値をBase64URL文字列に変換
 */
function numberToBase64Url(num: number, minLength = 1): string {
  if (num < 0) {
    throw new BuildParseError('Negative numbers are not supported')
  }

  if (num === 0) {
    return BASE64URL_CHARS[0].repeat(minLength)
  }

  let result = ''
  let remaining = num
  while (remaining > 0) {
    result = BASE64URL_CHARS[remaining % BASE64_RADIX] + result
    remaining = Math.floor(remaining / BASE64_RADIX)
  }

  return result.padStart(minLength, BASE64URL_CHARS[0])
}

/**
 * Base64URL文字列を数値に変換
 */
function base64UrlToNumber(str: string): number {
  let result = 0
  for (const char of str) {
    const index = BASE64URL_CHARS.indexOf(char)
    if (index === -1) {
      throw new BuildParseError(`Invalid Base64URL character: ${char}`)
    }
    result = result * BASE64_RADIX + index
  }
  return result
}

/**
 * 素質配列をエンコード
 * シンプルなフォーマット: 各素質を2文字で表現（idの1文字 + levelの1文字）
 * 例: 素質ID=0, レベル=6 → "A6"
 */
function encodeTalents(talents: Talent[]): string {
  if (talents.length === 0) {
    return 'A' // 空の場合は"A"（0を表す）
  }

  // 各素質を2文字でエンコード
  // id: 0-15 → Base64URL 1文字, level: 1-6 → "1"-"6"
  const parts: string[] = []
  for (const talent of talents) {
    parts.push(BASE64URL_CHARS[talent.id] + talent.level.toString())
  }
  return parts.join('')
}

/**
 * 素質配列をデコード
 */
function decodeTalents(encoded: string): Talent[] {
  if (encoded === 'A' || encoded === '') {
    return []
  }

  const talents: Talent[] = []
  // 2文字ずつ読み取る
  for (let i = 0; i < encoded.length; i += CHAR_ID_LENGTH) {
    if (i + 1 >= encoded.length) {
      break
    }
    const idChar = encoded[i]
    const levelChar = encoded[i + 1]

    const id = BASE64URL_CHARS.indexOf(idChar)
    if (id === -1) {
      throw new BuildParseError(`Invalid talent ID character: ${idChar}`)
    }

    const level = Number.parseInt(levelChar, 10) as TalentLevel
    if (
      Number.isNaN(level) ||
      level < MIN_TALENT_LEVEL ||
      level > MAX_TALENT_LEVEL
    ) {
      throw new BuildParseError(`Invalid talent level: ${levelChar}`)
    }

    talents.push({ id, level })
  }

  return talents
}

/**
 * キャラクターをエンコード
 * フォーマット: {charId(2文字)}{coreTalents}.{subTalents}
 */
function encodeCharacter(character: Character): string {
  const charId = numberToBase64Url(character.id, CHAR_ID_LENGTH)
  const core = encodeTalents(character.talents.core)
  const sub = encodeTalents(character.talents.sub)
  return `${charId}${core}.${sub}`
}

/**
 * ロスレコをエンコード
 * フォーマット: {main0}{main1}{main2}{sub0}{sub1}{sub2}
 * 各IDは2文字のBase64URL
 */
function encodeLossRecord(lossRecord: LossRecord): string {
  const parts: string[] = []
  for (const id of lossRecord.main) {
    parts.push(numberToBase64Url(id, CHAR_ID_LENGTH))
  }
  for (const id of lossRecord.sub) {
    parts.push(numberToBase64Url(id, CHAR_ID_LENGTH))
  }
  return parts.join('')
}

/**
 * ロスレコをデコード
 */
function decodeLossRecord(encoded: string): LossRecord {
  const expectedLength =
    (MAIN_LOSS_RECORD_COUNT + SUB_LOSS_RECORD_COUNT) * CHAR_ID_LENGTH
  if (encoded.length !== expectedLength) {
    throw new BuildParseError(
      `Invalid loss record encoding: expected ${expectedLength} chars, got ${encoded.length}`,
    )
  }

  const main: number[] = []
  const sub: number[] = []

  for (let i = 0; i < MAIN_LOSS_RECORD_COUNT; i++) {
    main.push(
      base64UrlToNumber(
        encoded.slice(i * CHAR_ID_LENGTH, i * CHAR_ID_LENGTH + CHAR_ID_LENGTH),
      ),
    )
  }
  for (let i = 0; i < SUB_LOSS_RECORD_COUNT; i++) {
    const offset = MAIN_LOSS_RECORD_COUNT * CHAR_ID_LENGTH
    sub.push(
      base64UrlToNumber(
        encoded.slice(
          offset + i * CHAR_ID_LENGTH,
          offset + i * CHAR_ID_LENGTH + CHAR_ID_LENGTH,
        ),
      ),
    )
  }

  return { main, sub }
}

/**
 * ビルドをURLエンコード
 * フォーマット: {main}.{support0}.{support1}-{lossRecord}
 */
export function encodeBuild(build: Build): string {
  const mainEncoded = encodeCharacter(build.main)
  const support0Encoded = encodeCharacter(build.supports[0])
  const support1Encoded = encodeCharacter(build.supports[1])
  const lossRecordEncoded = encodeLossRecord(build.lossRecord)

  // 素質内の区切りに"."を使用しているので、キャラ間は"_"で区切る
  // ロスレコとの区切りは"-"を使用
  return `${mainEncoded}_${support0Encoded}_${support1Encoded}-${lossRecordEncoded}`
}

/**
 * URLからビルドをデコード
 */
export function decodeBuild(encoded: string): Build {
  // ロスレコとキャラクター部分を分離
  const dashIndex = encoded.lastIndexOf('-')
  if (dashIndex === -1) {
    throw new BuildParseError(
      'Invalid build encoding: missing loss record separator',
    )
  }

  const charactersPart = encoded.slice(0, dashIndex)
  const lossRecordPart = encoded.slice(dashIndex + 1)

  // キャラクターを分離
  const characterParts = charactersPart.split('_')
  if (characterParts.length !== TOTAL_CHARACTERS) {
    throw new BuildParseError(
      `Invalid build encoding: expected ${TOTAL_CHARACTERS} characters, got ${characterParts.length}`,
    )
  }

  // 各キャラクターをデコード（素質の区切りは"."）
  const mainResult = decodeCharacterWithDots(characterParts[0])
  const support0Result = decodeCharacterWithDots(characterParts[1])
  const support1Result = decodeCharacterWithDots(characterParts[2])

  // ロスレコをデコード
  const lossRecord = decodeLossRecord(lossRecordPart)

  return {
    lossRecord,
    main: mainResult,
    supports: [support0Result, support1Result],
  }
}

/**
 * ドット区切りでキャラクターをデコード
 */
function decodeCharacterWithDots(encoded: string): Character {
  const parts = encoded.split('.')

  if (parts.length < 1 || parts[0].length < MIN_CHAR_PART_LENGTH) {
    throw new BuildParseError('Invalid character encoding')
  }

  const charId = base64UrlToNumber(parts[0].slice(0, CHAR_ID_LENGTH))
  const corePart = parts[0].slice(CHAR_ID_LENGTH)
  const subPart = parts.length > 1 ? parts[1] : ''

  return {
    id: charId,
    talents: {
      core: decodeTalents(corePart),
      sub: decodeTalents(subPart),
    },
  }
}

const SUPPORT_COUNT = 2

/**
 * ビルドのバリデーション
 */
export function validateBuild(build: Build): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // 主力キャラクターのバリデーション
  if (build.main.talents.core.length > MAX_CORE_SELECTED) {
    errors.push(`主力のコア素質は${MAX_CORE_SELECTED}個までです`)
  }
  if (build.main.talents.sub.length > MAX_SUB_MAIN) {
    errors.push(`主力のサブ素質は${MAX_SUB_MAIN}個までです`)
  }

  // 支援キャラクターのバリデーション
  for (let i = 0; i < SUPPORT_COUNT; i++) {
    const support = build.supports[i]
    if (support.talents.core.length > MAX_CORE_SELECTED) {
      errors.push(`支援${i + 1}のコア素質は${MAX_CORE_SELECTED}個までです`)
    }
    if (support.talents.sub.length > MAX_SUB_SUPPORT) {
      errors.push(`支援${i + 1}のサブ素質は${MAX_SUB_SUPPORT}個までです`)
    }
  }

  // コア素質IDの範囲チェック
  const allTalents = [
    ...build.main.talents.core,
    ...build.main.talents.sub,
    ...build.supports[0].talents.core,
    ...build.supports[0].talents.sub,
    ...build.supports[1].talents.core,
    ...build.supports[1].talents.sub,
  ]

  for (const talent of allTalents) {
    if (talent.level < MIN_TALENT_LEVEL || talent.level > MAX_TALENT_LEVEL) {
      errors.push(
        `素質レベルは${MIN_TALENT_LEVEL}-${MAX_TALENT_LEVEL}の範囲です: ${talent.level}`,
      )
    }
  }

  // ロスレコのバリデーション
  if (build.lossRecord.main.length !== MAIN_LOSS_RECORD_COUNT) {
    errors.push(`メインロスレコは${MAIN_LOSS_RECORD_COUNT}個必要です`)
  }
  if (build.lossRecord.sub.length !== SUB_LOSS_RECORD_COUNT) {
    errors.push(`サブロスレコは${SUB_LOSS_RECORD_COUNT}個必要です`)
  }

  return { errors, valid: errors.length === 0 }
}

// 定数のエクスポート
export {
  CORE_TALENTS_COUNT,
  MAX_CORE_SELECTED,
  MAX_SUB_MAIN,
  MAX_SUB_SUPPORT,
  MAIN_LOSS_RECORD_COUNT,
  SUB_LOSS_RECORD_COUNT,
  SUB_TALENTS_COUNT,
}
