import { describe, expect, it } from 'vitest'
import {
  arrayToBase7BigInt,
  base7BigIntToArray,
  bigIntToBase64Url,
  base64UrlToBigInt,
  TALENT_LEVELS,
} from './encoding-utils'

describe('encoding-utils', () => {
  describe('TALENT_LEVELS', () => {
    it('should support levels 0-9 (base 10)', () => {
      expect(TALENT_LEVELS).toBe(10)
    })
  })

  describe('arrayToBase7BigInt and base7BigIntToArray', () => {
    it('should encode and decode array with level 9', () => {
      const input = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      const encoded = arrayToBase7BigInt(input)
      const decoded = base7BigIntToArray(encoded, input.length)
      expect(decoded).toEqual(input)
    })

    it('should handle all zeros', () => {
      const input = [0, 0, 0, 0, 0]
      const encoded = arrayToBase7BigInt(input)
      const decoded = base7BigIntToArray(encoded, input.length)
      expect(decoded).toEqual(input)
    })

    it('should handle all max values (9)', () => {
      const input = [9, 9, 9, 9, 9]
      const encoded = arrayToBase7BigInt(input)
      const decoded = base7BigIntToArray(encoded, input.length)
      expect(decoded).toEqual(input)
    })

    it('should handle mixed values including high levels (7-9)', () => {
      const input = [1, 6, 7, 8, 9, 0, 3]
      const encoded = arrayToBase7BigInt(input)
      const decoded = base7BigIntToArray(encoded, input.length)
      expect(decoded).toEqual(input)
    })
  })

  describe('bigIntToBase64Url and base64UrlToBigInt', () => {
    it('should encode and decode bigint', () => {
      const value = BigInt('123456789')
      const encoded = bigIntToBase64Url(value)
      const decoded = base64UrlToBigInt(encoded)
      expect(decoded).toBe(value)
    })

    it('should handle zero', () => {
      const value = BigInt(0)
      const encoded = bigIntToBase64Url(value)
      expect(encoded).toBe('A')
      const decoded = base64UrlToBigInt(encoded)
      expect(decoded).toBe(value)
    })

    it('should handle large values', () => {
      const value = BigInt('999999999999999999')
      const encoded = bigIntToBase64Url(value)
      const decoded = base64UrlToBigInt(encoded)
      expect(decoded).toBe(value)
    })
  })

  describe('full round-trip with level 9 support', () => {
    it('should correctly encode and decode talents with level 9', () => {
      // Simulate 48 talents (16 per character × 3 characters)
      const talents = new Array(48).fill(0)
      // Set some talents to high levels (7-9)
      talents[0] = 7 // Character 1, talent 0, level 7
      talents[5] = 8 // Character 1, talent 5, level 8
      talents[16] = 9 // Character 2, talent 0, level 9
      talents[32] = 9 // Character 3, talent 0, level 9

      const bigInt = arrayToBase7BigInt(talents)
      const encoded = bigIntToBase64Url(bigInt)
      const decodedBigInt = base64UrlToBigInt(encoded)
      const decoded = base7BigIntToArray(decodedBigInt, 48)

      expect(decoded).toEqual(talents)
      expect(decoded[0]).toBe(7)
      expect(decoded[5]).toBe(8)
      expect(decoded[16]).toBe(9)
      expect(decoded[32]).toBe(9)
    })
  })
})
