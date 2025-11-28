import { Suspense } from 'react'

import { BuildCreator } from 'app/build/BuildCreator'
import {
  BuildCreatorFallback,
  getAvailableCharacters,
  getLossRecordData,
} from 'app/build/utils'

interface Props {
  params: Promise<{
    char1: string
    char2: string
    char3: string
    talents: string
  }>
  searchParams: Promise<{
    main?: string
    sub?: string
  }>
}

export default async function BuildWithParamsPage({ params, searchParams }: Props) {
  const { char1, char2, char3, talents } = await params
  const { main: mainLossRecords, sub: subLossRecords } = await searchParams
  const [availableCharacters, lossRecordData] = await Promise.all([
    getAvailableCharacters(),
    getLossRecordData().catch(() => []), // API取得失敗時は空配列
  ])

  return (
    <Suspense fallback={<BuildCreatorFallback />}>
      <BuildCreator
        qualitiesData={availableCharacters}
        lossRecordData={lossRecordData}
        initialChar1={char1}
        initialChar2={char2}
        initialChar3={char3}
        initialTalents={talents}
        initialMainLossRecords={mainLossRecords}
        initialSubLossRecords={subLossRecords}
      />
    </Suspense>
  )
}
