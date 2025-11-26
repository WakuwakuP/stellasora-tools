'use client'

import { useCallback, useEffect, useState } from 'react'

/** 保存されたビルドの型定義 */
export interface SavedBuild {
  id: string
  name: string
  url: string
  createdAt: number
}

const STORAGE_KEY = 'stellasora-saved-builds'

/** ランダムID生成用の基数（英数字） */
const RANDOM_ID_RADIX = 36
/** ランダムID生成用の開始位置 */
const RANDOM_ID_START = 2
/** ランダムID生成用の終了位置 */
const RANDOM_ID_END = 9

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
        const parsed = JSON.parse(stored) as SavedBuild[]
        setBuilds(parsed)
      }
    } catch (error) {
      console.warn('Failed to load saved builds:', error)
    }
    setIsLoaded(true)
  }, [])

  // ビルドの追加
  const addBuild = useCallback((name: string, url: string) => {
    const randomPart = Math.random()
      .toString(RANDOM_ID_RADIX)
      .substring(RANDOM_ID_START, RANDOM_ID_END)
    const newBuild: SavedBuild = {
      createdAt: Date.now(),
      id: `build-${Date.now()}-${randomPart}`,
      name,
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
  }, [])

  // ビルドの削除
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

  // ビルド名の更新
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
