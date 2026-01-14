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

  it('renders header with proper heading structure', () => {
    render(
      <SessionProvider session={null}>
        <LandingPage />
      </SessionProvider>,
    )
    const heading = screen.getByRole('heading', {
      level: 1,
      name: /Stellasora Tools/i,
    })
    expect(heading).toBeInTheDocument()
  })

  it('renders footer with copyright information and link to miyulab.dev', () => {
    render(
      <SessionProvider session={null}>
        <LandingPage />
      </SessionProvider>,
    )
    const currentYear = new Date().getFullYear()
    const expectedYear = currentYear === 2025 ? '2025' : `2025 - ${currentYear}`

    // Check copyright year text
    expect(screen.getByText(new RegExp(`© ${expectedYear}`))).toBeInTheDocument()

    // Check link to miyulab.dev
    const link = screen.getByRole('link', { name: /miyulab\.dev/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://www.miyulab.dev')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
