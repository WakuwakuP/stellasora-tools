import { type Route } from 'next'
import { notFound, redirect } from 'next/navigation'
import { db } from '@/lib/db'

interface Params {
  code: string
}

/**
 * ISRの再検証間隔設定（秒）- 1時間
 * キャッシュされたページを定期的に再検証して最新のデータを反映
 */
export const revalidate = 3600

async function getOriginalUrl(code: string): Promise<string | null> {
  const record = await db.shortenedUrl.findUnique({
    where: { code },
  })
  return record?.originalUrl ?? null
}

/**
 * 短縮URLから元のビルドURLへリダイレクトするページ
 * Next.jsのキャッシュ機構（ISR）を利用して高速に動作
 */
export default async function ShortUrlPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { code } = await params
  const originalUrl = await getOriginalUrl(code)

  if (!originalUrl) {
    notFound()
  }

  // フルURLからパス+クエリ部分を抽出し、エンコード済みURLでリダイレクト
  // DBにはフルURL（https://...）が保存されているが、redirect にそのまま渡すと
  // クエリパラメータ内の不正文字で ERR_INVALID_CHAR が発生する
  const parsed = new URL(originalUrl)
  const destination = `${parsed.pathname}${parsed.search}`

  redirect(destination as Route)
}
