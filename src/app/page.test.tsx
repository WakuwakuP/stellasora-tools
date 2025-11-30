import { render, screen } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import type React from 'react'
import { vi } from 'vitest'

import LandingPage from './page'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock useSession hook
vi.mock('next-auth/react', async () => {
  const actual = await vi.importActual('next-auth/react')
  return {
    ...actual,
    SessionProvider: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    useSession: () => ({
      data: null, // Not authenticated for landing page test
      status: 'unauthenticated',
    }),
  }
})

describe('Landing Page', () => {
  it('renders the landing page with title', () => {
    render(
      <SessionProvider session={null}>
        <LandingPage />
      </SessionProvider>,
    )
    expect(screen.getByText('Stellasora Tools')).toBeInTheDocument()
    expect(screen.getByText('Stellasoraツール集')).toBeInTheDocument()
  })

  it('renders the build maker card', () => {
    render(
      <SessionProvider session={null}>
        <LandingPage />
      </SessionProvider>,
    )
    expect(screen.getByText('ビルドメーカー')).toBeInTheDocument()
    expect(screen.getByText('ビルドを作成 →')).toBeInTheDocument()
  })

  it('has a link to the build page', () => {
    render(
      <SessionProvider session={null}>
        <LandingPage />
      </SessionProvider>,
    )
    const buildLink = screen.getByRole('link', { name: /ビルドメーカー/i })
    expect(buildLink).toHaveAttribute('href', '/build')
  })
})
