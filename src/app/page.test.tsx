import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import LandingPage from './page'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('Landing Page', () => {
  it('renders the landing page with title', () => {
    render(<LandingPage />)
    expect(screen.getByText('Stellasora Tools')).toBeInTheDocument()
    expect(screen.getByText('Stellasoraツール集')).toBeInTheDocument()
  })

  it('renders the build maker card', () => {
    render(<LandingPage />)
    expect(screen.getByText('ビルドメーカー')).toBeInTheDocument()
    expect(screen.getByText('ビルドを作成 →')).toBeInTheDocument()
  })

  it('has a link to the build page', () => {
    render(<LandingPage />)
    const buildLink = screen.getByRole('link', { name: /ビルドメーカー/i })
    expect(buildLink).toHaveAttribute('href', '/build')
  })

  it('renders header with proper heading structure', () => {
    render(<LandingPage />)
    const heading = screen.getByRole('heading', {
      level: 1,
      name: /Stellasora Tools/i,
    })
    expect(heading).toBeInTheDocument()
  })

  it('renders footer with copyright information and link to miyulab.dev', () => {
    render(<LandingPage />)
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
