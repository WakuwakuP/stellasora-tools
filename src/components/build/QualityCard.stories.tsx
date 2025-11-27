import { type Meta, type StoryObj } from '@storybook/react'
import { QualityCard } from './QualityCard'

const meta: Meta<typeof QualityCard> = {
  title: 'Build/QualityCard',
  component: QualityCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    isSelected: {
      control: 'boolean',
      description: '選択状態',
    },
    level: {
      control: { type: 'number', min: 1, max: 6 },
      description: '素質のレベル（通常素質のみ）',
    },
    isCore: {
      control: 'boolean',
      description: 'コア素質かどうか',
    },
    onClick: {
      action: 'clicked',
      description: 'クリック時のコールバック',
    },
  },
}

export default meta
type Story = StoryObj<typeof QualityCard>

const sampleQuality = {
  description: 'これはサンプル素質の説明です。\nホバーで詳細が表示されます。',
  fileName: '/placeholder-character.png',
  isCore: false,
  rarity: 1,
  title: 'サンプル素質',
}

/**
 * 未選択の通常素質
 */
export const Default: Story = {
  args: {
    quality: sampleQuality,
    isSelected: false,
    isCore: false,
  },
}

/**
 * 選択済みの通常素質（レベル1）
 */
export const SelectedLevel1: Story = {
  args: {
    quality: sampleQuality,
    isSelected: true,
    level: 1,
    isCore: false,
  },
}

/**
 * 選択済みの通常素質（レベル6・最大）
 */
export const SelectedMaxLevel: Story = {
  args: {
    quality: sampleQuality,
    isSelected: true,
    level: 6,
    isCore: false,
  },
}

/**
 * 未選択のコア素質
 */
export const CoreUnselected: Story = {
  args: {
    quality: {
      ...sampleQuality,
      isCore: true,
      title: 'コア素質',
    },
    isSelected: false,
    isCore: true,
  },
}

/**
 * 選択済みのコア素質（チェックマーク表示）
 */
export const CoreSelected: Story = {
  args: {
    quality: {
      ...sampleQuality,
      isCore: true,
      title: 'コア素質',
    },
    isSelected: true,
    isCore: true,
  },
}

/**
 * 複数素質カードの比較表示
 */
export const ComparisonView: Story = {
  args: {
    quality: sampleQuality,
    isSelected: false,
    isCore: false,
  },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium">未選択</span>
        <QualityCard
          quality={sampleQuality}
          isSelected={false}
          isCore={false}
          onClick={() => {}}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium">選択済み (Lv.3)</span>
        <QualityCard
          quality={sampleQuality}
          isSelected={true}
          level={3}
          isCore={false}
          onClick={() => {}}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium">コア未選択</span>
        <QualityCard
          quality={{ ...sampleQuality, isCore: true, title: 'コア素質' }}
          isSelected={false}
          isCore={true}
          onClick={() => {}}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium">コア選択済み</span>
        <QualityCard
          quality={{ ...sampleQuality, isCore: true, title: 'コア素質' }}
          isSelected={true}
          isCore={true}
          onClick={() => {}}
        />
      </div>
    </div>
  ),
}
