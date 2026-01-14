import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useShare } from './useShare'

// toast のモック
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('useShare', () => {
  const mockOrigin = 'https://example.com'
  const originalLocation = window.location

  beforeEach(() => {
    // window.location をモック
    delete (window as Partial<Window>).location
    window.location = { ...originalLocation, origin: mockOrigin } as Location
  })

  afterEach(() => {
    window.location = originalLocation
    vi.clearAllMocks()
  })

  describe('Web Share API が使える場合', () => {
    it('Web Share API を使って共有する', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: mockShare,
        writable: true,
      })

      const { result } = renderHook(() => useShare())

      const shareResult = await result.current.share({
        text: 'test text',
        title: 'test title',
        url: '/test',
      })

      expect(shareResult).toBe(true)
      expect(mockShare).toHaveBeenCalledWith({
        text: 'test text',
        title: 'test title',
        url: `${mockOrigin}/test`,
      })
    })

    it('絶対URLの場合はそのまま使用する', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: mockShare,
        writable: true,
      })

      const { result } = renderHook(() => useShare())

      await result.current.share({
        title: 'test',
        url: 'https://other.com/test',
      })

      expect(mockShare).toHaveBeenCalledWith({
        text: undefined,
        title: 'test',
        url: 'https://other.com/test',
      })
    })

    it('ユーザーがキャンセルした場合はfalseを返す', async () => {
      const abortError = new Error('User cancelled')
      abortError.name = 'AbortError'
      const mockShare = vi.fn().mockRejectedValue(abortError)
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: mockShare,
        writable: true,
      })

      const { result } = renderHook(() => useShare())

      const shareResult = await result.current.share({
        url: '/test',
      })

      expect(shareResult).toBe(false)
    })

    it('Web Share APIがエラーの場合はクリップボードにフォールバック', async () => {
      const mockShare = vi.fn().mockRejectedValue(new Error('Share failed'))
      const mockWriteText = vi.fn().mockResolvedValue(undefined)

      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: mockShare,
        writable: true,
      })
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: mockWriteText },
        writable: true,
      })

      const { result } = renderHook(() => useShare())

      const shareResult = await result.current.share({
        url: '/test',
      })

      expect(shareResult).toBe(true)
      expect(mockWriteText).toHaveBeenCalledWith(`${mockOrigin}/test`)
    })
  })

  describe('Web Share API が使えない場合', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: undefined,
        writable: true,
      })
    })

    it('クリップボードにコピーする', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: mockWriteText },
        writable: true,
      })

      const { result } = renderHook(() => useShare())

      const shareResult = await result.current.share({
        url: '/test',
      })

      expect(shareResult).toBe(true)
      expect(mockWriteText).toHaveBeenCalledWith(`${mockOrigin}/test`)
    })

    it('クリップボードコピーが失敗した場合はfalseを返す', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Copy failed'))
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: mockWriteText },
        writable: true,
      })

      const { result } = renderHook(() => useShare())

      const shareResult = await result.current.share({
        url: '/test',
      })

      expect(shareResult).toBe(false)
    })
  })
})
