import { buildSearchParamKeys } from 'app/build/searchParams'
import { redirect } from 'next/navigation'

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

/**
 * 旧URL形式（パスパラメータ）から新URL形式（クエリパラメータ）にリダイレクト
 */
export default async function BuildWithParamsPage({ params, searchParams }: Props) {
  const { char1, char2, char3, talents } = await params
  const { main: mainLossRecords, sub: subLossRecords } = await searchParams

  // 新URLにリダイレクト
  const queryParams = new URLSearchParams()
  queryParams.set(buildSearchParamKeys.char1, decodeURIComponent(char1))
  queryParams.set(buildSearchParamKeys.char2, decodeURIComponent(char2))
  queryParams.set(buildSearchParamKeys.char3, decodeURIComponent(char3))
  queryParams.set(buildSearchParamKeys.talents, talents)

  if (mainLossRecords) {
    queryParams.set(buildSearchParamKeys.mainLossRecords, mainLossRecords)
  }
  if (subLossRecords) {
    queryParams.set(buildSearchParamKeys.subLossRecords, subLossRecords)
  }

  redirect(`/build?${queryParams.toString()}`)
}
