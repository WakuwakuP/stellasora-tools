import { describe, expect, it, vi, beforeEach } from 'vitest'

// db モックを先に定義
const mockDbShortenedUrl = {
  create: vi.fn(),
  findFirst: vi.fn(),
  findUnique: vi.fn(),
}

vi.mock('@/lib/db', () => ({
  db: {
    shortenedUrl: mockDbShortenedUrl,
  },
}))

vi.mock('@/lib/url-utils', () => ({
  getBaseUrl: () => 'https://example.com',
}))

// crypto.getRandomValues のモック
const originalGetRandomValues = globalThis.crypto?.getRandomValues
beforeEach(() => {
  vi.clearAllMocks()
})

describe('createShortenedUrl', () => {
  it('有効なビルドURLの短縮URLを作成できる', async () => {
    const { createShortenedUrl } = await import('./shortenUrl')

    mockDbShortenedUrl.findFirst.mockResolvedValue(null)
    mockDbShortenedUrl.create.mockResolvedValue({
      code: 'testcode',
      id: 'test-id',
      originalUrl: 'https://example.com/build?c1=test',
    })

    const result = await createShortenedUrl('https://example.com/build?c1=test')

    expect('code' in result).toBe(true)
    if ('code' in result) {
      expect(result.code).toBeTruthy()
    }
  })

  it('無効なURLの場合はエラーを返す', async () => {
    const { createShortenedUrl } = await import('./shortenUrl')

    const result = await createShortenedUrl('https://example.com/other?test=1')

    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('/build?')
    }
  })

  it('/build? プレフィックスがないURLはエラー', async () => {
    const { createShortenedUrl } = await import('./shortenUrl')

    const result = await createShortenedUrl('https://other-domain.com/build?c1=test')

    expect('error' in result).toBe(true)
  })

  it('既に短縮済みのURLは既存のコードを返す', async () => {
    const { createShortenedUrl } = await import('./shortenUrl')

    mockDbShortenedUrl.findFirst.mockResolvedValue({
      code: 'existing',
      id: 'existing-id',
      originalUrl: 'https://example.com/build?c1=test',
    })

    const result = await createShortenedUrl('https://example.com/build?c1=test')

    expect('code' in result).toBe(true)
    if ('code' in result) {
      expect(result.code).toBe('existing')
    }
    expect(mockDbShortenedUrl.create).not.toHaveBeenCalled()
  })
})

describe('resolveShortCode', () => {
  it('短縮コードから元のURLを取得できる', async () => {
    const { resolveShortCode } = await import('./shortenUrl')

    mockDbShortenedUrl.findUnique.mockResolvedValue({
      code: 'testcode',
      id: 'test-id',
      originalUrl: 'https://example.com/build?c1=test',
    })

    const result = await resolveShortCode('testcode')

    expect(result).toBe('https://example.com/build?c1=test')
    expect(mockDbShortenedUrl.findUnique).toHaveBeenCalledWith({
      where: { code: 'testcode' },
    })
  })

  it('存在しない短縮コードはnullを返す', async () => {
    const { resolveShortCode } = await import('./shortenUrl')

    mockDbShortenedUrl.findUnique.mockResolvedValue(null)

    const result = await resolveShortCode('nonexistent')

    expect(result).toBeNull()
  })
})
