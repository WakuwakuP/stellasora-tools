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

describe('getCharacterData Server Action', () => {
  const mockFetch = vi.fn()
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = mockFetch
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('getQualitiesData', () => {
    it('APIからデータを正常に取得できる', async () => {
      // docs/characters.md の例に基づくモックデータ
      const mockCharacterList = [
        {
          id: 103,
          name: 'コハク',
          icon: '/stella/assets/Amber.png',
          portrait: '/stella/assets/head_10301_XL.png',
          description: 'テスト説明',
          grade: 4,
          element: 'Ignis',
          position: 'Vanguard',
          attackType: 'ranged',
          style: 'Collector',
          faction: 'New Star Guild',
          tags: ['Vanguard', 'Collector'],
        },
        {
          id: 107,
          name: 'シア',
          icon: '/stella/assets/Tilia.png',
          portrait: '/stella/assets/head_10701_XL.png',
          description: 'テスト説明',
          grade: 4,
          element: 'Lux',
          position: 'Support',
          attackType: 'melee',
          style: 'Steady',
          faction: 'Imperial Guard',
          tags: ['Support', 'Steady'],
        },
      ]

      const mockKohakuDetail = {
        id: 103,
        name: 'コハク',
        icon: '/stella/assets/Amber.png',
        portrait: '/stella/assets/Amber_portrait.png',
        background: '/stella/assets/Amber_background.png',
        variants: { base: '/stella/assets/Amber_base.png' },
        description: 'テスト説明',
        grade: 4,
        element: 'Ignis',
        position: 'Vanguard',
        attackType: 'ranged',
        style: 'Collector',
        faction: 'New Star Guild',
        tags: ['Vanguard', 'Collector'],
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
        icon: '/stella/assets/Tilia.png',
        portrait: '/stella/assets/Tilia_portrait.png',
        background: '/stella/assets/Tilia_background.png',
        variants: { base: '/stella/assets/Tilia_base.png' },
        description: 'テスト説明',
        grade: 4,
        element: 'Lux',
        position: 'Support',
        attackType: 'melee',
        style: 'Steady',
        faction: 'Imperial Guard',
        tags: ['Support', 'Steady'],
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
      const { getQualitiesData } = await import('./getCharacterData')
      const result = await getQualitiesData()

      expect(result).toHaveProperty('コハク')
      expect(result).toHaveProperty('シア')
      expect(result['コハク'].main).toHaveLength(2)
      expect(result['コハク'].sub).toHaveLength(1)
      expect(result['シア'].main).toHaveLength(1)
      expect(result['シア'].sub).toHaveLength(1)

      // APIが正しいURLで呼び出されたことを確認（docs/characters.md より）
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.ennead.cc/stella/characters?lang=JP',
        expect.objectContaining({ next: { revalidate: 14400 } }),
      )
    })

    it('APIエラー時にローカルデータにフォールバックする', async () => {
      const mockLocalData = {
        コハク: {
          main: [{ description: 'テスト説明', fileName: '/test.png', title: 'テスト' }],
          sub: [{ description: 'テスト説明2', fileName: '/test2.png', title: 'テスト2' }],
        },
      }

      // APIリクエストが失敗するようにモック
      mockFetch.mockRejectedValue(new Error('Network error'))

      // fsモジュールのモック
      const { readFile } = await import('node:fs/promises')
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockLocalData))

      const { getQualitiesData } = await import('./getCharacterData')
      const result = await getQualitiesData()

      expect(result).toEqual(mockLocalData)
    })

    it('キャラクターにtalentsがない場合はスキップする', async () => {
      const mockCharacterList = [
        {
          id: 103,
          name: 'コハク',
          icon: '/stella/assets/Amber.png',
          portrait: '/stella/assets/head_10301_XL.png',
          description: 'テスト説明',
          grade: 4,
          element: 'Ignis',
          position: 'Vanguard',
          attackType: 'ranged',
          style: 'Collector',
          faction: 'New Star Guild',
          tags: [],
        },
        {
          id: 999,
          name: 'テスト',
          icon: '/stella/assets/Test.png',
          portrait: '/stella/assets/head_99901_XL.png',
          description: 'テスト説明',
          grade: 4,
          element: 'Ignis',
          position: 'Vanguard',
          attackType: 'ranged',
          style: 'Collector',
          faction: 'New Star Guild',
          tags: [],
        },
      ]

      const mockKohakuDetail = {
        id: 103,
        name: 'コハク',
        icon: '/stella/assets/Amber.png',
        portrait: '/stella/assets/Amber_portrait.png',
        background: '/stella/assets/Amber_background.png',
        variants: {},
        description: 'テスト説明',
        grade: 4,
        element: 'Ignis',
        position: 'Vanguard',
        attackType: 'ranged',
        style: 'Collector',
        faction: 'New Star Guild',
        tags: [],
        talents: {
          main: [{ name: '超火力', description: 'テスト' }],
          support: [{ name: '追尾の舞', description: 'テスト' }],
        },
      }

      const mockTestDetail = {
        id: 999,
        name: 'テスト',
        icon: '/stella/assets/Test.png',
        portrait: '/stella/assets/Test_portrait.png',
        background: '/stella/assets/Test_background.png',
        variants: {},
        description: 'テスト説明',
        grade: 4,
        element: 'Ignis',
        position: 'Vanguard',
        attackType: 'ranged',
        style: 'Collector',
        faction: 'New Star Guild',
        tags: [],
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

      const { getQualitiesData } = await import('./getCharacterData')
      const result = await getQualitiesData()

      expect(result).toHaveProperty('コハク')
      expect(result).not.toHaveProperty('テスト')
    })

    it('talentsが空の場合もスキップする', async () => {
      const mockCharacterList = [
        {
          id: 103,
          name: 'コハク',
          icon: '/stella/assets/Amber.png',
          portrait: '/stella/assets/head_10301_XL.png',
          description: 'テスト説明',
          grade: 4,
          element: 'Ignis',
          position: 'Vanguard',
          attackType: 'ranged',
          style: 'Collector',
          faction: 'New Star Guild',
          tags: [],
        },
      ]

      const mockKohakuDetail = {
        id: 103,
        name: 'コハク',
        icon: '/stella/assets/Amber.png',
        portrait: '/stella/assets/Amber_portrait.png',
        background: '/stella/assets/Amber_background.png',
        variants: {},
        description: 'テスト説明',
        grade: 4,
        element: 'Ignis',
        position: 'Vanguard',
        attackType: 'ranged',
        style: 'Collector',
        faction: 'New Star Guild',
        tags: [],
        talents: {
          main: [],
          support: [],
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

      const { getQualitiesData } = await import('./getCharacterData')
      const result = await getQualitiesData()

      expect(result).not.toHaveProperty('コハク')
    })
  })
})
