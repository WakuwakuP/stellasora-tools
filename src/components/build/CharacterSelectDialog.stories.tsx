import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'
import { CharacterSelectDialog } from './CharacterSelectDialog'

const characterNames = ['コハク', 'シア', 'チトセ', 'テレサ', 'ナノハ', 'フユカ']

const meta: Meta<typeof CharacterSelectDialog> = {
  title: 'Build/CharacterSelectDialog',
  component: CharacterSelectDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'ダイアログの開閉状態',
    },
    characterNames: {
      control: 'object',
      description: '選択可能なキャラクター名のリスト',
    },
    selectedName: {
      control: 'select',
      options: [null, ...characterNames],
      description: '現在選択中のキャラクター名',
    },
    slotLabel: {
      control: 'text',
      description: 'スロットのラベル',
    },
    onOpenChange: {
      action: 'openChanged',
      description: 'ダイアログの開閉状態変更ハンドラー',
    },
    onSelect: {
      action: 'selected',
      description: 'キャラクター選択時のハンドラー',
    },
  },
}

export default meta
type Story = StoryObj<typeof CharacterSelectDialog>

/**
 * 主力キャラクター選択ダイアログ
 */
export const MainCharacterSelect: Story = {
  args: {
    open: true,
    characterNames,
    selectedName: null,
    slotLabel: '主力',
  },
}

/**
 * キャラクター選択済みの状態
 */
export const WithSelection: Story = {
  args: {
    open: true,
    characterNames,
    selectedName: 'コハク',
    slotLabel: '主力',
  },
}

/**
 * 支援キャラクター選択ダイアログ
 */
export const SupportCharacterSelect: Story = {
  args: {
    open: true,
    characterNames,
    selectedName: 'シア',
    slotLabel: '支援1',
  },
}

/**
 * インタラクティブなダイアログ
 */
export const Interactive: Story = {
  args: {
    open: false,
    characterNames,
    selectedName: null,
    slotLabel: '主力',
  },
  render: function InteractiveDialog() {
    const [open, setOpen] = useState(false)
    const [selectedName, setSelectedName] = useState<string | null>(null)

    return (
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          キャラクター選択ダイアログを開く
        </button>
        {selectedName && (
          <p className="text-sm">
            選択中: <strong>{selectedName}</strong>
          </p>
        )}
        <CharacterSelectDialog
          open={open}
          onOpenChange={setOpen}
          characterNames={characterNames}
          selectedName={selectedName}
          onSelect={setSelectedName}
          slotLabel="主力"
        />
      </div>
    )
  },
}
