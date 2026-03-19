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

  redirect(originalUrl as Route)
}
