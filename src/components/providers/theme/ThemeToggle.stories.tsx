import { type Meta, type StoryObj } from '@storybook/react'

import { ThemeProvider } from './ThemeProvider'
import { ThemeToggle } from './ThemeToggle'

const meta: Meta<typeof ThemeToggle> = {
  argTypes: {
    theme: {
      control: { type: 'radio' },
      description: '現在のテーマ',
      options: ['system', 'light', 'dark'],
    },
  },
  component: ThemeToggle,
  parameters: {
    docs: {
      description: {
        component: 'ライト/ダークモードを切り替えるトグルボタンコンポーネント',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof ThemeToggle>

export const Light: Story = {
  args: {
    theme: 'light',
  },
  globals: { theme: 'light' },
  render: () => (
    <ThemeProvider
      attribute="data-light"
      defaultTheme={'light'}
      storageKey="story-theme-light"
    >
      <ThemeToggle />
    </ThemeProvider>
  ),
}

export const Dark: Story = {
  args: {
    theme: 'dark',
  },
  globals: { theme: 'dark' },
  render: () => (
    <ThemeProvider
      attribute="data-dark"
      defaultTheme={'dark'}
      storageKey="story-theme-dark"
    >
      <ThemeToggle />
    </ThemeProvider>
  ),
}
