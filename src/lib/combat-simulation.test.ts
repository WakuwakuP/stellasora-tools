import { describe, expect, it } from 'vitest'
import { simulateCombat } from 'lib/combat-simulation'

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

describe('Combat Simulation', () => {
  describe('simulateCombat', () => {
    it('120秒間のシミュレーションが正常に実行される', () => {
      const result = simulateCombat(mockEffectInfo, [])

      expect(result.duration).toBe(120)
      expect(result.actions.length).toBeGreaterThan(0)
      expect(result.effectUptime).toBeDefined()
    })

    it('通常攻撃が適切な頻度で実行される', () => {
      const result = simulateCombat([], [])

      const normalAttacks = result.actions.filter(
        (action) => action.type === 'normal_attack',
      )

      // 120秒間、0.5秒毎に通常攻撃 = 約240回
      expect(normalAttacks.length).toBeGreaterThan(200)
      expect(normalAttacks.length).toBeLessThanOrEqual(240)
    })

    it('主力スキルがクールダウン毎に実行される', () => {
      const mainSkills = [
        { name: 'テストスキル', cooldown: 10, duration: 1 },
      ]

      const result = simulateCombat([], mainSkills)

      const skillActions = result.actions.filter(
        (action) => action.type === 'skill' && action.name === 'テストスキル',
      )

      // 120秒間、10秒毎にスキル = 約12回
      expect(skillActions.length).toBeGreaterThanOrEqual(11)
      expect(skillActions.length).toBeLessThanOrEqual(13)
    })

    it('必殺技が60秒時点で実行される', () => {
      const result = simulateCombat([], [])

      const ultimateActions = result.actions.filter(
        (action) => action.type === 'ultimate',
      )

      expect(ultimateActions.length).toBe(1)
      expect(ultimateActions[0].time).toBeGreaterThanOrEqual(60)
      expect(ultimateActions[0].time).toBeLessThan(65)
    })

    it('常時発動の効果の稼働率が100%になる', () => {
      const constantEffect = {
        name: '常時発動効果',
        type: 'damage_increase' as const,
        value: 20,
        unit: '%' as const,
        uptime: 999999,
        cooldown: 0,
        maxStacks: 1,
      }

      const result = simulateCombat([constantEffect], [])

      expect(result.effectUptime['常時発動効果']).toBeGreaterThan(0.99)
    })

    it('クールダウンのある効果の稼働率が適切に計算される', () => {
      const cooldownEffect = {
        name: 'クールダウン効果',
        type: 'damage_increase' as const,
        value: 30,
        unit: '%' as const,
        uptime: 8,
        cooldown: 15,
        maxStacks: 1,
      }

      const result = simulateCombat([cooldownEffect], [])

      // 8秒間稼働、15秒クールダウン = 約35%の稼働率
      expect(result.effectUptime['クールダウン効果']).toBeGreaterThan(0)
      expect(result.effectUptime['クールダウン効果']).toBeLessThan(1)
    })

    it('複数の効果が同時に追跡される', () => {
      const result = simulateCombat(mockEffectInfo, [])

      expect(Object.keys(result.effectUptime).length).toBe(
        mockEffectInfo.length,
      )

      // 各効果の稼働率が0以上1以下であることを確認
      for (const uptimeValue of Object.values(result.effectUptime)) {
        expect(uptimeValue).toBeGreaterThanOrEqual(0)
        expect(uptimeValue).toBeLessThanOrEqual(1)
      }
    })

    it('主力スキルと必殺技が両方実行される複雑なシミュレーション', () => {
      const mainSkills = [
        { name: 'スキル1', cooldown: 10, duration: 1 },
        { name: 'スキル2', cooldown: 15, duration: 1 },
      ]

      const result = simulateCombat(mockEffectInfo, mainSkills)

      const skill1Actions = result.actions.filter(
        (action) => action.type === 'skill' && action.name === 'スキル1',
      )
      const skill2Actions = result.actions.filter(
        (action) => action.type === 'skill' && action.name === 'スキル2',
      )
      const ultimateActions = result.actions.filter(
        (action) => action.type === 'ultimate',
      )

      expect(skill1Actions.length).toBeGreaterThan(0)
      expect(skill2Actions.length).toBeGreaterThan(0)
      expect(ultimateActions.length).toBe(1)
    })
  })
})
