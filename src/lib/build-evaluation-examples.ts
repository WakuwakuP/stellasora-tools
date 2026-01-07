/**
 * ビルド評価システムの使用例
 *
 * このファイルは、ダメージ計算とビルド評価システムの基本的な使い方を示します。
 */

import {
  compareBuilds,
  evaluateBuild,
  suggestStatPriority,
} from 'lib/build-evaluator'
import { calculateDps, calculateFinalDamage } from 'lib/damage-calculator'
import {
  type DamageCalculationInput,
  type DpsCalculationInput,
} from 'types/damage-calculation'

/**
 * 例1: 基本的なダメージ計算
 */
export function exampleBasicDamageCalculation() {
  const input: DamageCalculationInput = {
    critDmg: 1.0, // 100%

    // クリティカル
    critRate: 0.5, // 50%

    // ダメージボーナス（加算枠）
    damageBonus: {
      elementalDmg: 15, // 属性ダメージ+15%
      normalAtkDmg: 0,
      skillDmg: 30, // スキルダメージ+30%
      totalDmg: 10, // 全ダメージ+10%
      ultimateDmg: 0,
    },

    // 防御貫通
    defensePen: {
      defIgnore: 0.2, // 防御無視20%
      defPenetrate: 100, // 防御貫通100
    },

    // 属性耐性
    elementalRes: {
      resistance: 0,
      resistShred: 0.05, // 耐性減少5%
    },

    // 敵の防御力
    enemyDef: 500,
    enemyResistance: 0.1, // 敵の耐性10%

    // スキル倍率（200%）とタレント倍率（+20%）
    // 注: これらは加算関係（200% + 20% = 220%）
    skillMultiplier: 200,
    talentMultiplier: 20,
    // 攻撃力
    totalAtk: 1500,
  }

  const result = calculateFinalDamage(input)

  console.log('=== ダメージ計算結果 ===')
  console.log('基礎ダメージ:', Math.round(result.baseDamage))
  console.log('クリティカル時:', Math.round(result.critAdjustedDamage))
  console.log('防御補正係数:', result.defAmend.toFixed(3))
  console.log('属性耐性補正:', result.erAmend.toFixed(3))
  console.log('最終ダメージ:', Math.round(result.finalDamage))
  console.log('期待値ダメージ:', Math.round(result.expectedDamage))

  return result
}

/**
 * 例2: DPS計算
 */
export function exampleDpsCalculation() {
  const input: DpsCalculationInput = {
    atkSpeedBonus: 10, // 攻撃速度+10%
    castTime: 0.5, // キャスト時間0.5秒

    // DPS計算に必要な追加パラメータ
    cooldown: 5, // クールダウン5秒
    critDmg: 1.0,
    critRate: 0.5,
    damageBonus: {
      elementalDmg: 15,
      normalAtkDmg: 0,
      skillDmg: 30,
      totalDmg: 10,
      ultimateDmg: 0,
    },
    defensePen: {
      defIgnore: 0.2,
      defPenetrate: 100,
    },
    elementalRes: {
      resistance: 0,
      resistShred: 0.05,
    },
    enemyDef: 500,
    enemyResistance: 0.1,
    hitCount: 3, // 1回あたり3ヒット
    skillMultiplier: 200,
    talentMultiplier: 20,
    totalAtk: 1500,
  }

  const result = calculateDps(input)

  console.log('=== DPS計算結果 ===')
  console.log('実効クールダウン:', result.effectiveCooldown.toFixed(2), '秒')
  console.log('ヒット数/秒:', result.hitsPerSecond.toFixed(2))
  console.log('DPS:', Math.round(result.dps))

  return result
}

/**
 * 例3: ビルド評価
 */
export function exampleBuildEvaluation() {
  // ビルドAのステータス
  const buildAStats = {
    atk: 1500,
    atkSpeed: 1.0,
    critDmg: 1.0,
    critRate: 0.5,
    def: 600,
    hp: 12000,
    moveSpeed: 1.0,
  }

  const buildADamageBonus = {
    elementalDmg: 15,
    normalAtkDmg: 0,
    skillDmg: 30,
    totalDmg: 10,
    ultimateDmg: 0,
  }

  const buildADefensePen = {
    defIgnore: 0.2,
    defPenetrate: 100,
  }

  const buildADps = 5000

  // ビルドBのステータス（クリティカル重視）
  const buildBStats = {
    atk: 1400,
    atkSpeed: 1.0,
    critDmg: 1.5, // 高い会心ダメージ
    critRate: 0.7, // 高い会心率
    def: 500,
    hp: 10000,
    moveSpeed: 1.0,
  }

  const buildBDamageBonus = {
    elementalDmg: 10,
    normalAtkDmg: 0,
    skillDmg: 20,
    totalDmg: 5,
    ultimateDmg: 0,
  }

  const buildBDefensePen = {
    defIgnore: 0.15,
    defPenetrate: 80,
  }

  const buildBDps = 5200

  // 評価実行
  const metricsA = evaluateBuild(
    buildAStats,
    buildADamageBonus,
    buildADefensePen,
    buildADps,
  )

  const metricsB = evaluateBuild(
    buildBStats,
    buildBDamageBonus,
    buildBDefensePen,
    buildBDps,
  )

  console.log('=== ビルドA評価 ===')
  console.log('攻撃力スコア:', metricsA.attackScore.toFixed(1))
  console.log('会心効率スコア:', metricsA.critEfficiencyScore.toFixed(1))
  console.log('属性ダメージスコア:', metricsA.elementalDamageScore.toFixed(1))
  console.log('DPSスコア:', metricsA.dpsScore.toFixed(1))
  console.log('バフ稼働率スコア:', metricsA.buffUptimeScore.toFixed(1))
  console.log('総合スコア:', metricsA.totalScore.toFixed(1))

  console.log('\n=== ビルドB評価 ===')
  console.log('攻撃力スコア:', metricsB.attackScore.toFixed(1))
  console.log('会心効率スコア:', metricsB.critEfficiencyScore.toFixed(1))
  console.log('属性ダメージスコア:', metricsB.elementalDamageScore.toFixed(1))
  console.log('DPSスコア:', metricsB.dpsScore.toFixed(1))
  console.log('バフ稼働率スコア:', metricsB.buffUptimeScore.toFixed(1))
  console.log('総合スコア:', metricsB.totalScore.toFixed(1))

  // 比較
  const comparison = compareBuilds(metricsA, metricsB)
  console.log('\n=== 比較結果 ===')
  console.log('優れているビルド:', comparison.winner)
  console.log('総合スコア差:', comparison.difference.totalScore.toFixed(1))

  return { comparison, metricsA, metricsB }
}

/**
 * 例4: ステータス改善提案
 */
export function exampleStatSuggestion() {
  const stats = {
    atk: 1500,
    atkSpeed: 1.0,
    critDmg: 1.5, // 高い会心ダメージ
    critRate: 0.3, // 低い会心率
    def: 600,
    hp: 12000,
    moveSpeed: 1.0,
  }

  const damageBonus = {
    elementalDmg: 50, // 飽和気味の属性ダメージ
    normalAtkDmg: 0,
    skillDmg: 80, // 飽和気味のスキルダメージ
    totalDmg: 30,
    ultimateDmg: 0,
  }

  const suggestion = suggestStatPriority(stats, damageBonus)

  console.log('=== ステータス改善提案 ===')
  console.log('推奨ステータス:', suggestion.priority)
  console.log('理由:', suggestion.reason)

  return suggestion
}

/**
 * 例5: 確定クリティカルスキルのダメージ計算
 * （例: Rustyの「Back Stab」）
 */
export function exampleGuaranteedCrit() {
  const input: DamageCalculationInput = {
    critDmg: 2.0, // 会心ダメージは高い
    critRate: 0.3, // 会心率は低くても
    damageBonus: {
      elementalDmg: 20,
      normalAtkDmg: 0,
      skillDmg: 40,
      totalDmg: 15,
      ultimateDmg: 0,
    },
    defensePen: {
      defIgnore: 0.3,
      defPenetrate: 150,
    },
    elementalRes: {
      resistance: 0,
      resistShred: 0.1,
    },
    enemyDef: 600,
    enemyResistance: 0.15,
    forceCrit: true, // 確定クリティカル
    skillMultiplier: 300, // 高倍率のバックスタブ
    talentMultiplier: 0,
    totalAtk: 1800,
  }

  const result = calculateFinalDamage(input)

  console.log('=== 確定クリティカルスキル ===')
  console.log('最終ダメージ:', Math.round(result.finalDamage))
  console.log('期待値:', Math.round(result.expectedDamage))
  console.log('※確定クリティカルのため、最終ダメージ = 期待値')

  return result
}

// すべての例を実行
export function runAllExamples() {
  console.log('\n【例1】基本的なダメージ計算')
  exampleBasicDamageCalculation()

  console.log('\n【例2】DPS計算')
  exampleDpsCalculation()

  console.log('\n【例3】ビルド評価と比較')
  exampleBuildEvaluation()

  console.log('\n【例4】ステータス改善提案')
  exampleStatSuggestion()

  console.log('\n【例5】確定クリティカルスキル')
  exampleGuaranteedCrit()
}
