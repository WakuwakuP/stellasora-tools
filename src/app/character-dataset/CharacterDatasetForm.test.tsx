import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CharacterDatasetForm } from './CharacterDatasetForm'

describe('CharacterDatasetForm', () => {
  afterEach(() => {
    cleanup()
  })

  it('キャラクター名入力フィールドが表示される', () => {
    render(<CharacterDatasetForm />)

    expect(screen.getByLabelText('キャラクター名')).toBeInTheDocument()
  })

  it('主力と支援のタブが表示される', () => {
    render(<CharacterDatasetForm />)

    expect(screen.getByRole('tab', { name: '主力' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '支援' })).toBeInTheDocument()
  })

  it('主力タブがデフォルトで選択されている', () => {
    render(<CharacterDatasetForm />)

    expect(screen.getByRole('tab', { name: '主力' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: '支援' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('特化構築1、特化構築2、汎用素質のセクションが表示される', () => {
    render(<CharacterDatasetForm />)

    expect(
      screen.getByRole('heading', { name: '特化構築1' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '特化構築2' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '汎用素質' }),
    ).toBeInTheDocument()
  })

  it('キャラクター名が空の場合、データを出力ボタンが無効になる', () => {
    render(<CharacterDatasetForm />)

    expect(
      screen.getByRole('button', { name: 'データを出力' }),
    ).toBeDisabled()
  })

  it('キャラクター名を入力すると、データを出力ボタンが有効になる', async () => {
    const user = userEvent.setup()
    render(<CharacterDatasetForm />)

    const input = screen.getByLabelText('キャラクター名')
    await user.type(input, 'テストキャラクター')

    expect(
      screen.getByRole('button', { name: 'データを出力' }),
    ).toBeEnabled()
  })

  it('リセットボタンをクリックするとフォームがリセットされる', async () => {
    const user = userEvent.setup()
    render(<CharacterDatasetForm />)

    const input = screen.getByLabelText('キャラクター名')
    await user.type(input, 'テストキャラクター')
    expect(input).toHaveValue('テストキャラクター')

    const resetButton = screen.getByRole('button', { name: 'リセット' })
    await user.click(resetButton)

    expect(input).toHaveValue('')
  })

  it('支援タブをクリックすると支援タブが選択される', async () => {
    const user = userEvent.setup()
    render(<CharacterDatasetForm />)

    const supportTab = screen.getByRole('tab', { name: '支援' })
    await user.click(supportTab)

    expect(supportTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: '主力' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('データを出力ボタンをクリックするとアラートが表示される', async () => {
    const user = userEvent.setup()
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<CharacterDatasetForm />)

    const input = screen.getByLabelText('キャラクター名')
    await user.type(input, 'テストキャラクター')

    const exportButton = screen.getByRole('button', { name: 'データを出力' })
    await user.click(exportButton)

    expect(alertMock).toHaveBeenCalledWith('データがコンソールに出力されました')
    alertMock.mockRestore()
  })
})
