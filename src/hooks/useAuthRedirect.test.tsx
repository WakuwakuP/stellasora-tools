import { renderHook } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { type FC, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useAuthRedirect } from './useAuthRedirect'

// Mock next/navigation
const mockPush: ReturnType<typeof vi.fn> = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock next-auth/react
const mockUseSession: ReturnType<typeof vi.fn> = vi.fn()
vi.mock('next-auth/react', async () => {
  const actual = await vi.importActual('next-auth/react')
  return {
    ...actual,
    SessionProvider: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    useSession: () => mockUseSession(),
  }
})

// Mock useEnvironment hook
const mockUseEnvironment: ReturnType<typeof vi.fn> = vi.fn()
vi.mock('./useEnvironment', () => ({
  useEnvironment: () => mockUseEnvironment(),
}))

describe('useAuthRedirect', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockUseEnvironment.mockReturnValue({
      environment: { shouldBypassAuth: false },
      isDevelopment: false,
      isPreview: false,
      isProduction: true,
      loading: false,
      shouldBypassAuth: false,
    })
  })

  it('redirects authenticated users to home', () => {
    const mockSession = {
      expires: '2024-12-31T23:59:59.999Z',
      user: { email: 'test@example.com', id: '1' },
    }

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    })

    const wrapper: FC<{ children: ReactNode }> = ({
      children,
    }: {
      children: ReactNode
    }) => <SessionProvider session={mockSession}>{children}</SessionProvider>

    renderHook(() => useAuthRedirect(), { wrapper })

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('does not redirect unauthenticated users', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    const wrapper: FC<{ children: ReactNode }> = ({
      children,
    }: {
      children: ReactNode
    }) => <SessionProvider session={null}>{children}</SessionProvider>

    renderHook(() => useAuthRedirect(), { wrapper })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('returns session data and status', () => {
    const mockSession = {
      expires: '2024-12-31T23:59:59.999Z',
      user: { email: 'test@example.com', id: '1' },
    }

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    })

    const wrapper: FC<{ children: ReactNode }> = ({
      children,
    }: {
      children: ReactNode
    }) => <SessionProvider session={mockSession}>{children}</SessionProvider>

    const { result } = renderHook(() => useAuthRedirect(), { wrapper })

    expect(result.current.session).toEqual(mockSession)
    expect(result.current.status).toBe('authenticated')
  })
})
