'use client'

import { useCallback, useEffect, useState } from 'react'

/** 保存されたビルドの型定義 */
export interface SavedBuild {
  createdAt: number
  id: string
  name: string
  url: string
  /** 総合平均ダメージ増加率（%） */
  totalScore?: number
}

const STORAGE_KEY = 'stellasora-saved-builds'

/** ランダムID生成用の基数（英数字） */
const RANDOM_ID_RADIX = 36
/** ランダムID生成用の開始位置 */
const RANDOM_ID_START = 2
/** ランダムID生成用の終了位置 */
const RANDOM_ID_END = 9

/**
 * ユニークなIDを生成する
 * crypto.randomUUID()が利用可能な場合はそちらを使用
 */
function generateUniqueId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `build-${crypto.randomUUID()}`
  }
  const randomPart = Math.random()
    .toString(RANDOM_ID_RADIX)
    .substring(RANDOM_ID_START, RANDOM_ID_END)
  return `build-${Date.now()}-${randomPart}`
}

/**
 * SavedBuildの配列かどうかを検証
 */
function isValidSavedBuilds(data: unknown): data is SavedBuild[] {
  if (!Array.isArray(data)) return false
  return data.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.url === 'string' &&
      typeof item.createdAt === 'number' &&
      (item.totalScore === undefined || typeof item.totalScore === 'number'),
  )
}

/**
 * ローカルストレージにビルドを保存・管理するフック
 */
export function useSavedBuilds() {
  const [builds, setBuilds] = useState<SavedBuild[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 初期化時にローカルストレージから読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: unknown = JSON.parse(stored)
        if (isValidSavedBuilds(parsed)) {
          setBuilds(parsed)
        } else {
          console.warn('Invalid saved builds data format, resetting')
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch (error) {
      console.warn('Failed to load saved builds:', error)
    }
    setIsLoaded(true)
  }, [])

  /**
   * ビルドをローカルストレージに追加
   * @param name - ビルド名
   * @param url - ビルドのURL（/build/...形式）
   * @param totalScore - 総合平均ダメージ増加率（%）
   * @returns 追加されたビルド情報
   */
  const addBuild = useCallback(
    (name: string, url: string, totalScore?: number) => {
      const newBuild: SavedBuild = {
        createdAt: Date.now(),
        id: generateUniqueId(),
        name,
        totalScore,
        url,
      }

      setBuilds((prev) => {
        const updated = [newBuild, ...prev]
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch (error) {
          console.warn('Failed to save build:', error)
        }
        return updated
      })

      return newBuild
    },
    [],
  )

  /**
   * ビルドをローカルストレージから削除
   * @param id - 削除するビルドのID
   */
  const removeBuild = useCallback((id: string) => {
    setBuilds((prev) => {
      const updated = prev.filter((build) => build.id !== id)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (error) {
        console.warn('Failed to remove build:', error)
      }
      return updated
    })
  }, [])

  /**
   * ビルド名を更新
   * @param id - 更新するビルドのID
   * @param newName - 新しいビルド名
   */
  const updateBuildName = useCallback((id: string, newName: string) => {
    setBuilds((prev) => {
      const updated = prev.map((build) =>
        build.id === id ? { ...build, name: newName } : build,
      )
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (error) {
        console.warn('Failed to update build name:', error)
      }
      return updated
    })
  }, [])

  return {
    addBuild,
    builds,
    isLoaded,
    removeBuild,
    updateBuildName,
  }
}
