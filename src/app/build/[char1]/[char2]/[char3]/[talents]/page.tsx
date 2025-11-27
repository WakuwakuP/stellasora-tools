import { Suspense } from 'react'

import { BuildCreator } from 'app/build/BuildCreator'
import { BuildCreatorFallback, getAvailableCharacters } from 'app/build/utils'

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
  const availableCharacters = await getAvailableCharacters()

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
