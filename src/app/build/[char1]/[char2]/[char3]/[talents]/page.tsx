import { Suspense } from 'react'

import { BuildCreator } from '../../../../BuildCreator'
import {
  BuildCreatorFallback,
  getAvailableCharacters,
  getQualitiesData,
} from '../../../../utils'

interface Props {
  params: Promise<{
    char1: string
    char2: string
    char3: string
    talents: string
  }>
}

export default async function BuildWithParamsPage({ params }: Props) {
  const { char1, char2, char3, talents } = await params
  const qualitiesData = await getQualitiesData()
  const availableCharacters = getAvailableCharacters(qualitiesData)

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
