import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

// Mock the theme provider hook
vi.mock('./theme-provider', () => ({
  useTheme: () => ({
    setTheme: vi.fn(),
    theme: 'system',
  }),
}))

describe('ThemeToggle', () => {
  it('renders the theme toggle button', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(screen.getByText('Toggle theme')).toBeInTheDocument()
  })

  it('shows monitor icon for system theme by default', () => {
    render(<ThemeToggle />)

    // Check that a Monitor SVG icon is rendered
    const svg = screen.getByRole('button').querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg?.classList.contains('lucide-monitor')).toBe(true)
  })
})
