import { describe, expect, it, vi } from 'vitest'

import {
  getCopyrightYear,
  isValidDate,
  safeParseDateToDate,
  safeParseDateToISOString,
  safeParseDateToTimeString,
} from './date-utils'

// HH:MM 形式の正規表現
const HH_MM_REGEX = /^\d{2}:\d{2}$/

describe('Date Utilities', () => {
  describe('safeParseDateToDate', () => {
    it('should handle valid Date objects', () => {
      const validDate = new Date('2024-04-15T10:30:00Z')
      const result = safeParseDateToDate(validDate)
      expect(result).toEqual(validDate)
    })

    it('should handle valid date strings', () => {
      const result = safeParseDateToDate('2024-04-15')
      expect(result).toBeInstanceOf(Date)
      // biome-ignore lint/style/noMagicNumbers: テストのためマジックナンバーを許容
      expect(result?.getFullYear()).toBe(2024)
    })

    it('should return null for invalid Date objects', () => {
      const invalidDate = new Date('invalid')
      const result = safeParseDateToDate(invalidDate)
      expect(result).toBeNull()
    })

    it('should return null for invalid date strings', () => {
      expect(safeParseDateToDate('invalid-date')).toBeNull()
      expect(safeParseDateToDate('not-a-date')).toBeNull()
    })

    it('should return null for null and undefined', () => {
      expect(safeParseDateToDate(null)).toBeNull()
      expect(safeParseDateToDate(undefined)).toBeNull()
    })

    it('should return null for non-date values', () => {
      expect(safeParseDateToDate({})).toBeNull()
      expect(safeParseDateToDate([])).toBeNull()
      expect(safeParseDateToDate(true)).toBeNull()
    })

    it('should handle numeric timestamps', () => {
      const timestamp = 1713178200000 // April 15, 2024
      const result = safeParseDateToDate(timestamp)
      expect(result).toBeInstanceOf(Date)
      // biome-ignore lint/style/noMagicNumbers: テストのためマジックナンバーを許容
      expect(result?.getFullYear()).toBe(2024)
    })
  })

  describe('safeParseDateToISOString', () => {
    it('should return ISO date string for valid dates', () => {
      const result = safeParseDateToISOString('2024-04-15T10:30:00Z')
      expect(result).toBe('2024-04-15')
    })

    it('should return null for invalid dates', () => {
      expect(safeParseDateToISOString('invalid-date')).toBeNull()
      expect(safeParseDateToISOString(null)).toBeNull()
    })
  })

  describe('safeParseDateToTimeString', () => {
    it('should return time string for valid dates', () => {
      const result = safeParseDateToTimeString('2024-04-15T10:30:00Z')
      expect(result).toMatch(HH_MM_REGEX) // HH:MM format
    })

    it('should return null for invalid dates', () => {
      expect(safeParseDateToTimeString('invalid-date')).toBeNull()
      expect(safeParseDateToTimeString(null)).toBeNull()
    })
  })

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate(new Date('2024-04-15'))).toBe(true)
      expect(isValidDate('2024-04-15')).toBe(true)
    })

    it('should return false for invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false)
      expect(isValidDate('invalid-date')).toBe(false)
      expect(isValidDate(null)).toBe(false)
      expect(isValidDate(undefined)).toBe(false)
    })
  })

  describe('getCopyrightYear', () => {
    it('should return a valid copyright year string', () => {
      const result = getCopyrightYear()
      const currentYear = new Date().getFullYear()

      if (currentYear === 2025) {
        expect(result).toBe('2025')
      } else {
        expect(result).toBe(`2025 - ${currentYear}`)
      }
    })

    it('should return a string', () => {
      const result = getCopyrightYear()
      expect(typeof result).toBe('string')
    })
  })
})
