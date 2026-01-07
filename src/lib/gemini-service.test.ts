/**
 * Gemini AIサービスのテスト
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { convertDescriptionToJSON } from 'lib/gemini-service'
import type { LLMConversionRequest } from 'types/buildScore'

// Gemini AIクライアントのモック
vi.mock('@google/generative-ai', () => {
	return {
		GoogleGenerativeAI: class MockGoogleGenerativeAI {
			getGenerativeModel() {
				return {
					generateContent: vi.fn().mockResolvedValue({
						response: {
							text: () => `{
              "effects": [
                {
                  "name": "攻撃力増加",
                  "type": "atk_increase",
                  "value": 15,
                  "unit": "%",
                  "duration": -1,
                  "condition": null,
                  "stackable": false,
                  "maxStacks": 1
                }
              ]
            }`,
						},
					}),
				}
			}
		},
	}
})

describe('gemini-service', () => {
	beforeEach(() => {
		// 環境変数をモック
		process.env.GEMINI_API_KEY = 'test-api-key'
	})

	describe('convertDescriptionToJSON', () => {
		it('スキル説明をJSON形式に変換する', async () => {
			const request: LLMConversionRequest = {
				description:
					'攻撃力が<color=#0abec5>&Param1&</color>増加する',
				params: ['15%'],
			}

			const result = await convertDescriptionToJSON(request)

			expect(result.success).toBe(true)
			expect(result.effects).toHaveLength(1)
			expect(result.effects[0]?.name).toBe('攻撃力増加')
			expect(result.effects[0]?.type).toBe('atk_increase')
			expect(result.effects[0]?.value).toBe(15)
		})

		it('キャラクター情報を含むリクエストを処理する', async () => {
			const request: LLMConversionRequest = {
				characterInfo: {
					element: 'Water',
					name: 'フリージア',
				},
				description: '水属性ダメージが&Param1&増加する',
				params: ['10%'],
			}

			const result = await convertDescriptionToJSON(request)

			expect(result.success).toBe(true)
			expect(result.effects).toHaveLength(1)
		})

		it('複数のパラメータを含む説明を処理する', async () => {
			const request: LLMConversionRequest = {
				description:
					'&Param1&秒間、ダメージが&Param2&増加する',
				params: ['10', '20%'],
			}

			const result = await convertDescriptionToJSON(request)

			expect(result.success).toBe(true)
		})
	})
})
