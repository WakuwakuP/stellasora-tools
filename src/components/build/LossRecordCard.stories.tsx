import { type Meta, type StoryObj } from '@storybook/react'
import type { LossRecordInfo } from 'types/lossRecord'
import { LossRecordCard } from './LossRecordCard'

const meta: Meta<typeof LossRecordCard> = {
  title: 'Build/LossRecordCard',
  component: LossRecordCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    isSelected: {
      control: 'boolean',
      description: '選択状態',
    },
    compact: {
      control: 'boolean',
      description: 'コンパクト表示（サブロスレコ用）',
    },
    onClick: {
      action: 'clicked',
      description: 'クリック時のコールバック',
    },
  },
}

export default meta
type Story = StoryObj<typeof LossRecordCard>

/** サンプルのロスレコデータ */
const sampleLossRecord: LossRecordInfo = {
  id: 1,
  name: 'サンプルロスレコ',
  iconUrl: '/placeholder-character.png',
  star: 5,
  element: '火',
  mainSkillName: 'メインスキル',
  mainSkillDescription: 'メインスキルの説明文です。\nダメージを与えます。',
  supportNote: [
    { name: '火の音符', quantity: 2 },
    { name: '強撃の音符', quantity: 1 },
  ],
  secondarySkillNotes: [
    { name: '火の音符', quantity: 3 },
    { name: '必殺の音符', quantity: 2 },
  ],
  maxStats: [
    { id: 'atk', label: '攻撃力', value: 100 },
    { id: 'hp', label: 'HP', value: 500 },
  ],
  mainSkill: {
    name: 'メインスキル',
    description: 'メインスキルの説明文です。',
    params: [['100', '10']],
  },
  secondarySkills: [
    {
      name: 'サブスキル1',
      description: 'サブスキルの説明文です。',
      params: [['50', '5']],
      requirements: [[{ name: '火の音符', quantity: 3 }]],
    },
  ],
}

/** 3★ロスレコ */
const star3LossRecord: LossRecordInfo = {
  ...sampleLossRecord,
  id: 2,
  name: '3★ロスレコ',
  star: 3,
  element: '水',
}

/** 4★ロスレコ */
const star4LossRecord: LossRecordInfo = {
  ...sampleLossRecord,
  id: 3,
  name: '4★ロスレコ',
  star: 4,
  element: '風',
}

/** 無属性ロスレコ */
const noElementLossRecord: LossRecordInfo = {
  ...sampleLossRecord,
  id: 4,
  name: '無属性ロスレコ',
  element: 'なし',
  supportNote: [],
  secondarySkillNotes: [],
}

/**
 * 未選択の5★火属性ロスレコ
 */
export const Default: Story = {
  args: {
    lossRecord: sampleLossRecord,
    isSelected: false,
    compact: false,
  },
}

/**
 * 選択済みのロスレコ
 */
export const Selected: Story = {
  args: {
    lossRecord: sampleLossRecord,
    isSelected: true,
    compact: false,
  },
}

/**
 * コンパクト表示（サブロスレコ用）
 */
export const Compact: Story = {
  args: {
    lossRecord: sampleLossRecord,
    isSelected: false,
    compact: true,
  },
}

/**
 * コンパクト表示・選択済み
 */
export const CompactSelected: Story = {
  args: {
    lossRecord: sampleLossRecord,
    isSelected: true,
    compact: true,
  },
}

/**
 * 3★ロスレコ
 */
export const Star3: Story = {
  args: {
    lossRecord: star3LossRecord,
    isSelected: false,
    compact: false,
  },
}

/**
 * 4★ロスレコ
 */
export const Star4: Story = {
  args: {
    lossRecord: star4LossRecord,
    isSelected: false,
    compact: false,
  },
}

/**
 * 無属性ロスレコ
 */
export const NoElement: Story = {
  args: {
    lossRecord: noElementLossRecord,
    isSelected: false,
    compact: false,
  },
}

/**
 * 複数ロスレコの比較表示
 */
export const ComparisonView: Story = {
  args: {
    lossRecord: sampleLossRecord,
    isSelected: false,
  },
  render: () => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium">5★火 未選択</span>
        <div className="w-32">
          <LossRecordCard
            lossRecord={sampleLossRecord}
            isSelected={false}
            onClick={() => {}}
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium">5★火 選択済み</span>
        <div className="w-32">
          <LossRecordCard
            lossRecord={sampleLossRecord}
            isSelected={true}
            onClick={() => {}}
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium">3★水</span>
        <div className="w-32">
          <LossRecordCard
            lossRecord={star3LossRecord}
            isSelected={false}
            onClick={() => {}}
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium">4★風</span>
        <div className="w-32">
          <LossRecordCard
            lossRecord={star4LossRecord}
            isSelected={false}
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  ),
}
