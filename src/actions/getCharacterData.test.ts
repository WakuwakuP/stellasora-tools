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
        potentials: {
          mainCore: [
            { icon: '10301_Potential_01', name: '超火力', shortDescription: '主力スキル発動後、装弾数と通常攻撃ダメージが増加する。', description: '', params: [], rarity: 1, stype: 42, corner: null },
            { icon: '10301_Potential_02', name: '降雨弾', shortDescription: '主力スキル発動後、通常攻撃が範囲攻撃になる。', description: '', params: [], rarity: 1, stype: 42, corner: null },
            { icon: '10301_Potential_03', name: '緻密温度調整', shortDescription: '主力スキル発動後、すぐに再発動できるようになる。', description: '', params: [], rarity: 1, stype: 42, corner: null },
            { icon: '10301_Potential_04', name: '感情残響', shortDescription: '主力スキル命中時、範囲内に追加でダメージを与える。', description: '', params: [], rarity: 1, stype: 42, corner: null },
          ],
          mainNormal: [
            { icon: '10301_Potential_01', name: '貪欲銃火', shortDescription: 'コハクの会心が一定回数発生時、通常攻撃ダメージが増加する。', description: '', params: [], rarity: 2, stype: 41, corner: 1 },
          ],
          supportCore: [
            { icon: '10301_Potential_21', name: '追尾の舞', shortDescription: '支援スキルは敵を追撃するようになる。', description: '', params: [], rarity: 1, stype: 42, corner: null },
          ],
          supportNormal: [
            { icon: '10301_Potential_22', name: 'サポート素質', shortDescription: 'サポート素質の説明。', description: '', params: [], rarity: 2, stype: 41, corner: 1 },
          ],
          common: [
            { icon: '10301_Potential_41', name: '烈火の華', shortDescription: '必殺技発動後、コハクの攻撃力が上昇する。', description: '', params: [], rarity: 2, stype: 41, corner: 1 },
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

      const { getQualitiesData } = await import('./getCharacterData')
      const result = await getQualitiesData()

      expect(result).toHaveProperty('コハク')
      // main = mainCore(4) + mainNormal(1) + common(1) = 6
      expect(result['コハク'].main).toHaveLength(6)
      // sub = supportCore(1) + supportNormal(1) + common(1) = 3
      expect(result['コハク'].sub).toHaveLength(3)

      // APIが正しいURLで呼び出されたことを確認
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

    it('キャラクターにpotentialsがない場合はスキップする', async () => {
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
        potentials: {
          mainCore: [{ icon: 'icon1', name: '超火力', shortDescription: 'テスト', description: '', params: [], rarity: 1, stype: 42, corner: null }],
          mainNormal: [],
          supportCore: [{ icon: 'icon2', name: '追尾の舞', shortDescription: 'テスト', description: '', params: [], rarity: 1, stype: 42, corner: null }],
          supportNormal: [],
          common: [],
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
        // potentialsなし
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
  })

  describe('getAvailableCharacters', () => {
    it('mainとsubの両方が存在するキャラクターのみを返す', async () => {
      const mockCharacterList = [
        { id: 103, name: 'コハク', icon: '', portrait: '', description: '', grade: 4, element: '', position: '', attackType: '', style: '', faction: '', tags: [] },
        { id: 104, name: 'シア', icon: '', portrait: '', description: '', grade: 4, element: '', position: '', attackType: '', style: '', faction: '', tags: [] },
      ]

      const mockKohakuDetail = {
        id: 103,
        name: 'コハク',
        icon: '',
        portrait: '',
        background: '',
        variants: {},
        description: '',
        grade: 4,
        element: '',
        position: '',
        attackType: '',
        style: '',
        faction: '',
        tags: [],
        potentials: {
          mainCore: [{ icon: 'icon1', name: '素質1', shortDescription: '説明1', description: '', params: [], rarity: 1, stype: 42, corner: null }],
          mainNormal: [],
          supportCore: [{ icon: 'icon2', name: '素質2', shortDescription: '説明2', description: '', params: [], rarity: 1, stype: 42, corner: null }],
          supportNormal: [],
          common: [],
        },
      }

      const mockSiaDetail = {
        id: 104,
        name: 'シア',
        icon: '',
        portrait: '',
        background: '',
        variants: {},
        description: '',
        grade: 4,
        element: '',
        position: '',
        attackType: '',
        style: '',
        faction: '',
        tags: [],
        potentials: {
          mainCore: [],
          mainNormal: [],
          supportCore: [{ icon: 'icon3', name: '素質3', shortDescription: '説明3', description: '', params: [], rarity: 1, stype: 42, corner: null }],
          supportNormal: [],
          common: [],
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

      const { getAvailableCharacters } = await import('./getCharacterData')
      const result = await getAvailableCharacters()

      expect(result).toHaveProperty('コハク')
      expect(result).not.toHaveProperty('シア')
    })
  })
})
