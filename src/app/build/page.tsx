import { Suspense } from 'react'

import { BuildCreator } from 'app/build/BuildCreator'
import {
  BuildCreatorFallback,
  getAvailableCharacters,
  getLossRecordData,
} from 'app/build/utils'

export default async function BuildPage() {
  const [availableCharacters, lossRecordData] = await Promise.all([
    getAvailableCharacters(),
    getLossRecordData().catch(() => []), // API取得失敗時は空配列
  ])

  return (
    <Suspense fallback={<BuildCreatorFallback />}>
      <BuildCreator
        qualitiesData={availableCharacters}
        lossRecordData={lossRecordData}
      />
    </Suspense>
  )
}
