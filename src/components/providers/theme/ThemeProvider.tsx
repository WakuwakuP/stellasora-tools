'use client'

import {
  type Context,
  createContext,
  type JSX,
  useContext,
  useEffect,
  useState,
} from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  setTheme: () => null,
  theme: 'system',
}

const ThemeProviderContext: Context<ThemeProviderState> =
  createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  attribute = 'data-theme',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps): JSX.Element {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      return stored !== null && stored !== '' ? (stored as Theme) : defaultTheme
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement

    // Remove both data-theme attribute and dark class
    root.removeAttribute('data-theme')
    root.classList.remove('dark')

    let effectiveTheme = theme

    if (theme === 'system' && enableSystem) {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }

    // Set data-theme attribute for CSS custom properties
    root.setAttribute(attribute, effectiveTheme)

    // Add dark class for Tailwind dark: variants
    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
    }
  }, [theme, attribute, enableSystem])

  useEffect(() => {
    if (disableTransitionOnChange) {
      const css = document.createElement('style')
      css.appendChild(
        document.createTextNode(
          `*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`,
        ),
      )
      document.head.appendChild(css)

      return (): void => {
        document.head.removeChild(css)
      }
    }
  }, [disableTransitionOnChange])

  const value = {
    setTheme: (newTheme: Theme): void => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
    theme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
