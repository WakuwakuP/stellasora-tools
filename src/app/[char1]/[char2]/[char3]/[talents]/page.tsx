import { buildFromPath, validateBuild } from 'lib/build-encoder-v2'
import { type Metadata } from 'next'
import { type FC } from 'react'
import { BuildParseError } from 'types/build'

import { BuildView } from './BuildView'

interface Props {
  params: Promise<{
    char1: string
    char2: string
    char3: string
    talents: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { char1, char2, char3 } = await params
  const decodedChar1 = decodeURIComponent(char1)
  const decodedChar2 = decodeURIComponent(char2)
  const decodedChar3 = decodeURIComponent(char3)

  return {
    description: 'ステラソラ編成共有',
    title: `${decodedChar1} / ${decodedChar2} / ${decodedChar3} - ビルド詳細`,
  }
}

const BuildPage: FC<Props> = async ({ params }) => {
  const { char1, char2, char3, talents } = await params

  try {
    const build = buildFromPath(char1, char2, char3, talents)
    const validation = validateBuild(build)

    if (!validation.valid) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
            <h1 className="mb-4 font-bold text-red-600 text-xl dark:text-red-400">
              ビルドエラー
            </h1>
            <ul className="list-inside list-disc space-y-1 text-red-600 text-sm dark:text-red-400">
              {validation.errors.map((error, index) => (
                <li key={`error-${index}-${error.slice(0, 10)}`}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )
    }

    const url = `/${char1}/${char2}/${char3}/${talents}`
    return <BuildView build={build} url={url} />
  } catch (error) {
    const message =
      error instanceof BuildParseError
        ? error.message
        : '不明なエラーが発生しました'

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
          <h1 className="mb-4 font-bold text-red-600 text-xl dark:text-red-400">
            ビルド解析エラー
          </h1>
          <p className="text-red-600 text-sm dark:text-red-400">{message}</p>
        </div>
      </div>
    )
  }
}

export default BuildPage
