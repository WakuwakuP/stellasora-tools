import { Suspense } from 'react'

import { BuildCreator } from 'app/build/BuildCreator'
import {
  BuildCreatorFallback,
  getAvailableCharacters,
  getQualitiesData,
} from 'app/build/utils'

export default async function BuildPage() {
  const qualitiesData = await getQualitiesData()
  const availableCharacters = getAvailableCharacters(qualitiesData)

  return (
    <Suspense fallback={<BuildCreatorFallback />}>
      <BuildCreator qualitiesData={availableCharacters} />
    </Suspense>
  )
}
