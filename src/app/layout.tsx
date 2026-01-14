import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'components/ui/sonner'
import { type Metadata } from 'next'
import { type JSX } from 'react'
import Providers from '../components/providers/ClientProviders'

import './globals.css'

export const metadata: Metadata = {
  description: 'Nextjs Template With ZenStack, shadcn',
  title: 'Nextjs Template',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): JSX.Element {
  return (
    <html lang="ja" suppressHydrationWarning={true}>
      <body className="bg-background font-sans text-foreground antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
