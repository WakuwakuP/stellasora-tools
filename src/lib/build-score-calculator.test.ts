/**
 * ビルドスコア計算サービスのテスト
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

// 依存モジュールをモック
vi.mock('lib/api-client')
vi.mock('lib/gemini-service')

import { calculateBuildScore } from 'lib/build-score-calculator'
import * as apiClient from 'lib/api-client'
import * as geminiService from 'lib/gemini-service'
import {
	mockBuildConfiguration,
	mockCharacterData,
	mockDiscData,
} from 'tests/mocks/buildScoreMocks'

describe('build-score-calculator', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// モックの実装を設定
		vi.mocked(apiClient.fetchCharactersByIds).mockResolvedValue([
			mockCharacterData,
			mockCharacterData,
			mockCharacterData,
		])

		vi.mocked(apiClient.fetchDiscsByIds).mockResolvedValue([
			mockDiscData,
			mockDiscData,
			mockDiscData,
		])

		vi.mocked(geminiService.convertMultipleDescriptions).mockResolvedValue([
			{
				effects: [
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
				],
				success: true,
			},
		])
	})

	describe('calculateBuildScore', () => {
		it('ビルドスコアを計算する', async () => {
			const result = await calculateBuildScore(mockBuildConfiguration)

			expect(result.buildScore).toBeGreaterThan(0)
			expect(result.characterEvaluations).toHaveLength(3)
			expect(result.discEvaluations).toHaveLength(3)
			expect(result.calculatedAt).toBeInstanceOf(Date)
		})

		it('キャラクター評価が正しく含まれる', async () => {
			const result = await calculateBuildScore(mockBuildConfiguration)

			const charEval = result.characterEvaluations[0]
			expect(charEval?.characterId).toBe(125)
			expect(charEval?.characterName).toBe('フリージア')
			expect(charEval?.talentEvaluations).toBeDefined()
		})

		it('ディスク評価が正しく含まれる', async () => {
			const result = await calculateBuildScore(mockBuildConfiguration)

			const discEval = result.discEvaluations[0]
			expect(discEval?.discId).toBe(214031)
			expect(discEval?.discName).toBe('水の音盤')
			expect(discEval?.skillEvaluations).toBeDefined()
		})

		it('各効果に平均ダメージ増加率が含まれる', async () => {
			const result = await calculateBuildScore(mockBuildConfiguration)

			const firstCharEval = result.characterEvaluations[0]
			if (firstCharEval?.talentEvaluations.length > 0) {
				const firstTalentEval = firstCharEval.talentEvaluations[0]
				expect(firstTalentEval?.averageDamageIncrease).toBeGreaterThanOrEqual(0)
				expect(firstTalentEval?.effectName).toBeDefined()
				expect(firstTalentEval?.effectType).toBeDefined()
				expect(firstTalentEval?.simulationResult).toBeDefined()
			}
		})
	})
})
