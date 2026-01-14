import * as React from 'react'

const MOBILE_BREAKPOINT = 768

/**
 * 横向きモバイルの高さ閾値
 * この値はglobals.cssのlandscapeバリアント定義と一致させる必要があります
 * @see src/app/globals.css - @custom-variant landscape
 */
export const LANDSCAPE_HEIGHT_THRESHOLD = 500

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = (): void => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile !== undefined ? isMobile : false
}

/**
 * 横向きモバイル（ランドスケープ）かどうかを判定するフック
 * 画面の高さが閾値以下の場合、横向きモバイルと判定
 */
export function useIsLandscape(): boolean {
  const [isLandscape, setIsLandscape] = React.useState<boolean | undefined>(
    undefined,
  )

  React.useEffect(() => {
    const checkLandscape = (): void => {
      // 高さが閾値以下で、横向き（幅 > 高さ）の場合
      setIsLandscape(
        window.innerHeight < LANDSCAPE_HEIGHT_THRESHOLD &&
          window.innerWidth > window.innerHeight,
      )
    }

    window.addEventListener('resize', checkLandscape)
    window.addEventListener('orientationchange', checkLandscape)
    checkLandscape()

    return () => {
      window.removeEventListener('resize', checkLandscape)
      window.removeEventListener('orientationchange', checkLandscape)
    }
  }, [])

  return isLandscape !== undefined ? isLandscape : false
}
