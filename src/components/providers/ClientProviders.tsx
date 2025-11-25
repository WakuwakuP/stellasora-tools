'use client'

import { SessionProvider } from 'next-auth/react'
import { type JSX, type ReactNode } from 'react'
import { Toaster } from '../ui/sonner'
import { ThemeProvider } from './theme/ThemeProvider'

export default function Providers({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="system"
        disableTransitionOnChange={true}
        enableSystem={true}
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
