import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { CharacterInfo } from './CharacterSelectDialog'
import { CharacterSelectDialog } from './CharacterSelectDialog'

// 日本語APIレスポンスに合わせたテストデータ
const characters: CharacterInfo[] = [
  {
    element: '火',
    iconUrl: 'https://api.ennead.cc/stella/assets/Kohaku.png',
    name: 'コハク',
    position: 'アタッカー',
  },
  {
    element: '光',
    iconUrl: 'https://api.ennead.cc/stella/assets/Sia.png',
    name: 'シア',
    position: 'アタッカー',
  },
  {
    element: '水',
    iconUrl: 'https://api.ennead.cc/stella/assets/Chitose.png',
    name: 'チトセ',
    position: 'アタッカー',
  },
  {
    element: '水',
    iconUrl: 'https://api.ennead.cc/stella/assets/Teresa.png',
    name: 'テレサ',
    position: 'サポーター',
  },
  {
    element: '風',
    iconUrl: 'https://api.ennead.cc/stella/assets/Nanoha.png',
    name: 'ナノハ',
    position: 'アタッカー',
  },
  {
    element: '火',
    iconUrl: 'https://api.ennead.cc/stella/assets/Fuyuka.png',
    name: 'フユカ',
    position: 'アタッカー',
  },
  {
    element: '光',
    iconUrl: 'https://api.ennead.cc/stella/assets/Tiriya.png',
    name: 'ティリア',
    position: 'サポーター',
  },
  {
    element: '火',
    iconUrl: 'https://api.ennead.cc/stella/assets/Kashimira.png',
    name: 'カシミラ',
    position: 'バランサー',
  },
  {
    element: '水',
    iconUrl: 'https://api.ennead.cc/stella/assets/Ayame.png',
    name: 'アヤメ',
    position: 'バランサー',
  },
  {
    element: '風',
    iconUrl: 'https://api.ennead.cc/stella/assets/Seina.png',
    name: 'セイナ',
    position: 'アタッカー',
  },
  {
    element: '光',
    iconUrl: 'https://api.ennead.cc/stella/assets/Minerva.png',
    name: 'ミネルバ',
    position: 'バランサー',
  },
  {
    element: '地',
    iconUrl: 'https://api.ennead.cc/stella/assets/Gray.png',
    name: 'グレイ',
    position: 'アタッカー',
  },
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

/**
 * アイコンなしキャラクター（フォールバック表示のテスト）
 * アイコンURLが読み込めない場合にUserアイコンが表示されることを確認
 */
export const WithoutIcons: Story = {
  args: {
    open: true,
    characters: [
      {
        element: '火',
        name: 'キャラA',
        position: 'アタッカー',
      },
      {
        element: '水',
        name: 'キャラB',
        position: 'サポーター',
      },
      {
        element: '風',
        name: 'キャラC',
        position: 'バランサー',
      },
    ],
    selectedName: null,
    slotLabel: 'フォールバックテスト',
  },
}
