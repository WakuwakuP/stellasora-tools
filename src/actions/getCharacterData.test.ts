import { beforeEach, describe, expect, it, vi } from 'vitest'

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
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getQualitiesData', () => {
    it('ローカルのqualities.jsonからデータを取得できる', async () => {
      const mockLocalData = {
        コハク: {
          main: [
            { description: 'テスト説明1', fileName: '/test1.png', title: 'テスト1' },
            { description: 'テスト説明2', fileName: '/test2.png', title: 'テスト2' },
          ],
          sub: [{ description: 'テスト説明3', fileName: '/test3.png', title: 'テスト3' }],
        },
        シア: {
          main: [{ description: 'テスト説明4', fileName: '/test4.png', title: 'テスト4' }],
          sub: [{ description: 'テスト説明5', fileName: '/test5.png', title: 'テスト5' }],
        },
      }

      // fsモジュールのモック
      const { readFile } = await import('node:fs/promises')
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockLocalData))

      const { getQualitiesData } = await import('./getCharacterData')
      const result = await getQualitiesData()

      expect(result).toHaveProperty('コハク')
      expect(result).toHaveProperty('シア')
      expect(result['コハク'].main).toHaveLength(2)
      expect(result['コハク'].sub).toHaveLength(1)
      expect(result['シア'].main).toHaveLength(1)
      expect(result['シア'].sub).toHaveLength(1)
    })
  })

  describe('getCharacterNames', () => {
    it('キャラクター名一覧を取得できる', async () => {
      const mockLocalData = {
        コハク: { main: [], sub: [] },
        シア: { main: [], sub: [] },
        チトセ: { main: [], sub: [] },
      }

      const { readFile } = await import('node:fs/promises')
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockLocalData))

      const { getCharacterNames } = await import('./getCharacterData')
      const result = await getCharacterNames()

      expect(result).toEqual(['コハク', 'シア', 'チトセ'])
    })
  })

  describe('getAvailableCharacters', () => {
    it('mainとsubの両方が存在するキャラクターのみを返す', async () => {
      const mockLocalData = {
        コハク: {
          main: [{ description: 'テスト説明1', fileName: '/test1.png', title: 'テスト1' }],
          sub: [{ description: 'テスト説明2', fileName: '/test2.png', title: 'テスト2' }],
        },
        シア: {
          main: [],
          sub: [{ description: 'テスト説明3', fileName: '/test3.png', title: 'テスト3' }],
        },
        チトセ: {
          main: [{ description: 'テスト説明4', fileName: '/test4.png', title: 'テスト4' }],
          sub: [],
        },
      }

      const { readFile } = await import('node:fs/promises')
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockLocalData))

      const { getAvailableCharacters } = await import('./getCharacterData')
      const result = await getAvailableCharacters()

      expect(result).toHaveProperty('コハク')
      expect(result).not.toHaveProperty('シア')
      expect(result).not.toHaveProperty('チトセ')
    })
  })
})
