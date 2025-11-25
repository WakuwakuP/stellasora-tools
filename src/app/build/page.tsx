import {
  CHARACTER_NAMES,
  type CharacterQualities,
  type QualitiesData,
} from 'types/quality'

import { BuildCreator } from './BuildCreator'

async function getQualitiesData(): Promise<QualitiesData> {
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

export default async function BuildPage() {
  const qualitiesData = await getQualitiesData()

  // 利用可能なキャラクターデータのみを抽出
  const availableCharacters = CHARACTER_NAMES.filter(
    (name) => qualitiesData[name],
  ).reduce(
    (acc, name) => {
      acc[name] = qualitiesData[name]
      return acc
    },
    {} as Record<string, CharacterQualities>,
  )

  return <BuildCreator qualitiesData={availableCharacters} />
}
