'use server'

/**
 * ビルドスコア計算のServer Action
 * Next.jsのunstable_cacheを使用してLLM実行結果をキャッシュ
 */

import { calculateBuildScore } from 'lib/build-score-calculator'
import { unstable_cache } from 'next/cache'
import {
  type BuildConfiguration,
  type BuildScoreResult,
} from 'types/buildScore'

/**
 * キャッシュ時間（24時間 = 86400秒）
 * LLMの結果は変わらないため長めにキャッシュ
 */
const CACHE_REVALIDATE_SECONDS = 86400

/**
 * ビルドスコアを計算する（キャッシュ付き）
 *
 * @param config - ビルド構成（キャラクター3人とディスク3つのID）
 * @returns ビルドスコア計算結果
 */
export async function calculateBuildScoreAction(
  config: BuildConfiguration,
): Promise<BuildScoreResult> {
  // キャッシュキーを生成（構成に基づいて一意に）
  const cacheKey = `build-score:chars:${config.characterIds.join('-')}:discs:${config.discIds.join('-')}`

  // キャッシュ化された関数を作成
  const cachedCalculate = unstable_cache(
    async () => calculateBuildScore(config),
    [cacheKey],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: [
        'build-score',
        ...config.characterIds.map((id) => `character:${id}`),
        ...config.discIds.map((id) => `disc:${id}`),
      ],
    },
  )

  return cachedCalculate()
}
