import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { CharacterInfo } from './CharacterSelectDialog'
import { CharacterSelectDialog } from './CharacterSelectDialog'

const characters: CharacterInfo[] = [
  { name: 'コハク', iconUrl: 'https://api.ennead.cc/stella/assets/Kohaku.png' },
  { name: 'シア', iconUrl: 'https://api.ennead.cc/stella/assets/Sia.png' },
  { name: 'チトセ', iconUrl: 'https://api.ennead.cc/stella/assets/Chitose.png' },
  { name: 'テレサ', iconUrl: 'https://api.ennead.cc/stella/assets/Teresa.png' },
  { name: 'ナノハ', iconUrl: 'https://api.ennead.cc/stella/assets/Nanoha.png' },
  { name: 'フユカ', iconUrl: 'https://api.ennead.cc/stella/assets/Fuyuka.png' },
]
const characterNames = characters.map((c) => c.name)

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
    characters: {
      control: 'object',
      description: '選択可能なキャラクター情報のリスト',
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
    characters,
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
    characters,
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
    characters,
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
    characters,
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
          characters={characters}
          selectedName={selectedName}
          onSelect={setSelectedName}
          slotLabel="主力"
        />
      </div>
    )
  },
}
