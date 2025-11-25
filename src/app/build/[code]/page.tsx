import { type Metadata } from 'next'
import { type FC } from 'react'

import { decodeBuild, validateBuild } from 'lib/build-encoder'
import { BuildParseError } from 'types/build'

import { BuildView } from './BuildView'

interface Props {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  return {
    title: `ビルド詳細 - ${code}`,
    description: 'ステラソラ編成共有',
  }
}

const BuildPage: FC<Props> = async ({ params }) => {
  const { code } = await params

  try {
    const build = decodeBuild(code)
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

    return <BuildView build={build} code={code} />
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
          <p className="mt-4 text-gray-600 text-xs dark:text-gray-400">
            コード: {code}
          </p>
        </div>
      </div>
    )
  }
}

export default BuildPage
