import { Suspense } from 'react'

import { BuildCreator } from './BuildCreator'
import {
  BuildCreatorFallback,
  getAvailableCharacters,
  getQualitiesData,
} from './utils'

export default async function BuildPage() {
  const qualitiesData = await getQualitiesData()
  const availableCharacters = getAvailableCharacters(qualitiesData)

  return (
    <Suspense fallback={<BuildCreatorFallback />}>
      <BuildCreator qualitiesData={availableCharacters} />
    </Suspense>
  )
}
