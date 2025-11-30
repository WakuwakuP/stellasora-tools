import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { LossRecordInfo } from 'types/lossRecord'
import { LossRecordSlots } from './LossRecordSlots'

const meta: Meta<typeof LossRecordSlots> = {
  title: 'Build/LossRecordSlots',
  component: LossRecordSlots,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    compact: {
      control: 'boolean',
      description: 'コンパクト表示（モバイル用）',
    },
    showSecondaryNotes: {
      control: 'boolean',
      description: 'サブスキル必要音符を表示するか（メインロスレコ用）',
    },
    onSlotClick: {
      action: 'slotClicked',
      description: 'スロットクリック時のハンドラー（ダイアログを開く）',
    },
    onDeselect: {
      action: 'deselected',
      description: '削除ボタンクリック時のハンドラー',
    },
  },
}

export default meta
type Story = StoryObj<typeof LossRecordSlots>

/** サンプルのロスレコデータ */
const sampleLossRecords: LossRecordInfo[] = [
  {
    id: 1,
    name: '火のロスレコ',
    iconUrl: '/placeholder-character.png',
    star: 5,
    element: '火',
    mainSkillName: 'メインスキル',
    mainSkillDescription: 'メインスキルの説明',
    supportNote: [
      { name: '火の音符', quantity: 2 },
      { name: '強撃の音符', quantity: 1 },
    ],
    secondarySkillNotes: [
      { name: '火の音符', quantity: 3 },
      { name: '必殺の音符', quantity: 2 },
    ],
    maxStats: [{ id: 'atk', label: '攻撃力', value: 100 }],
    mainSkill: {
      name: 'メインスキル',
      description: '説明',
      params: [['100']],
    },
    secondarySkills: [],
  },
  {
    id: 2,
    name: '水のロスレコ',
    iconUrl: '/placeholder-character.png',
    star: 4,
    element: '水',
    mainSkillName: 'メインスキル2',
    mainSkillDescription: 'メインスキルの説明2',
    supportNote: [{ name: '水の音符', quantity: 3 }],
    secondarySkillNotes: [
      { name: '水の音符', quantity: 2 },
      { name: '集中の音符', quantity: 1 },
    ],
    maxStats: [{ id: 'hp', label: 'HP', value: 500 }],
    mainSkill: {
      name: 'メインスキル2',
      description: '説明2',
      params: [['200']],
    },
    secondarySkills: [],
  },
  {
    id: 3,
    name: '風のロスレコ',
    iconUrl: '/placeholder-character.png',
    star: 3,
    element: '風',
    mainSkillName: 'メインスキル3',
    mainSkillDescription: 'メインスキルの説明3',
    supportNote: [{ name: '風の音符', quantity: 1 }],
    secondarySkillNotes: [{ name: '風の音符', quantity: 4 }],
    maxStats: [{ id: 'def', label: '防御力', value: 50 }],
    mainSkill: {
      name: 'メインスキル3',
      description: '説明3',
      params: [['150']],
    },
    secondarySkills: [],
  },
]

/** IDからロスレコを取得するヘルパー関数 */
const getLossRecordById = (id: number): LossRecordInfo | undefined => {
  return sampleLossRecords.find((lr) => lr.id === id)
}

/**
 * 空のスロット
 */
export const Empty: Story = {
  args: {
    lossRecordIds: [],
    getLossRecordById,
    compact: false,
    showSecondaryNotes: false,
  },
}

/**
 * 1つ選択済み
 */
export const OneSelected: Story = {
  args: {
    lossRecordIds: [1],
    getLossRecordById,
    compact: false,
    showSecondaryNotes: false,
  },
}

/**
 * 2つ選択済み
 */
export const TwoSelected: Story = {
  args: {
    lossRecordIds: [1, 2],
    getLossRecordById,
    compact: false,
    showSecondaryNotes: false,
  },
}

/**
 * 全スロット選択済み
 */
export const AllSelected: Story = {
  args: {
    lossRecordIds: [1, 2, 3],
    getLossRecordById,
    compact: false,
    showSecondaryNotes: false,
  },
}

/**
 * サブスキル必要音符を表示（メインロスレコ用）
 */
export const WithSecondaryNotes: Story = {
  args: {
    lossRecordIds: [1, 2, 3],
    getLossRecordById,
    compact: false,
    showSecondaryNotes: true,
  },
}

/**
 * コンパクト表示（モバイル用）
 */
export const Compact: Story = {
  args: {
    lossRecordIds: [1, 2],
    getLossRecordById,
    compact: true,
    showSecondaryNotes: false,
  },
}

/**
 * コンパクト表示・音符表示あり
 */
export const CompactWithNotes: Story = {
  args: {
    lossRecordIds: [1, 2, 3],
    getLossRecordById,
    compact: true,
    showSecondaryNotes: true,
  },
}

/**
 * インタラクティブなスロット
 */
export const Interactive: Story = {
  args: {
    lossRecordIds: [],
    getLossRecordById,
    compact: false,
    showSecondaryNotes: true,
  },
  render: function InteractiveSlots() {
    const [selectedIds, setSelectedIds] = useState<number[]>([1])

    const handleDeselect = (id: number) => {
      setSelectedIds((prev) => prev.filter((lrId) => lrId !== id))
    }

    const handleSlotClick = () => {
      // 次のIDを追加（デモ用）
      const nextId = selectedIds.length + 1
      if (nextId <= 3) {
        setSelectedIds((prev) => [...prev, nextId])
      }
    }

    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-slate-500">
          空きスロットをクリックして追加、×ボタンで削除
        </p>
        <div className="w-64">
          <LossRecordSlots
            lossRecordIds={selectedIds}
            getLossRecordById={getLossRecordById}
            onSlotClick={handleSlotClick}
            onDeselect={handleDeselect}
            showSecondaryNotes={true}
          />
        </div>
        <p className="text-xs text-slate-400">
          選択中: {selectedIds.join(', ') || 'なし'}
        </p>
      </div>
    )
  },
}
