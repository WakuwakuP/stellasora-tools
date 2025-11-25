import { useEffect } from 'react'

export const DEFAULT_THEME = 'light'

export const withTailwindTheme = (Story, context) => {
  const { theme } = context.globals

  useEffect(() => {
    const htmlTag = document.documentElement

    // Set the "data-theme" attribute on the iFrame html tag
    htmlTag.setAttribute('data-theme', theme || DEFAULT_THEME)
    htmlTag.classList.add('bg-background', 'text-foreground')
  }, [theme])

  return <Story />
}
