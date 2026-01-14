import { type Metadata } from 'next'
import { Suspense } from 'react'

import { buildSearchParamsCache } from 'app/build/searchParams'
import { BuildCreator } from 'app/build/BuildCreator'
import {
  BuildCreatorFallback,
  getAvailableCharacters,
  getLossRecordData,
} from 'app/build/utils'
import { generateBuildOgpUrl } from 'lib/build-ogp'

type BuildPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  props: BuildPageProps,
): Promise<Metadata> {
  const searchParams = await props.searchParams
  const params = buildSearchParamsCache.parse(searchParams)

  // ビルド名
  const buildName = params.n || 'ビルド編成'

  // キャラクター（3人）
  const characters = [params.c1, params.c2, params.c3]

  // ロスレコ
  const mainLossRecords = params.m || []
  const subLossRecords = params.s || []

  // OGP画像URL
  const ogpImageUrl = generateBuildOgpUrl({
    characters,
    mainLossRecords,
    name: buildName,
    subLossRecords,
  })

  return {
    description: `${buildName} - Stellasoraビルド編成`,
    openGraph: {
      description: `キャラクター: ${characters.filter(Boolean).join(', ')}`,
      images: [
        {
          height: 630,
          url: ogpImageUrl,
          width: 1200,
        },
      ],
      title: buildName,
      type: 'website',
    },
    title: buildName,
    twitter: {
      card: 'summary_large_image',
      description: `キャラクター: ${characters.filter(Boolean).join(', ')}`,
      images: [ogpImageUrl],
      title: buildName,
    },
  }
}

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

