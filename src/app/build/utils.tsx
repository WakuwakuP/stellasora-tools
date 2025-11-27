import { getQualitiesDataFromApi } from 'lib/stella-sora-api'
import type { CharacterQualities, QualitiesData } from 'types/quality'

/**
 * StellaSoraAPIから素質データを取得する
 * 4時間キャッシュで結果を保持
 */
export const getQualitiesData = getQualitiesDataFromApi

/**
 * 利用可能なキャラクターデータのみを抽出
 * APIから取得したデータはすべて有効なキャラクターデータなので、そのまま返す
 */
export function getAvailableCharacters(
  qualitiesData: QualitiesData,
): Record<string, CharacterQualities> {
  // APIから取得したデータはすべて有効
  // main と sub の両方が存在するキャラクターのみを返す
  return Object.entries(qualitiesData).reduce(
    (acc, [name, qualities]) => {
      if (qualities.main && qualities.sub) {
        acc[name] = qualities
      }
      return acc
    },
    {} as Record<string, CharacterQualities>,
  )
}

/**
 * ビルドクリエイター読み込み中のフォールバックUI
 */
export function BuildCreatorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg">読み込み中...</div>
    </div>
  )
}
