import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { LossRecordInfo } from 'types/lossRecord'
import { LossRecordSelectDialog } from './LossRecordSelectDialog'

const meta: Meta<typeof LossRecordSelectDialog> = {
  title: 'Build/LossRecordSelectDialog',
  component: LossRecordSelectDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'ダイアログの開閉状態',
    },
    title: {
      control: 'text',
      description: 'ダイアログタイトル',
    },
    maxSelection: {
      control: { type: 'number', min: 1, max: 5 },
      description: '最大選択数',
    },
    onOpenChange: {
      action: 'openChanged',
      description: 'ダイアログの開閉状態変更ハンドラー',
    },
    onSelect: {
      action: 'selected',
      description: 'ロスレコ選択時のハンドラー',
    },
    onDeselect: {
      action: 'deselected',
      description: '選択解除時のハンドラー',
    },
  },
}

export default meta
type Story = StoryObj<typeof LossRecordSelectDialog>

/** サンプルのロスレコデータ */
const sampleLossRecords: LossRecordInfo[] = [
  {
    id: 1,
    name: '炎の守護者',
    iconUrl: '/placeholder-character.png',
    star: 5,
    element: '火',
    mainSkillName: '炎の加護',
    mainSkillDescription: '火属性ダメージを30%増加させる',
    supportNote: [{ name: '火の音符', quantity: 3 }],
    secondarySkillNotes: [{ name: '火の音符', quantity: 2 }],
    maxStats: [{ id: 'atk', label: '攻撃力', value: 150 }],
    mainSkill: { name: '炎の加護', description: '説明', params: [['30']] },
    secondarySkills: [],
  },
  {
    id: 2,
    name: '水の精霊',
    iconUrl: '/placeholder-character.png',
    star: 5,
    element: '水',
    mainSkillName: '水の恵み',
    mainSkillDescription: 'HP回復量を25%増加させる',
    supportNote: [{ name: '水の音符', quantity: 3 }],
    secondarySkillNotes: [{ name: '水の音符', quantity: 2 }],
    maxStats: [{ id: 'hp', label: 'HP', value: 800 }],
    mainSkill: { name: '水の恵み', description: '説明', params: [['25']] },
    secondarySkills: [],
  },
  {
    id: 3,
    name: '疾風の刃',
    iconUrl: '/placeholder-character.png',
    star: 4,
    element: '風',
    mainSkillName: '風の加速',
    mainSkillDescription: '攻撃速度を20%増加させる',
    supportNote: [{ name: '風の音符', quantity: 2 }],
    secondarySkillNotes: [{ name: '風の音符', quantity: 3 }],
    maxStats: [{ id: 'spd', label: '速度', value: 50 }],
    mainSkill: { name: '風の加速', description: '説明', params: [['20']] },
    secondarySkills: [],
  },
  {
    id: 4,
    name: '大地の盾',
    iconUrl: '/placeholder-character.png',
    star: 4,
    element: '地',
    mainSkillName: '大地の守り',
    mainSkillDescription: '防御力を35%増加させる',
    supportNote: [{ name: '地の音符', quantity: 2 }],
    secondarySkillNotes: [{ name: '地の音符', quantity: 2 }],
    maxStats: [{ id: 'def', label: '防御力', value: 100 }],
    mainSkill: { name: '大地の守り', description: '説明', params: [['35']] },
    secondarySkills: [],
  },
  {
    id: 5,
    name: '光の祝福',
    iconUrl: '/placeholder-character.png',
    star: 5,
    element: '光',
    mainSkillName: '光の加護',
    mainSkillDescription: '全ステータスを15%増加させる',
    supportNote: [{ name: '光の音符', quantity: 4 }],
    secondarySkillNotes: [{ name: '光の音符', quantity: 3 }],
    maxStats: [{ id: 'all', label: '全ステータス', value: 50 }],
    mainSkill: { name: '光の加護', description: '説明', params: [['15']] },
    secondarySkills: [],
  },
  {
    id: 6,
    name: '闇の契約',
    iconUrl: '/placeholder-character.png',
    star: 5,
    element: '闇',
    mainSkillName: '闇の力',
    mainSkillDescription: 'クリティカル率を25%増加させる',
    supportNote: [{ name: '闇の音符', quantity: 3 }],
    secondarySkillNotes: [{ name: '闇の音符', quantity: 2 }],
    maxStats: [{ id: 'crit', label: 'クリティカル率', value: 25, unit: '%' }],
    mainSkill: { name: '闇の力', description: '説明', params: [['25']] },
    secondarySkills: [],
  },
  {
    id: 7,
    name: '無の境地',
    iconUrl: '/placeholder-character.png',
    star: 3,
    element: 'なし',
    mainSkillName: '無の極意',
    mainSkillDescription: '経験値獲得量を20%増加させる',
    supportNote: [{ name: '強撃の音符', quantity: 1 }],
    secondarySkillNotes: [{ name: '強撃の音符', quantity: 2 }],
    maxStats: [{ id: 'exp', label: '経験値', value: 20, unit: '%' }],
    mainSkill: { name: '無の極意', description: '説明', params: [['20']] },
    secondarySkills: [],
  },
  {
    id: 8,
    name: '炎舞の極意',
    iconUrl: '/placeholder-character.png',
    star: 3,
    element: '火',
    mainSkillName: '炎舞',
    mainSkillDescription: '火属性攻撃を強化する',
    supportNote: [{ name: '火の音符', quantity: 1 }],
    secondarySkillNotes: [{ name: '火の音符', quantity: 1 }],
    maxStats: [{ id: 'atk', label: '攻撃力', value: 50 }],
    mainSkill: { name: '炎舞', description: '説明', params: [['10']] },
    secondarySkills: [],
  },
]

/**
 * メインロスレコ選択ダイアログ（デフォルト）
 */
export const Default: Story = {
  args: {
    open: true,
    lossRecords: sampleLossRecords,
    selectedIds: [],
    title: 'メインロスレコを選択',
    maxSelection: 3,
  },
}

/**
 * 1つ選択済み
 */
export const WithOneSelection: Story = {
  args: {
    open: true,
    lossRecords: sampleLossRecords,
    selectedIds: [1],
    title: 'メインロスレコを選択',
    maxSelection: 3,
  },
}

/**
 * 最大数選択済み
 */
export const MaxSelected: Story = {
  args: {
    open: true,
    lossRecords: sampleLossRecords,
    selectedIds: [1, 2, 3],
    title: 'メインロスレコを選択',
    maxSelection: 3,
  },
}

/**
 * インタラクティブなダイアログ
 */
export const Interactive: Story = {
  args: {
    open: false,
    lossRecords: sampleLossRecords,
    selectedIds: [],
    title: 'メインロスレコを選択',
    maxSelection: 3,
  },
  render: function InteractiveDialog() {
    const [open, setOpen] = useState(false)
    const [selectedIds, setSelectedIds] = useState<number[]>([])

    const handleSelect = (id: number) => {
      if (selectedIds.length < 3 && !selectedIds.includes(id)) {
        setSelectedIds((prev) => [...prev, id])
      }
    }

    const handleDeselect = (id: number) => {
      setSelectedIds((prev) => prev.filter((lrId) => lrId !== id))
    }

    return (
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          ロスレコ選択ダイアログを開く
        </button>
        <p className="text-sm text-slate-500">
          選択中: {selectedIds.length} / 3
        </p>
        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            {selectedIds.map((id) => {
              const lr = sampleLossRecords.find((l) => l.id === id)
              return (
                <span
                  key={id}
                  className="rounded bg-slate-200 px-2 py-1 text-xs dark:bg-slate-700"
                >
                  {lr?.name}
                </span>
              )
            })}
          </div>
        )}
        <LossRecordSelectDialog
          open={open}
          onOpenChange={setOpen}
          lossRecords={sampleLossRecords}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onDeselect={handleDeselect}
          title="メインロスレコを選択"
          maxSelection={3}
        />
      </div>
    )
  },
}
