import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// 動的インポートのモック
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}))

vi.mock('node:path', () => ({
  join: vi.fn((...args: string[]) => args.join('/')),
}))

// unstable_cacheのモック（キャッシュを無効化してテストを実行）
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}))

describe('stella-sora-api', () => {
  const mockFetch = vi.fn()
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = mockFetch
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('getQualitiesDataFromApi', () => {
    it('APIからデータを正常に取得できる', async () => {
      const mockCharacterList = [
        { id: 103, name: 'コハク', icon: '/stella/assets/Amber.png' },
        { id: 107, name: 'シア', icon: '/stella/assets/Tilia.png' },
      ]

      const mockKohakuDetail = {
        id: 103,
        name: 'コハク',
        talents: {
          main: [
            { name: '超火力', description: '主力スキル発動後、装弾数と通常攻撃ダメージが増加する。' },
            { name: '降雨弾', description: '主力スキル発動後、通常攻撃が範囲攻撃になる。' },
          ],
          support: [
            { name: '追尾の舞', description: '支援スキルは敵を追撃するようになる。' },
          ],
        },
      }

      const mockSiaDetail = {
        id: 107,
        name: 'シア',
        talents: {
          main: [
            { name: '光の雪兎', description: '雪兎の通常攻撃ダメージを与えた時、電音を付与するようになる。' },
          ],
          support: [
            { name: '雪兎の火力支援', description: 'シアの支援スキル終了後、雪兎を召喚して主力巡遊者に追従させ、敵を攻撃するようになる。' },
          ],
        },
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCharacterList),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockKohakuDetail),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSiaDetail),
        })

      // モジュールを再インポート（モックを適用するため）
      const { getQualitiesDataFromApi } = await import('lib/stella-sora-api')
      const result = await getQualitiesDataFromApi()

      expect(result).toHaveProperty('コハク')
      expect(result).toHaveProperty('シア')
      expect(result['コハク'].main).toHaveLength(2)
      expect(result['コハク'].sub).toHaveLength(1)
      expect(result['シア'].main).toHaveLength(1)
      expect(result['シア'].sub).toHaveLength(1)

      // APIが正しいURLで呼び出されたことを確認
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.ennead.cc/stella/characters?lang=JP',
        expect.objectContaining({ next: { revalidate: 14400 } }),
      )
    })

    it('APIエラー時にローカルデータにフォールバックする', async () => {
      const mockLocalData = {
        'コハク': {
          main: [{ title: 'テスト', description: 'テスト説明', fileName: '/test.png' }],
          sub: [{ title: 'テスト2', description: 'テスト説明2', fileName: '/test2.png' }],
        },
      }

      // APIリクエストが失敗するようにモック
      mockFetch.mockRejectedValue(new Error('Network error'))

      // fsモジュールのモック
      const { readFile } = await import('node:fs/promises')
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockLocalData))

      const { getQualitiesDataFromApi } = await import('lib/stella-sora-api')
      const result = await getQualitiesDataFromApi()

      expect(result).toEqual(mockLocalData)
    })

    it('キャラクターにtalentsがない場合はスキップする', async () => {
      const mockCharacterList = [
        { id: 103, name: 'コハク' },
        { id: 999, name: 'テスト' },
      ]

      const mockKohakuDetail = {
        id: 103,
        name: 'コハク',
        talents: {
          main: [{ name: '超火力', description: 'テスト' }],
          support: [{ name: '追尾の舞', description: 'テスト' }],
        },
      }

      const mockTestDetail = {
        id: 999,
        name: 'テスト',
        // talentsなし
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCharacterList),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockKohakuDetail),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTestDetail),
        })

      const { getQualitiesDataFromApi } = await import('lib/stella-sora-api')
      const result = await getQualitiesDataFromApi()

      expect(result).toHaveProperty('コハク')
      expect(result).not.toHaveProperty('テスト')
    })
  })
})
