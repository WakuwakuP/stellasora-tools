'use client'

import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { type JSX, useEffect, useState } from 'react'
import { ExhaustiveError } from 'utils/Error'
import { Button } from '../../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import { useTheme } from './ThemeProvider'

export function ThemeToggle(): JSX.Element {
  const { theme, setTheme } = useTheme()

  const [themeIcon, setThemeIcon] = useState<React.ReactNode>(
    <Monitor className="h-[1.2rem] w-[1.2rem]" />,
  )

  useEffect(() => {
    switch (theme) {
      case 'light':
        setThemeIcon(<Sun className="h-[1.2rem] w-[1.2rem]" />)
        break
      case 'dark':
        setThemeIcon(<Moon className="h-[1.2rem] w-[1.2rem]" />)
        break
      case 'system':
        setThemeIcon(<Monitor className="h-[1.2rem] w-[1.2rem]" />)
        break
      default:
        throw new ExhaustiveError(theme)
    }
  }, [theme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button size="icon" variant="outline">
          {themeIcon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={(): void => setTheme('light')}
        >
          <Sun className="h-4 w-4" />
          <span>ライト</span>
          {theme === 'light' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={(): void => setTheme('dark')}
        >
          <Moon className="h-4 w-4" />
          <span>ダーク</span>
          {theme === 'dark' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={(): void => setTheme('system')}
        >
          <Monitor className="h-4 w-4" />
          <span>システム</span>
          {theme === 'system' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
