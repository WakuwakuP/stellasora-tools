import { type Meta, type StoryObj } from '@storybook/react'
import { CharacterAvatar } from './CharacterAvatar'

const meta: Meta<typeof CharacterAvatar> = {
  title: 'Build/CharacterAvatar',
  component: CharacterAvatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'キャラクター名',
    },
    label: {
      control: 'text',
      description: 'スロットのラベル',
    },
    isMain: {
      control: 'boolean',
      description: '主力キャラクターかどうか',
    },
    totalLevel: {
      control: { type: 'number', min: 0, max: 100 },
      description: '選択した素質の合計レベル',
    },
    onClick: {
      action: 'clicked',
      description: 'クリック時のコールバック',
    },
  },
}

export default meta
type Story = StoryObj<typeof CharacterAvatar>

/**
 * 主力キャラクター（選択済み）
 */
export const MainCharacter: Story = {
  args: {
    name: 'コハク',
    label: '主力',
    isMain: true,
    totalLevel: 15,
  },
}

/**
 * 支援キャラクター（選択済み）
 */
export const SupportCharacter: Story = {
  args: {
    name: 'シア',
    label: '支援1',
    isMain: false,
    totalLevel: 10,
  },
}

/**
 * 未選択の主力スロット
 */
export const MainUnselected: Story = {
  args: {
    name: null,
    label: '主力',
    isMain: true,
    totalLevel: 0,
  },
}

/**
 * 未選択の支援スロット
 */
export const SupportUnselected: Story = {
  args: {
    name: null,
    label: '支援1',
    isMain: false,
    totalLevel: 0,
  },
}

/**
 * レベル表示なし
 */
export const NoLevel: Story = {
  args: {
    name: 'テレサ',
    label: '支援2',
    isMain: false,
    totalLevel: 0,
  },
}

/**
 * パーティ編成（3キャラクター横並び）
 */
export const PartyFormation: Story = {
  args: {
    name: 'コハク',
    label: '主力',
    isMain: true,
  },
  render: () => (
    <div className="flex gap-4">
      <CharacterAvatar
        name="コハク"
        label="主力"
        isMain={true}
        totalLevel={20}
        onClick={() => {}}
      />
      <CharacterAvatar
        name="シア"
        label="支援1"
        isMain={false}
        totalLevel={12}
        onClick={() => {}}
      />
      <CharacterAvatar
        name="テレサ"
        label="支援2"
        isMain={false}
        totalLevel={8}
        onClick={() => {}}
      />
    </div>
  ),
}
