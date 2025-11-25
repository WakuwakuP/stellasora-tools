'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

/**
 * Hook to redirect authenticated users to the home page
 * Used on public pages like signin and landing page
 */
export function useAuthRedirect(): {
  session: ReturnType<typeof useSession>['data']
  status: ReturnType<typeof useSession>['status']
} {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session !== null) {
      router.push('/')
    }
  }, [session, router])

  return { session, status }
}
