import { describe, expect, it } from 'vitest'

import {
  compressQueryString,
  decompressToQueryString,
  expandShareCode,
  generateShareCode,
  generateShortUrl,
} from './url-compression'

describe('url-compression', () => {
  describe('compressQueryString / decompressToQueryString', () => {
    it('should compress and decompress a simple query string', () => {
      const query = 'c1=キャラ1&c2=キャラ2&c3=キャラ3&t=ABC123'

      const compressed = compressQueryString(query)
      const decompressed = decompressToQueryString(compressed)

      expect(decompressed).toBe(query)
    })

    it('should handle query string with ? prefix', () => {
      const queryWithPrefix = '?c1=キャラ1&c2=キャラ2'
      const expectedQuery = 'c1=キャラ1&c2=キャラ2'

      const compressed = compressQueryString(queryWithPrefix)
      const decompressed = decompressToQueryString(compressed)

      expect(decompressed).toBe(expectedQuery)
    })

    it('should produce URL-safe characters only', () => {
      const query = 'c1=テスト&c2=キャラクター名&t=XYZ789'
      const compressed = compressQueryString(query)

      // Base64URL文字のみを含む
      expect(compressed).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should handle complex query with arrays', () => {
      const query = 'c1=キャラ1&c2=キャラ2&c3=キャラ3&m=1,2,3&s=4,5,6&t=ABC'

      const compressed = compressQueryString(query)
      const decompressed = decompressToQueryString(compressed)

      expect(decompressed).toBe(query)
    })

    it('should handle empty query string', () => {
      const query = ''
      const compressed = compressQueryString(query)
      const decompressed = decompressToQueryString(compressed)

      expect(decompressed).toBe(query)
    })
  })

  describe('generateShareCode / expandShareCode', () => {
    it('should generate and expand share code from build URL', () => {
      const buildUrl = '/build?c1=キャラ1&c2=キャラ2&c3=キャラ3&t=ABC123'

      const code = generateShareCode(buildUrl)
      const expandedUrl = expandShareCode(code)

      expect(expandedUrl).toBe(buildUrl)
    })

    it('should throw error if URL has no query string', () => {
      const invalidUrl = '/build'

      expect(() => generateShareCode(invalidUrl)).toThrow('No query string in URL')
    })

    it('should throw error for invalid encoded code', () => {
      // 不正なBase64URL文字を含むコード
      const invalidCode = '!!!invalid!!!'

      expect(() => expandShareCode(invalidCode)).toThrow('Invalid encoded code')
    })
  })

  describe('generateShortUrl', () => {
    it('should generate short URL with /b/ prefix', () => {
      const buildUrl = '/build?c1=キャラ1&c2=キャラ2&c3=キャラ3&t=ABC123'

      const shortUrl = generateShortUrl(buildUrl)

      expect(shortUrl).toMatch(/^\/b\/[A-Za-z0-9_-]+$/)
    })

    it('should generate reproducible short URLs', () => {
      const buildUrl = '/build?c1=キャラ1&c2=キャラ2&c3=キャラ3&t=ABC123'

      const shortUrl1 = generateShortUrl(buildUrl)
      const shortUrl2 = generateShortUrl(buildUrl)

      expect(shortUrl1).toBe(shortUrl2)
    })

    it('should roundtrip correctly', () => {
      const originalUrl = '/build?c1=キャラ1&c2=キャラ2&c3=キャラ3&t=ABC&n=テストビルド'

      const shortUrl = generateShortUrl(originalUrl)
      const code = shortUrl.replace('/b/', '')
      const restoredUrl = expandShareCode(code)

      expect(restoredUrl).toBe(originalUrl)
    })
  })
})
