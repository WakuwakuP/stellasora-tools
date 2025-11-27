import { Suspense } from 'react'

import { BuildCreator } from 'app/build/BuildCreator'
import { BuildCreatorFallback, getAvailableCharacters } from 'app/build/utils'

export default async function BuildPage() {
  const availableCharacters = await getAvailableCharacters()

  return (
    <Suspense fallback={<BuildCreatorFallback />}>
      <BuildCreator qualitiesData={availableCharacters} />
    </Suspense>
  )
}
