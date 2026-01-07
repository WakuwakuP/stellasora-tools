/**
 * ダメージ計算エンジン
 * Stella Soraのダメージ計算式を実装
 *
 * 参考: https://gist.github.com/AutumnVN/91afd7a37a9743488419b70f07225950
 * マスターダメージ計算式:
 * D_final = D_base × M_crit × defAmend × erAmend × M_skill × M_total
 */

import {
  type DamageCalculationInput,
  type DamageCalculationResult,
  type DpsCalculationInput,
  type DpsCalculationResult,
} from 'types/damage-calculation'

/**
 * 基礎ダメージを計算
 * D_base = ATK_total × (Skill% + Talent%) × (DMG Bonus)
 *
 * @param input - ダメージ計算の入力パラメータ
 * @returns 基礎ダメージ値
 */
export function calculateBaseDamage(input: DamageCalculationInput): number {
  const { totalAtk, skillMultiplier, talentMultiplier, damageBonus } = input

  // スキル倍率とタレント倍率は加算関係
  const totalMultiplier = (skillMultiplier + talentMultiplier) / 100

  // ダメージボーナスの合計（加算枠）
  const totalDmgBonus =
    1 +
    (damageBonus.skillDmg +
      damageBonus.normalAtkDmg +
      damageBonus.ultimateDmg +
      damageBonus.elementalDmg +
      damageBonus.totalDmg) /
      100

  return totalAtk * totalMultiplier * totalDmgBonus
}

/**
 * クリティカル補正を計算
 * M_crit = 1 + CritDamage (クリティカル発生時)
 * M_crit = 1 (通常時)
 *
 * @param baseDamage - 基礎ダメージ
 * @param critRate - 会心率 (0-1)
 * @param critDmg - 会心ダメージ倍率
 * @param forceCrit - 確定クリティカルフラグ
 * @returns クリティカル補正後のダメージと期待値
 */
export function calculateCriticalDamage(
  baseDamage: number,
  critRate: number,
  critDmg: number,
  forceCrit = false,
): { critDamage: number; expectedDamage: number } {
  // 会心率は100%でキャップ
  const cappedCritRate = Math.min(critRate, 1)

  // 確定クリティカルの場合
  if (forceCrit) {
    const critMultiplier = 1 + critDmg
    return {
      critDamage: baseDamage * critMultiplier,
      expectedDamage: baseDamage * critMultiplier,
    }
  }

  // クリティカル発生時のダメージ
  const critMultiplier = 1 + critDmg
  const critDamage = baseDamage * critMultiplier

  // 期待値 = 非クリティカル確率 × 通常ダメージ + クリティカル確率 × クリティカルダメージ
  const expectedDamage =
    baseDamage * (1 - cappedCritRate) + critDamage * cappedCritRate

  return { critDamage, expectedDamage }
}

/**
 * 実効防御力を計算
 * Eff_DEF = (Enemy_DEF × (1 - Ignore_Perc)) - Penetrate_Flat
 *
 * @param enemyDef - 敵の防御力
 * @param defIgnore - 防御無視率 (0-1)
 * @param defPenetrate - 防御貫通（固定値）
 * @returns 実効防御力
 */
export function calculateEffectiveDefense(
  enemyDef: number,
  defIgnore: number,
  defPenetrate: number,
): number {
  // 順序が重要: パーセンテージ無視 → 固定値貫通
  const afterIgnore = enemyDef * (1 - defIgnore)
  const effectiveDef = Math.max(0, afterIgnore - defPenetrate)

  return effectiveDef
}

/**
 * 防御補正係数を計算
 * defAmend = C / (C + Eff_DEF)
 *
 * @param effectiveDef - 実効防御力
 * @param levelConstant - レベル依存の定数（デフォルト: 500）
 * @returns 防御補正係数 (0-1)
 */
export function calculateDefenseAmendment(
  effectiveDef: number,
  levelConstant = 500,
): number {
  return levelConstant / (levelConstant + effectiveDef)
}

/**
 * 属性耐性補正係数を計算
 * erAmend = (Enemy_Resist - Resist_Shred) / (1 + 0.1 × (Enemy_Resist - Resist_Shred - V_lower)^2)
 *
 * 注: この式は推測であり、実際のゲーム内の値と異なる可能性があります
 *
 * @param enemyResistance - 敵の属性耐性
 * @param resistShred - 属性耐性減少
 * @param vLower - 閾値パラメータ（デフォルト: 0）
 * @returns 属性耐性補正後のダメージ倍率
 */
export function calculateElementalResistanceAmendment(
  enemyResistance: number,
  resistShred: number,
  vLower = 0,
): number {
  const netResistance = enemyResistance - resistShred
  const delta = netResistance - vLower

  // 二次曲線による補正
  const erAmend = netResistance / (1 + 0.1 * delta * delta)

  // 最終的な耐性倍率は 1 - erAmend
  return 1 - erAmend
}

/**
 * 最終ダメージを計算
 * D_final = D_base × M_crit × defAmend × erAmend × M_skill × M_total
 *
 * @param input - ダメージ計算の入力パラメータ
 * @returns ダメージ計算結果
 */
export function calculateFinalDamage(
  input: DamageCalculationInput,
): DamageCalculationResult {
  // 1. 基礎ダメージ
  const baseDamage = calculateBaseDamage(input)

  // 2. クリティカル補正
  const { critDamage, expectedDamage: critExpectedDamage } =
    calculateCriticalDamage(
      baseDamage,
      input.critRate,
      input.critDmg,
      input.forceCrit,
    )

  // 3. 実効防御力
  const effectiveDef = calculateEffectiveDefense(
    input.enemyDef,
    input.defensePen.defIgnore,
    input.defensePen.defPenetrate,
  )

  // 4. 防御補正係数
  const defAmend = calculateDefenseAmendment(
    effectiveDef,
    input.levelCorrectionConstant,
  )

  // 5. 属性耐性補正係数
  const erAmend = calculateElementalResistanceAmendment(
    input.enemyResistance,
    input.elementalRes.resistShred,
  )

  // 6. 最終ダメージ
  const finalDamage = critDamage * defAmend * erAmend
  const expectedDamage = critExpectedDamage * defAmend * erAmend

  return {
    baseDamage,
    critAdjustedDamage: critDamage,
    defAmend,
    erAmend,
    expectedDamage,
    finalDamage,
  }
}

/**
 * DPS（秒間ダメージ）を計算
 *
 * @param input - DPS計算の入力パラメータ
 * @returns DPS計算結果
 */
export function calculateDps(input: DpsCalculationInput): DpsCalculationResult {
  const damageResult = calculateFinalDamage(input)

  // 攻撃速度ボーナスを考慮した実効クールダウン
  const atkSpeedMultiplier = 1 + input.atkSpeedBonus / 100
  const effectiveCooldown = input.cooldown / atkSpeedMultiplier

  // キャスト時間を考慮した実際の攻撃間隔
  const actualInterval = effectiveCooldown + input.castTime

  // 1秒あたりのヒット数
  const hitsPerSecond = input.hitCount / actualInterval

  // DPS = 期待値ダメージ × ヒット数/秒
  const dps = damageResult.expectedDamage * hitsPerSecond

  return {
    ...damageResult,
    dps,
    effectiveCooldown,
    hitsPerSecond,
  }
}
