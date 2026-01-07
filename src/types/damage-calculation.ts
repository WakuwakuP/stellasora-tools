/**
 * ダメージ計算システムの型定義
 * Stella Soraのビルド評価エンジン用
 *
 * 参考: https://gist.github.com/AutumnVN/91afd7a37a9743488419b70f07225950
 */

/**
 * 属性タイプ（元素）
 */
export type ElementType =
  | 'Ignis' // 火
  | 'Aqua' // 水
  | 'Ventus' // 風
  | 'Lux' // 光
  | 'Umbra' // 闇
  | 'Terra' // 地

/**
 * キャラクターの役割
 */
export type RoleType = 'Vanguard' | 'Versatile' | 'Support'

/**
 * 基本ステータス
 */
export interface BaseStats {
  /** HP */
  hp: number
  /** 攻撃力 */
  atk: number
  /** 防御力 */
  def: number
  /** 会心率 (0-1) */
  critRate: number
  /** 会心ダメージ倍率 */
  critDmg: number
  /** 攻撃速度 */
  atkSpeed: number
  /** 移動速度 */
  moveSpeed: number
}

/**
 * ダメージボーナス（加算枠）
 */
export interface DamageBonus {
  /** スキルダメージボーナス (%) */
  skillDmg: number
  /** 通常攻撃ダメージボーナス (%) */
  normalAtkDmg: number
  /** 必殺技ダメージボーナス (%) */
  ultimateDmg: number
  /** 属性ダメージボーナス (%) */
  elementalDmg: number
  /** 全体ダメージボーナス (%) */
  totalDmg: number
}

/**
 * 防御貫通関連
 */
export interface DefensePenetration {
  /** 防御無視 (%) */
  defIgnore: number
  /** 防御貫通（固定値） */
  defPenetrate: number
}

/**
 * 属性耐性関連
 */
export interface ElementalResistance {
  /** 属性耐性値 */
  resistance: number
  /** 属性耐性減少（デバフ） */
  resistShred: number
}

/**
 * ダメージ計算の入力パラメータ
 */
export interface DamageCalculationInput {
  /** 攻撃側の総合攻撃力 */
  totalAtk: number
  /** スキル倍率 (%) */
  skillMultiplier: number
  /** タレントによる追加倍率 (%) */
  talentMultiplier: number
  /** ダメージボーナス */
  damageBonus: DamageBonus
  /** 会心率 (0-1) */
  critRate: number
  /** 会心ダメージ倍率 */
  critDmg: number
  /** 防御貫通 */
  defensePen: DefensePenetration
  /** 敵の防御力 */
  enemyDef: number
  /** 属性耐性 */
  elementalRes: ElementalResistance
  /** 敵の属性耐性値 */
  enemyResistance: number
  /** 確定クリティカルフラグ */
  forceCrit?: boolean
  /** レベル補正定数 */
  levelCorrectionConstant?: number
}

/**
 * ダメージ計算の出力結果
 */
export interface DamageCalculationResult {
  /** 基礎ダメージ */
  baseDamage: number
  /** クリティカル補正後ダメージ */
  critAdjustedDamage: number
  /** 防御補正係数 */
  defAmend: number
  /** 属性耐性補正係数 */
  erAmend: number
  /** 最終ダメージ */
  finalDamage: number
  /** 期待値ダメージ（確率考慮） */
  expectedDamage: number
}

/**
 * DPS計算用の追加パラメータ
 */
export interface DpsCalculationInput extends DamageCalculationInput {
  /** スキルのクールダウン（秒） */
  cooldown: number
  /** スキルのヒット数 */
  hitCount: number
  /** スキルのキャスト時間（秒） */
  castTime: number
  /** 攻撃速度ボーナス (%) */
  atkSpeedBonus: number
}

/**
 * DPS計算結果
 */
export interface DpsCalculationResult extends DamageCalculationResult {
  /** 1秒あたりのダメージ（DPS） */
  dps: number
  /** スキルの実効発動間隔（秒） */
  effectiveCooldown: number
  /** 総ヒット数/秒 */
  hitsPerSecond: number
}

/**
 * ビルド評価メトリクス
 */
export interface BuildEvaluationMetrics {
  /** 攻撃力スコア */
  attackScore: number
  /** 防御力スコア */
  defenseScore: number
  /** クリティカル効率スコア */
  critEfficiencyScore: number
  /** 属性ダメージスコア */
  elementalDamageScore: number
  /** DPSスコア */
  dpsScore: number
  /** 総合スコア */
  totalScore: number
  /** スコアの内訳 */
  breakdown: {
    attack: number
    defense: number
    critEfficiency: number
    elementalDamage: number
    dps: number
  }
}

/**
 * ビルド比較結果
 */
export interface BuildComparisonResult {
  /** ビルドA */
  buildA: BuildEvaluationMetrics
  /** ビルドB */
  buildB: BuildEvaluationMetrics
  /** 差分（A - B） */
  difference: {
    attackScore: number
    defenseScore: number
    critEfficiencyScore: number
    elementalDamageScore: number
    dpsScore: number
    totalScore: number
  }
  /** どちらが優れているか */
  winner: 'A' | 'B' | 'Draw'
}
