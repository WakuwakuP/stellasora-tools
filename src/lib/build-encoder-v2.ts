/**
 * ビルドURLエンコード/デコードユーティリティ（新URL形式）
 *
 * URLフォーマット:
 * /{キャラ名1}/{キャラ名2}/{キャラ名3}/{素質コード}
 *
 * 素質コード:
 * - 16素質 × 3人 = 48個の素質レベル（0-6）を7進数で表現
 * - 7進数の数値をBase64URL変換
 */

import {
  arrayToBase7BigInt,
  base7BigIntToArray,
  base64UrlToBigInt,
  bigIntToBase64Url,
} from 'lib/encoding-utils'
import {
  type Build,
  type CharacterTalents,
  type TalentLevel,
} from 'types/build'

/** 定数 */
const CORE_TALENTS_COUNT = 4
const SUB_TALENTS_COUNT = 12
const TOTAL_TALENTS_PER_CHAR = CORE_TALENTS_COUNT + SUB_TALENTS_COUNT // 16
const MAX_CORE_SELECTED = 2
const MAX_SUB_MAIN = 6
const MAX_SUB_SUPPORT = 5
const MAIN_LOSS_RECORD_COUNT = 3
const SUB_LOSS_RECORD_COUNT = 3
const SUPPORT_COUNT = 2
const TOTAL_CHARACTERS = 3
const MIN_TALENT_LEVEL = 1
const MAX_TALENT_LEVEL = 6
const MAIN_CHAR_INDEX = 0
const SUPPORT0_INDEX = 1
const SUPPORT1_INDEX = 2

/**
 * キャラクターの素質を16個の配列に変換（0-6の値）
 * インデックス0-3: コア素質
 * インデックス4-15: サブ素質
 */
function talentsToArray(talents: CharacterTalents): number[] {
  const result = new Array<number>(TOTAL_TALENTS_PER_CHAR).fill(0)

  // コア素質を設定
  for (const talent of talents.core) {
    if (talent.id >= 0 && talent.id < CORE_TALENTS_COUNT) {
      result[talent.id] = talent.level
    }
  }

  // サブ素質を設定（オフセット4から始まる）
  for (const talent of talents.sub) {
    if (talent.id >= 0 && talent.id < SUB_TALENTS_COUNT) {
      result[CORE_TALENTS_COUNT + talent.id] = talent.level
    }
  }

  return result
}

/**
 * 16個の配列からCharacterTalentsに変換
 */
function arrayToTalents(arr: number[]): CharacterTalents {
  const core: CharacterTalents['core'] = []
  const sub: CharacterTalents['sub'] = []

  // コア素質（インデックス0-3）
  for (let i = 0; i < CORE_TALENTS_COUNT; i++) {
    if (arr[i] > 0 && arr[i] <= MAX_TALENT_LEVEL) {
      core.push({ id: i, level: arr[i] as TalentLevel })
    }
  }

  // サブ素質（インデックス4-15）
  for (let i = 0; i < SUB_TALENTS_COUNT; i++) {
    const idx = CORE_TALENTS_COUNT + i
    if (arr[idx] > 0 && arr[idx] <= MAX_TALENT_LEVEL) {
      sub.push({ id: i, level: arr[idx] as TalentLevel })
    }
  }

  return { core, sub }
}

/**
 * 素質情報をエンコード
 * 3人分の素質（48個）を7進数でBigIntに変換し、Base64URLに変換
 */
export function encodeTalents(build: Build): string {
  const mainTalents = talentsToArray(build.main.talents)
  const support0Talents = talentsToArray(build.supports[0].talents)
  const support1Talents = talentsToArray(build.supports[1].talents)

  const allTalents = [...mainTalents, ...support0Talents, ...support1Talents]
  const bigIntValue = arrayToBase7BigInt(allTalents)

  return bigIntToBase64Url(bigIntValue)
}

/**
 * 素質情報をデコード
 */
export function decodeTalents(
  encoded: string,
): [CharacterTalents, CharacterTalents, CharacterTalents] {
  const bigIntValue = base64UrlToBigInt(encoded)
  const totalTalents = TOTAL_TALENTS_PER_CHAR * TOTAL_CHARACTERS
  const allTalents = base7BigIntToArray(bigIntValue, totalTalents)

  const mainStart = MAIN_CHAR_INDEX * TOTAL_TALENTS_PER_CHAR
  const support0Start = SUPPORT0_INDEX * TOTAL_TALENTS_PER_CHAR
  const support1Start = SUPPORT1_INDEX * TOTAL_TALENTS_PER_CHAR
  const support1End = (SUPPORT1_INDEX + 1) * TOTAL_TALENTS_PER_CHAR

  const mainTalents = arrayToTalents(
    allTalents.slice(mainStart, mainStart + TOTAL_TALENTS_PER_CHAR),
  )
  const support0Talents = arrayToTalents(
    allTalents.slice(support0Start, support0Start + TOTAL_TALENTS_PER_CHAR),
  )
  const support1Talents = arrayToTalents(
    allTalents.slice(support1Start, support1End),
  )

  return [mainTalents, support0Talents, support1Talents]
}

/**
 * URLパスからビルドを構築
 */
export function buildFromPath(
  char1: string,
  char2: string,
  char3: string,
  talentsCode: string,
): Build {
  const [mainTalents, support0Talents, support1Talents] =
    decodeTalents(talentsCode)

  return {
    lossRecord: {
      main: [0, 0, 0], // ロスレコは別途処理が必要
      sub: [0, 0, 0],
    },
    main: {
      name: decodeURIComponent(char1),
      talents: mainTalents,
    },
    supports: [
      {
        name: decodeURIComponent(char2),
        talents: support0Talents,
      },
      {
        name: decodeURIComponent(char3),
        talents: support1Talents,
      },
    ],
  }
}

/**
 * ビルドからURLパスを生成
 */
export function buildToPath(build: Build): string {
  const talentsCode = encodeTalents(build)
  const char1 = encodeURIComponent(build.main.name)
  const char2 = encodeURIComponent(build.supports[0].name)
  const char3 = encodeURIComponent(build.supports[1].name)

  return `/${char1}/${char2}/${char3}/${talentsCode}`
}

/**
 * キャラクター名のバリデーション
 */
function validateCharacterNames(build: Build, errors: string[]): void {
  if (!build.main.name || build.main.name.trim() === '') {
    errors.push('主力キャラクター名が必要です')
  }
  for (let i = 0; i < SUPPORT_COUNT; i++) {
    if (!build.supports[i].name || build.supports[i].name.trim() === '') {
      errors.push(`支援${i + 1}キャラクター名が必要です`)
    }
  }
}

/**
 * 素質数のバリデーション
 */
function validateTalentCounts(build: Build, errors: string[]): void {
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
}

/**
 * 素質レベルのバリデーション
 */
function validateTalentLevels(build: Build, errors: string[]): void {
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
}

/**
 * ビルドのバリデーション
 */
export function validateBuild(build: Build): {
  errors: string[]
  valid: boolean
} {
  const errors: string[] = []

  validateCharacterNames(build, errors)
  validateTalentCounts(build, errors)
  validateTalentLevels(build, errors)

  return { errors, valid: errors.length === 0 }
}

// 定数のエクスポート
export {
  CORE_TALENTS_COUNT,
  MAIN_LOSS_RECORD_COUNT,
  MAX_CORE_SELECTED,
  MAX_SUB_MAIN,
  MAX_SUB_SUPPORT,
  SUB_LOSS_RECORD_COUNT,
  SUB_TALENTS_COUNT,
}
