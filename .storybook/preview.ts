import { withThemeByClassName } from '@storybook/addon-themes'
import { type Decorator, type Preview } from '@storybook/nextjs'
import {
  getRouter,
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from '@storybook/nextjs/navigation.mock'
import mockRouter from 'next-router-mock'
import { useMemo } from 'react'
import '../src/app/globals.css'

import { MockAuthGlobalTypes, withMockAuth } from './MockAuth'
import { withTailwindTheme } from './withTailwindTheme.decorator'

const preview: Preview = {
  beforeEach: () => {
    getRouter().push.mockImplementation(
      (...args: Parameters<typeof mockRouter.push>) => mockRouter.push(...args),
    )
    getRouter().replace.mockImplementation(
      (...args: Parameters<typeof mockRouter.replace>) =>
        mockRouter.replace(...args),
    )
    usePathname.mockImplementation(() => mockRouter.pathname)
    useSearchParams.mockImplementation(() => {
      const searchParams = useMemo(
        () =>
          new ReadonlyURLSearchParams(
            new URLSearchParams(mockRouter.query as Record<string, string>),
          ),
        [],
      )
      return searchParams
    })
  },
  globalTypes: {
    ...MockAuthGlobalTypes,
  },
  parameters: {
    chromatic: {
      modes: {
        dark: {
          theme: 'dark',
        },
        light: {
          theme: 'light',
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
}

export default preview

export const decorators: Decorator[] = [
  withTailwindTheme,
  withThemeByClassName({
    defaultTheme: 'light',
    parentSelector: '.docs-story',
    themes: {
      dark: 'dark bg-background text-foreground',
      light: 'light bg-background text-foreground',
    },
  }),
  withMockAuth,
]
