import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { TalentSelector } from './TalentSelector'

describe('TalentSelector', () => {
  afterEach(() => {
    cleanup()
  })

  const defaultProps = {
    index: 0,
    onLevelChange: () => {},
    onNameChange: () => {},
    talent: {
      id: 0,
      level: 0,
      name: '',
    },
  }

  it('素質番号が表示される', () => {
    render(<TalentSelector {...defaultProps} index={2} />)

    expect(screen.getByText('素質 3')).toBeInTheDocument()
  })

  it('レベルが0の場合、素質名入力フィールドが無効になる', () => {
    render(<TalentSelector {...defaultProps} />)

    expect(screen.getByPlaceholderText('素質名を入力')).toBeDisabled()
  })

  it('レベルが1以上の場合、素質名入力フィールドが有効になる', () => {
    render(
      <TalentSelector
        {...defaultProps}
        talent={{ id: 0, level: 1, name: '' }}
      />,
    )

    expect(screen.getByPlaceholderText('素質名を入力')).toBeEnabled()
  })

  it('素質名を入力するとonNameChangeが呼ばれる', async () => {
    const user = userEvent.setup()
    const onNameChange = vi.fn()

    render(
      <TalentSelector
        {...defaultProps}
        talent={{ id: 0, level: 1, name: '' }}
        onNameChange={onNameChange}
      />,
    )

    const input = screen.getByPlaceholderText('素質名を入力')
    await user.type(input, 'テスト')

    expect(onNameChange).toHaveBeenCalled()
  })

  it('レベルが設定されている場合、カードがハイライトされる', () => {
    const { container } = render(
      <TalentSelector
        {...defaultProps}
        talent={{ id: 0, level: 3, name: 'テスト素質' }}
      />,
    )

    const card = container.querySelector('[class*="border-primary"]')
    expect(card).toBeInTheDocument()
  })
})
