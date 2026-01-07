/**
 * 戦闘シミュレーターのテスト
 */

import { describe, expect, it } from 'vitest'
import {
	simulateMultipleEffects,
	simulateSingleEffect,
} from 'lib/combat-simulator'
import { mockParsedEffects } from 'tests/mocks/buildScoreMocks'

describe('combat-simulator', () => {
	describe('simulateSingleEffect', () => {
		it('永続的な攻撃力増加効果を正しくシミュレートする', () => {
			const effect = {
				condition: null,
				duration: -1,
				maxStacks: 1,
				name: '攻撃力増加',
				stackable: false,
				type: 'atk_increase',
				unit: '%',
				value: 15,
			}

			const result = simulateSingleEffect(effect)

			expect(result.baseDamage).toBe(12000) // 100 DPS * 120秒
			expect(result.actualDamage).toBeGreaterThan(result.baseDamage)
			expect(result.damageIncreaseRate).toBeCloseTo(15, 0) // 15%増加に近い値
		})

		it('時限付きのダメージ増加効果を正しくシミュレートする', () => {
			const effect = {
				condition: null,
				duration: 10,
				maxStacks: 1,
				name: 'ダメージ増加',
				stackable: false,
				type: 'damage_increase',
				unit: '%',
				value: 20,
			}

			const result = simulateSingleEffect(effect)

			expect(result.baseDamage).toBe(12000)
			expect(result.actualDamage).toBeGreaterThan(result.baseDamage)
			// 10秒間だけ20%増加なので、全体では20%程度の増加（効果が再発動するため）
			expect(result.damageIncreaseRate).toBeGreaterThan(15)
			expect(result.damageIncreaseRate).toBeLessThan(25)
		})

		it('会心率増加効果を正しくシミュレートする', () => {
			const effect = mockParsedEffects[0] // 会心率10%上昇

			const result = simulateSingleEffect(effect)

			expect(result.baseDamage).toBe(12000)
			expect(result.actualDamage).toBeGreaterThan(result.baseDamage)
			expect(result.damageIncreaseRate).toBeGreaterThan(0)
		})

		it('スタック可能な効果を正しくシミュレートする', () => {
			const effect = {
				condition: null,
				duration: 14,
				maxStacks: 10,
				name: '水属性ダメージ増加',
				stackable: true,
				type: 'elemental_damage',
				unit: '%',
				value: 1.4,
			}

			const result = simulateSingleEffect(effect)

			expect(result.baseDamage).toBe(12000)
			expect(result.actualDamage).toBeGreaterThan(result.baseDamage)
			expect(result.damageIncreaseRate).toBeGreaterThan(0)
		})
	})

	describe('simulateMultipleEffects', () => {
		it('複数の効果を同時にシミュレートする', () => {
			const effects = [
				{
					condition: null,
					duration: -1,
					maxStacks: 1,
					name: '攻撃力増加',
					stackable: false,
					type: 'atk_increase',
					unit: '%',
					value: 15,
				},
				{
					condition: null,
					duration: -1,
					maxStacks: 1,
					name: 'ダメージ増加',
					stackable: false,
					type: 'damage_increase',
					unit: '%',
					value: 10,
				},
			]

			const result = simulateMultipleEffects(effects)

			expect(result.baseDamage).toBe(12000)
			expect(result.actualDamage).toBeGreaterThan(result.baseDamage)
			// 15% + 10% = 25%程度の増加を期待
			expect(result.damageIncreaseRate).toBeGreaterThan(20)
			expect(result.damageIncreaseRate).toBeLessThan(30)
		})

		it('モックデータの全効果をシミュレートする', () => {
			const result = simulateMultipleEffects(mockParsedEffects)

			expect(result.baseDamage).toBe(12000)
			expect(result.actualDamage).toBeGreaterThan(result.baseDamage)
			expect(result.damageIncreaseRate).toBeGreaterThan(0)
		})

		it('効果がない場合は小さな増加になる', () => {
			const result = simulateMultipleEffects([])

			expect(result.baseDamage).toBe(12000)
			// 効果がない場合でも条件判定によりわずかな変動がある
			expect(result.actualDamage).toBeGreaterThanOrEqual(result.baseDamage)
			expect(result.damageIncreaseRate).toBeLessThan(1)
		})
	})
})
