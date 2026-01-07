/**
 * APIクライアントのテスト
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	fetchCharacterById,
	fetchCharactersByIds,
	fetchDiscById,
	fetchDiscsByIds,
} from 'lib/api-client'
import {
	mockCharacterData,
	mockDiscData,
} from 'tests/mocks/buildScoreMocks'

// グローバルfetchをモック
global.fetch = vi.fn()

describe('api-client', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('fetchCharacterById', () => {
		it('キャラクターデータを取得する', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				json: async () => mockCharacterData,
				ok: true,
			} as Response)

			const result = await fetchCharacterById(125)

			expect(fetch).toHaveBeenCalledWith(
				'https://api.ennead.cc/stella/character/125?lang=JP',
				expect.any(Object),
			)
			expect(result).toEqual(mockCharacterData)
		})

		it('APIエラーの場合は例外をスローする', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: false,
				status: 404,
			} as Response)

			await expect(fetchCharacterById(999)).rejects.toThrow(
				'Failed to fetch character 999: 404',
			)
		})
	})

	describe('fetchDiscById', () => {
		it('ディスクデータを取得する', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				json: async () => mockDiscData,
				ok: true,
			} as Response)

			const result = await fetchDiscById(214031)

			expect(fetch).toHaveBeenCalledWith(
				'https://api.ennead.cc/stella/disc/214031?lang=JP',
				expect.any(Object),
			)
			expect(result).toEqual(mockDiscData)
		})

		it('APIエラーの場合は例外をスローする', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: false,
				status: 404,
			} as Response)

			await expect(fetchDiscById(999999)).rejects.toThrow(
				'Failed to fetch disc 999999: 404',
			)
		})
	})

	describe('fetchCharactersByIds', () => {
		it('複数のキャラクターを並行取得する', async () => {
			vi.mocked(fetch).mockResolvedValue({
				json: async () => mockCharacterData,
				ok: true,
			} as Response)

			const result = await fetchCharactersByIds([125, 126, 127])

			expect(fetch).toHaveBeenCalledTimes(3)
			expect(result).toHaveLength(3)
			expect(result[0]).toEqual(mockCharacterData)
		})
	})

	describe('fetchDiscsByIds', () => {
		it('複数のディスクを並行取得する', async () => {
			vi.mocked(fetch).mockResolvedValue({
				json: async () => mockDiscData,
				ok: true,
			} as Response)

			const result = await fetchDiscsByIds([214031, 214032, 214033])

			expect(fetch).toHaveBeenCalledTimes(3)
			expect(result).toHaveLength(3)
			expect(result[0]).toEqual(mockDiscData)
		})
	})
})
