import { BuildShareRedirect } from 'app/b/[code]/BuildShareRedirect'

interface PageProps {
  params: Promise<{ code: string }>
}

/**
 * 短縮URLルート
 * /b/{code} にアクセスすると、コードを展開して /build にリダイレクトします
 */
export default async function BuildSharePage({ params }: PageProps) {
  const { code } = await params

  return <BuildShareRedirect code={code} />
}
