import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSavedBuilds } from './useSavedBuilds'

// localStorage モック
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useSavedBuilds', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  it('初期状態で空のビルドリストを返す', () => {
    const { result } = renderHook(() => useSavedBuilds())
    expect(result.current.builds).toEqual([])
    expect(result.current.isLoaded).toBe(true)
  })

  it('ローカルストレージから保存済みビルドを読み込む', () => {
    const savedBuilds = [
      {
        createdAt: 1700000000000,
        id: 'build-1',
        name: 'テストビルド',
        url: '/build/test/test2/test3/abc',
      },
    ]
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedBuilds))

    const { result } = renderHook(() => useSavedBuilds())

    expect(result.current.builds).toEqual(savedBuilds)
    expect(result.current.isLoaded).toBe(true)
  })

  it('addBuild でビルドを追加できる', () => {
    const { result } = renderHook(() => useSavedBuilds())

    act(() => {
      result.current.addBuild('新規ビルド', '/build/char1/char2/char3/talents')
    })

    expect(result.current.builds).toHaveLength(1)
    expect(result.current.builds[0].name).toBe('新規ビルド')
    expect(result.current.builds[0].url).toBe('/build/char1/char2/char3/talents')
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('removeBuild でビルドを削除できる', () => {
    const savedBuilds = [
      {
        createdAt: 1700000000000,
        id: 'build-1',
        name: 'テストビルド',
        url: '/build/test/test2/test3/abc',
      },
    ]
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedBuilds))

    const { result } = renderHook(() => useSavedBuilds())

    act(() => {
      result.current.removeBuild('build-1')
    })

    expect(result.current.builds).toHaveLength(0)
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('updateBuildName でビルド名を更新できる', () => {
    const savedBuilds = [
      {
        createdAt: 1700000000000,
        id: 'build-1',
        name: 'テストビルド',
        url: '/build/test/test2/test3/abc',
      },
    ]
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedBuilds))

    const { result } = renderHook(() => useSavedBuilds())

    act(() => {
      result.current.updateBuildName('build-1', '更新後のビルド名')
    })

    expect(result.current.builds[0].name).toBe('更新後のビルド名')
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('複数のビルドを追加できる', () => {
    const { result } = renderHook(() => useSavedBuilds())

    act(() => {
      result.current.addBuild('ビルド1', '/build/a/b/c/d')
    })

    act(() => {
      result.current.addBuild('ビルド2', '/build/e/f/g/h')
    })

    expect(result.current.builds).toHaveLength(2)
    // 新しいビルドが先頭に追加される
    expect(result.current.builds[0].name).toBe('ビルド2')
    expect(result.current.builds[1].name).toBe('ビルド1')
  })

  it('不正なデータ形式の場合は空配列を返す', () => {
    const invalidData = [{ invalid: 'data' }]
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(invalidData))

    const { result } = renderHook(() => useSavedBuilds())

    expect(result.current.builds).toEqual([])
    expect(result.current.isLoaded).toBe(true)
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      'stellasora-saved-builds',
    )
  })
})
