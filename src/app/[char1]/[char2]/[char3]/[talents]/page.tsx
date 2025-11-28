import { buildSearchParamKeys } from 'app/build/searchParams'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{
    char1: string
    char2: string
    char3: string
    talents: string
  }>
}

/**
 * 旧URL形式（ルートパス + パスパラメータ）から新URL形式（クエリパラメータ）にリダイレクト
 */
export default async function BuildPage({ params }: Props) {
  const { char1, char2, char3, talents } = await params

  // 新URLにリダイレクト
  const queryParams = new URLSearchParams()
  queryParams.set(buildSearchParamKeys.char1, decodeURIComponent(char1))
  queryParams.set(buildSearchParamKeys.char2, decodeURIComponent(char2))
  queryParams.set(buildSearchParamKeys.char3, decodeURIComponent(char3))
  queryParams.set(buildSearchParamKeys.talents, talents)

  redirect(`/build?${queryParams.toString()}`)
}
