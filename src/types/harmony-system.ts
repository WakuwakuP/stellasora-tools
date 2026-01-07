/**
 * ハーモニーシステム（音符パズル）の型定義
 * ディスクシステムとハーモニースキルの発動条件を管理
 */

import { type ElementType } from './damage-calculation'

/**
 * 音符の種類（属性に対応）
 */
export type NoteType = ElementType

/**
 * ディスクのレアリティ
 */
export type DiscRarity = 3 | 4 | 5

/**
 * 音符の提供情報
 */
export interface NoteProvision {
  /** 音符の種類 */
  type: NoteType
  /** 提供数 */
  count: number
}

/**
 * メロディスキル（常時発動）
 */
export interface MelodySkill {
  /** スキルID */
  id: string
  /** スキル名 */
  name: string
  /** スキルの説明 */
  description: string
  /** ステータス補正 */
  statBonus?: {
    atk?: number
    def?: number
    hp?: number
    critRate?: number
    critDmg?: number
    [key: string]: number | undefined
  }
}

/**
 * ハーモニースキル（条件付き発動）
 */
export interface HarmonySkill {
  /** スキルID */
  id: string
  /** スキル名 */
  name: string
  /** スキルの説明 */
  description: string
  /** 必要な音符の条件 */
  requiredNotes: NoteRequirement[]
  /** 発動時の効果 */
  effects: SkillEffect[]
}

/**
 * 音符の必要条件
 */
export interface NoteRequirement {
  /** 音符の種類 */
  type: NoteType
  /** 必要数 */
  count: number
}

/**
 * スキル効果
 */
export interface SkillEffect {
  /** 効果の種類 */
  type:
    | 'stat_bonus'
    | 'damage_bonus'
    | 'def_shred'
    | 'res_shred'
    | 'heal'
    | 'shield'
    | 'other'
  /** 効果値 */
  value: number
  /** 効果の対象ステータス（stat_bonusやdamage_bonusの場合） */
  target?: string
  /** 効果の持続時間（秒）*/
  duration?: number
}

/**
 * ディスク（装備）情報
 */
export interface Disc {
  /** ディスクID */
  id: string
  /** ディスク名 */
  name: string
  /** レアリティ */
  rarity: DiscRarity
  /** メロディスキル（メインスロット時のみ） */
  melodySkill: MelodySkill | null
  /** ハーモニースキル（メインスロット時のみ） */
  harmonySkill: HarmonySkill | null
  /** サポートスロット時の提供音符 */
  supportNotes: NoteProvision[]
  /** 基本ステータス補正 */
  baseStats?: {
    atk?: number
    def?: number
    hp?: number
    [key: string]: number | undefined
  }
}

/**
 * ディスクスロット
 */
export type SlotType = 'main' | 'support'

/**
 * ディスク構成
 */
export interface DiscConfiguration {
  /** メインスロット（3枠） */
  mainSlots: [Disc, Disc, Disc]
  /** サポートスロット（3枠） */
  supportSlots: [Disc, Disc, Disc]
}

/**
 * 音符プール（現在の音符の状態）
 */
export interface NotePool {
  /** 各属性の音符数 */
  notes: Record<NoteType, number>
}

/**
 * ハーモニー発動状態
 */
export interface HarmonyActivationState {
  /** 発動しているハーモニースキル */
  activeHarmonies: HarmonySkill[]
  /** 現在の音符プール */
  notePool: NotePool
  /** 各ハーモニーの発動可否 */
  activationStatus: Record<string, boolean>
}

/**
 * ハーモニー最適化の要件
 */
export interface HarmonyOptimizationRequirement {
  /** メインディスク（固定） */
  mainDiscs: [Disc, Disc, Disc]
  /** 必要な音符の総数 */
  requiredNotes: Record<NoteType, number>
}

/**
 * ハーモニー最適化の結果
 */
export interface HarmonyOptimizationResult {
  /** 推奨サポートディスク */
  recommendedSupports: [Disc, Disc, Disc]
  /** 最終的な音符プール */
  finalNotePool: NotePool
  /** 発動可能なハーモニースキル数 */
  activeHarmonyCount: number
  /** 発動できないハーモニー */
  unmetRequirements: NoteRequirement[]
  /** 最適化スコア */
  score: number
}

/**
 * ディスクフィルタリング条件
 */
export interface DiscFilterCriteria {
  /** 含める属性 */
  includeElements?: NoteType[]
  /** 除外する属性 */
  excludeElements?: NoteType[]
  /** 最小レアリティ */
  minRarity?: DiscRarity
  /** 最大レアリティ */
  maxRarity?: DiscRarity
}
