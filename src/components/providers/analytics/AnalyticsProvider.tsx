import { GoogleTagManager } from '@next/third-parties/google'
import ConsentBanner from './ConsentBanner'

/**
 * Google Analytics / Google Tag Manager の統合プロバイダー
 *
 * このコンポーネントは以下の機能を提供します:
 * - Google Tag Manager (GTM) の初期化と読み込み
 * - Clarity Cookie 同意バナーの表示と管理
 *
 * ## 環境変数
 * - `GTAG_ID`: Google Tag Manager のコンテナID (GTM-XXXXXXX形式)
 *   - 未設定の場合、コンポーネントは何もレンダリングしない
 *
 * ## 使用方法
 * アプリケーションのルートレイアウトに配置して使用します:
 * ```tsx
 * <AnalyticsProvider />
 * ```
 *
 * ## Cookie 同意管理
 * ConsentBanner コンポーネントを通じて、ユーザーの Cookie 同意を管理します。
 * 同意が得られるまで、トラッキングは実行されません。
 */
export default function AnalyticsProvider() {
  if (!process.env.GTAG_ID) {
    return null
  }

  return (
    <>
      <GoogleTagManager gtmId={process.env.GTAG_ID} />
      <ConsentBanner />
    </>
  )
}
