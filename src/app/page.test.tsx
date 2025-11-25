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
  it('renders the landing page for unauthenticated users', () => {
    render(
      <SessionProvider session={null}>
        <LandingPage />
      </SessionProvider>,
    )
    expect(screen.getByText('Welcome to Our Landing Page')).toBeInTheDocument()
  })
})
