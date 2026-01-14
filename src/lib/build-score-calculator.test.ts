import { describe, expect, it } from 'vitest'
import {
  aggregateEffectsByType,
  calculateBuildScore,
  formatBuildScore,
} from 'lib/build-score-calculator'
import type { CombatSimulationResult } from 'types/buildScore'

// Mock data
const mockEffectInfo = [
  {
    name: '火属性ダメージ増加',
    type: 'damage_elemental' as const,
    value: 15,
    unit: '%' as const,
    uptime: 999999,
    cooldown: 0,
    maxStacks: 1,
  },
  {
    name: '会心率増加',
    type: 'crit_rate' as const,
    value: 10,
    unit: '%' as const,
    uptime: 999999,
    cooldown: 0,
    maxStacks: 1,
  },
  {
    name: '攻撃力増加',
    type: 'atk_increase' as const,
    value: 20,
    unit: '%' as const,
    uptime: 999999,
    cooldown: 0,
    maxStacks: 1,
  },
  {
    name: 'スキルダメージ増加',
    type: 'damage_skill' as const,
    value: 12,
    unit: '%' as const,
    uptime: 999999,
    cooldown: 0,
    maxStacks: 1,
  },
  {
    name: '防御力減少デバフ',
    type: 'def_decrease' as const,
    value: 15,
    unit: '%' as const,
    uptime: 8,
    cooldown: 15,
    maxStacks: 1,
  },
  {
    name: '追加ダメージ',
    type: 'damage_additional' as const,
    value: 30,
    unit: '%' as const,
    uptime: 999999,
    cooldown: 0,
    maxStacks: 1,
  },
]

describe('Build Score Calculator', () => {
  const mockSimulation: CombatSimulationResult = {
    actions: [],
    totalDamage: 0,
    effectUptime: {
      火属性ダメージ増加: 1.0,
      会心率増加: 1.0,
      攻撃力増加: 1.0,
      スキルダメージ増加: 1.0,
      防御力減少デバフ: 0.4,
      追加ダメージ: 1.0,
    },
    duration: 120,
  }

  describe('calculateBuildScore', () => {
    it('ビルドスコアが正常に計算される', () => {
      const score = calculateBuildScore(mockEffectInfo, mockSimulation)

      expect(score.totalScore).toBeGreaterThan(0)
      expect(score.effectContributions).toHaveLength(mockEffectInfo.length)
      expect(score.simulation).toEqual(mockSimulation)
    })

    it('各効果の貢献度が計算される', () => {
      const score = calculateBuildScore(mockEffectInfo, mockSimulation)

      for (const contribution of score.effectContributions) {
        expect(contribution.name).toBeDefined()
        expect(contribution.type).toBeDefined()
        expect(contribution.averageIncrease).toBeGreaterThanOrEqual(0)
        expect(contribution.uptimeCoverage).toBeGreaterThanOrEqual(0)
        expect(contribution.uptimeCoverage).toBeLessThanOrEqual(1)
      }
    })

    it('稼働率100%の効果は最大値で計算される', () => {
      const score = calculateBuildScore(mockEffectInfo, mockSimulation)

      const constantEffect = score.effectContributions.find(
        (c) => c.name === '火属性ダメージ増加',
      )

      expect(constantEffect).toBeDefined()
      expect(constantEffect?.uptimeCoverage).toBe(1.0)
      expect(constantEffect?.averageIncrease).toBe(15) // value * uptime
    })

    it('稼働率が低い効果は平均値が減少する', () => {
      const score = calculateBuildScore(mockEffectInfo, mockSimulation)

      const cooldownEffect = score.effectContributions.find(
        (c) => c.name === '防御力減少デバフ',
      )

      expect(cooldownEffect).toBeDefined()
      expect(cooldownEffect?.uptimeCoverage).toBe(0.4)
      expect(cooldownEffect?.averageIncrease).toBeLessThan(15) // 稼働率を考慮して減少
    })

    it('総合スコアが全ての効果を含む', () => {
      const score = calculateBuildScore(mockEffectInfo, mockSimulation)

      // 加算効果と乗算効果が両方含まれている
      expect(score.totalScore).toBeGreaterThan(50)
    })
  })

  describe('aggregateEffectsByType', () => {
    it('効果をタイプ別に集計できる', () => {
      const score = calculateBuildScore(mockEffectInfo, mockSimulation)
      const aggregated = aggregateEffectsByType(score.effectContributions)

      expect(aggregated).toBeDefined()
      expect(typeof aggregated).toBe('object')
    })

    it('同じタイプの効果が合算される', () => {
      const multipleEffects = [
        ...mockEffectInfo,
        {
          name: '追加の火属性ダメージ増加',
          type: 'damage_elemental' as const,
          value: 10,
          unit: '%' as const,
          uptime: 999999,
          cooldown: 0,
          maxStacks: 1,
        },
      ]

      const score = calculateBuildScore(multipleEffects, {
        ...mockSimulation,
        effectUptime: {
          ...mockSimulation.effectUptime,
          追加の火属性ダメージ増加: 1.0,
        },
      })

      const aggregated = aggregateEffectsByType(score.effectContributions)

      // 火属性ダメージ増加が2つ合算されている
      expect(aggregated.damage_elemental).toBeGreaterThan(15)
    })
  })

  describe('formatBuildScore', () => {
    it('ビルドスコアを読みやすい形式にフォーマットできる', () => {
      const score = calculateBuildScore(mockEffectInfo, mockSimulation)
      const formatted = formatBuildScore(score)

      expect(formatted).toContain('総合スコア')
      expect(formatted).toContain('効果の貢献度')
      expect(formatted).toContain('シミュレーション時間')
    })

    it('各効果の詳細が含まれる', () => {
      const score = calculateBuildScore(mockEffectInfo, mockSimulation)
      const formatted = formatBuildScore(score)

      for (const effect of mockEffectInfo) {
        expect(formatted).toContain(effect.name)
      }
    })

    it('稼働率がパーセンテージで表示される', () => {
      const score = calculateBuildScore(mockEffectInfo, mockSimulation)
      const formatted = formatBuildScore(score)

      expect(formatted).toMatch(/稼働率: \d+\.\d+%/)
    })
  })

  describe('スコア計算ロジック', () => {
    it('加算効果が正しく加算される', () => {
      const additiveEffects = [
        {
          name: 'ダメージ増加1',
          type: 'damage_increase' as const,
          value: 10,
          unit: '%' as const,
          uptime: 999999,
          cooldown: 0,
          maxStacks: 1,
        },
        {
          name: 'ダメージ増加2',
          type: 'damage_increase' as const,
          value: 15,
          unit: '%' as const,
          uptime: 999999,
          cooldown: 0,
          maxStacks: 1,
        },
      ]

      const simulation: CombatSimulationResult = {
        actions: [],
        totalDamage: 0,
        effectUptime: {
          ダメージ増加1: 1.0,
          ダメージ増加2: 1.0,
        },
        duration: 120,
      }

      const score = calculateBuildScore(additiveEffects, simulation)

      // 10% + 15% = 25%のダメージ増加
      expect(score.totalScore).toBeGreaterThanOrEqual(25)
    })

    it('乗算効果が正しく乗算される', () => {
      const multiplicativeEffects = [
        {
          name: '攻撃力増加',
          type: 'atk_increase' as const,
          value: 20,
          unit: '%' as const,
          uptime: 999999,
          cooldown: 0,
          maxStacks: 1,
        },
      ]

      const simulation: CombatSimulationResult = {
        actions: [],
        totalDamage: 0,
        effectUptime: {
          攻撃力増加: 1.0,
        },
        duration: 120,
      }

      const score = calculateBuildScore(multiplicativeEffects, simulation)

      // 攻撃力20%増加 = 1.2倍 = 20%のダメージ増加
      expect(score.totalScore).toBeCloseTo(20, 0)
    })

    it('加算と乗算が組み合わさる', () => {
      const mixedEffects = [
        {
          name: 'ダメージ増加',
          type: 'damage_increase' as const,
          value: 30,
          unit: '%' as const,
          uptime: 999999,
          cooldown: 0,
          maxStacks: 1,
        },
        {
          name: '攻撃力増加',
          type: 'atk_increase' as const,
          value: 20,
          unit: '%' as const,
          uptime: 999999,
          cooldown: 0,
          maxStacks: 1,
        },
      ]

      const simulation: CombatSimulationResult = {
        actions: [],
        totalDamage: 0,
        effectUptime: {
          ダメージ増加: 1.0,
          攻撃力増加: 1.0,
        },
        duration: 120,
      }

      const score = calculateBuildScore(mixedEffects, simulation)

      // (100 + 30) * 1.2 = 156, 増加分は56%
      expect(score.totalScore).toBeGreaterThan(50)
    })
  })
})
