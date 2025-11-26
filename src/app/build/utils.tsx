import type { CharacterQualities, QualitiesData } from 'types/quality'
import { CHARACTER_NAMES } from 'types/quality'

/**
 * qualities.jsonからデータを読み込む
 */
export async function getQualitiesData(): Promise<QualitiesData> {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')

  const filePath = path.join(
    process.cwd(),
    'public',
    'datasets',
    'qualities.json',
  )
  const data = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(data) as QualitiesData
}

/**
 * 利用可能なキャラクターデータのみを抽出
 */
export function getAvailableCharacters(
  qualitiesData: QualitiesData,
): Record<string, CharacterQualities> {
  return CHARACTER_NAMES.filter((name) => qualitiesData[name]).reduce(
    (acc, name) => {
      acc[name] = qualitiesData[name]
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
