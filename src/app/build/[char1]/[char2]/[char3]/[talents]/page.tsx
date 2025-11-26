import { Suspense } from 'react'
import {
  CHARACTER_NAMES,
  type CharacterQualities,
  type QualitiesData,
} from 'types/quality'

import { BuildCreator } from '../../../../BuildCreator'

interface Props {
  params: Promise<{
    char1: string
    char2: string
    char3: string
    talents: string
  }>
}

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

function BuildCreatorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg">読み込み中...</div>
    </div>
  )
}

export default async function BuildWithParamsPage({ params }: Props) {
  const { char1, char2, char3, talents } = await params
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

  return (
    <Suspense fallback={<BuildCreatorFallback />}>
      <BuildCreator
        qualitiesData={availableCharacters}
        initialChar1={char1}
        initialChar2={char2}
        initialChar3={char3}
        initialTalents={talents}
      />
    </Suspense>
  )
}
