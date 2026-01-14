/**
 * ベースURL取得ユーティリティ
 */

/**
 * アプリケーションのベースURLを取得する
 * @returns ベースURL（プロトコル + ドメイン）
 */
export function getBaseUrl(): string {
  // プロダクション環境
  if (
    process.env.VERCEL_ENV === 'production' &&
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
  }

  // プレビュー環境
  if (process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`
  }

  // ローカル開発環境
  return 'http://localhost:3000'
}
