'use client'

import { Button } from 'components/ui/button'
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    clarity: (command: string, ...args: unknown[]) => void
  }
}

const CONSENT_COOKIE_NAME = 'consent_cookie'
const CONSENT_COOKIE_NAME_TIMESTAMP = 'consent_timestamp'

export default function ConsentBanner() {
  const [showBanner, setShowBanner] = useState<boolean>(false)

  const handleAccept = () => {
    const status = 'granted'
    clarity('consentv2', {
      ad_Storage: status,
      analytics_Storage: status,
    })

    localStorage.setItem(CONSENT_COOKIE_NAME, status)
    localStorage.setItem(CONSENT_COOKIE_NAME_TIMESTAMP, Date.now().toString())
    setShowBanner(false)
    console.log('User accepted cookies: consent updated to granted.')
  }

  const handleDecline = () => {
    const status = 'denied'
    clarity('consentv2', {
      ad_Storage: status,
      analytics_Storage: status,
    })
    localStorage.setItem(CONSENT_COOKIE_NAME, status)
    localStorage.setItem(CONSENT_COOKIE_NAME_TIMESTAMP, Date.now().toString())
    setShowBanner(false)
    console.log('User declined cookies: consent remains denied.')
  }

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_COOKIE_NAME)
    const consentTime = localStorage.getItem(CONSENT_COOKIE_NAME_TIMESTAMP)
    const now = Date.now()

    if (!consentTime) {
      // First time visitor, set default consent to denied
      clarity('consentv2', {
        ad_Storage: 'denied',
        analytics_Storage: 'denied',
      })
      localStorage.removeItem(CONSENT_COOKIE_NAME)
      localStorage.removeItem(CONSENT_COOKIE_NAME_TIMESTAMP)
      setShowBanner(true)
      console.log('First time visitor: default consent set to denied.')
      return
    }

    // If consent was given more than 1 year ago, reset it
    if (consentTime) {
      // biome-ignore lint/style/noMagicNumbers: one year in milliseconds
      const oneYear = 1000 * 60 * 60 * 24 * 365
      if (now - parseInt(consentTime, 10) > oneYear) {
        localStorage.removeItem(CONSENT_COOKIE_NAME)
        localStorage.removeItem(CONSENT_COOKIE_NAME_TIMESTAMP)

        clarity('consentv2', {
          ad_Storage: 'denied',
          analytics_Storage: 'denied',
        })
        setShowBanner(true)
        return
      }
    }

    if (!consent) {
      setShowBanner(true)
    }

    console.log('Consent banner initialized: default consent set to denied.')
  }, [])

  if (!showBanner) return null

  // TODO: 見た目を整える
  return (
    <div className="fixed right-0 bottom-0 left-0 z-100 border-gray-200 border-t bg-white p-4">
      <div className="flex gap-2">
        <div>
          <p>
            当サイトでは、サービス向上のためにMicrosoft
            Clarityを使用してアクセス解析を行っています。これにはクッキー(Cookie)の使用が含まれます。クッキーの使用に同意いただくことで、より良いサービスを提供できます。詳細は
            <a className="text-blue-600 hover:underline" href="/privacy_policy">
              プライバシーポリシー
            </a>
            をご確認ください。
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button onClick={handleAccept} variant="outline">
            同意
          </Button>
          <Button onClick={handleDecline} variant="outline">
            拒否
          </Button>
        </div>
      </div>
    </div>
  )
}
function clarity(
  command: string,
  // biome-ignore lint/suspicious/noExplicitAny: clarity params can be any object
  params: { [key: string]: any } | null = null,
) {
  // Check if Microsoft Clarity is loaded on the window object
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity(command, params)
  } else {
    // Log a warning if Clarity is not loaded yet
    console.warn('Microsoft Clarity is not loaded yet')
  }
}
