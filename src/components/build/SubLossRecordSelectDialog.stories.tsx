import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { LossRecordInfo } from 'types/lossRecord'
import { SubLossRecordSelectDialog } from './SubLossRecordSelectDialog'

const meta: Meta<typeof SubLossRecordSelectDialog> = {
  title: 'Build/SubLossRecordSelectDialog',
  component: SubLossRecordSelectDialog,
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
type Story = StoryObj<typeof SubLossRecordSelectDialog>

/** サンプルのサブロスレコデータ（サポート音符が多様） */
const sampleLossRecords: LossRecordInfo[] = [
  {
    id: 1,
    name: '強撃の心得',
    iconUrl: '/placeholder-character.png',
    star: 5,
    element: '火',
    mainSkillName: '強撃強化',
    mainSkillDescription: '強撃の効果を増加させる',
    supportNote: [
      { name: '強撃の音符', quantity: 3 },
      { name: '火の音符', quantity: 1 },
    ],
    secondarySkillNotes: [],
    maxStats: [{ id: 'atk', label: '攻撃力', value: 100 }],
    mainSkill: { name: '強撃強化', description: '説明', params: [['30']] },
    secondarySkills: [],
  },
  {
    id: 2,
    name: '爆発の秘術',
    iconUrl: '/placeholder-character.png',
    star: 5,
    element: '火',
    mainSkillName: '爆発強化',
    mainSkillDescription: '爆発ダメージを増加させる',
    supportNote: [
      { name: '爆発の音符', quantity: 4 },
      { name: '火の音符', quantity: 2 },
    ],
    secondarySkillNotes: [],
    maxStats: [{ id: 'atk', label: '攻撃力', value: 120 }],
    mainSkill: { name: '爆発強化', description: '説明', params: [['35']] },
    secondarySkills: [],
  },
  {
    id: 3,
    name: '器用の極み',
    iconUrl: '/placeholder-character.png',
    star: 4,
    element: '風',
    mainSkillName: '器用強化',
    mainSkillDescription: '器用さを増加させる',
    supportNote: [
      { name: '器用の音符', quantity: 3 },
      { name: '風の音符', quantity: 1 },
    ],
    secondarySkillNotes: [],
    maxStats: [{ id: 'dex', label: '器用さ', value: 80 }],
    mainSkill: { name: '器用強化', description: '説明', params: [['25']] },
    secondarySkills: [],
  },
  {
    id: 4,
    name: '幸運の星',
    iconUrl: '/placeholder-character.png',
    star: 4,
    element: '光',
    mainSkillName: '幸運強化',
    mainSkillDescription: '幸運を増加させる',
    supportNote: [
      { name: '幸運の音符', quantity: 3 },
      { name: '光の音符', quantity: 2 },
    ],
    secondarySkillNotes: [],
    maxStats: [{ id: 'luk', label: '幸運', value: 75 }],
    mainSkill: { name: '幸運強化', description: '説明', params: [['20']] },
    secondarySkills: [],
  },
  {
    id: 5,
    name: '体力の証',
    iconUrl: '/placeholder-character.png',
    star: 5,
    element: '地',
    mainSkillName: '体力強化',
    mainSkillDescription: 'HPを増加させる',
    supportNote: [
      { name: '体力の音符', quantity: 4 },
      { name: '地の音符', quantity: 1 },
    ],
    secondarySkillNotes: [],
    maxStats: [{ id: 'hp', label: 'HP', value: 1000 }],
    mainSkill: { name: '体力強化', description: '説明', params: [['40']] },
    secondarySkills: [],
  },
  {
    id: 6,
    name: '集中の刻印',
    iconUrl: '/placeholder-character.png',
    star: 3,
    element: '水',
    mainSkillName: '集中強化',
    mainSkillDescription: '集中力を増加させる',
    supportNote: [
      { name: '集中の音符', quantity: 2 },
      { name: '水の音符', quantity: 1 },
    ],
    secondarySkillNotes: [],
    maxStats: [{ id: 'con', label: '集中', value: 50 }],
    mainSkill: { name: '集中強化', description: '説明', params: [['15']] },
    secondarySkills: [],
  },
  {
    id: 7,
    name: '必殺の奥義',
    iconUrl: '/placeholder-character.png',
    star: 5,
    element: '闇',
    mainSkillName: '必殺強化',
    mainSkillDescription: '必殺技ダメージを増加させる',
    supportNote: [
      { name: '必殺の音符', quantity: 4 },
      { name: '闇の音符', quantity: 2 },
    ],
    secondarySkillNotes: [],
    maxStats: [{ id: 'ult', label: '必殺技', value: 150 }],
    mainSkill: { name: '必殺強化', description: '説明', params: [['45']] },
    secondarySkills: [],
  },
  {
    id: 8,
    name: '炎と水の融合',
    iconUrl: '/placeholder-character.png',
    star: 4,
    element: 'なし',
    mainSkillName: '属性融合',
    mainSkillDescription: '複数属性の効果を得る',
    supportNote: [
      { name: '火の音符', quantity: 2 },
      { name: '水の音符', quantity: 2 },
    ],
    secondarySkillNotes: [],
    maxStats: [{ id: 'all', label: '全ステータス', value: 30 }],
    mainSkill: { name: '属性融合', description: '説明', params: [['10']] },
    secondarySkills: [],
  },
]

/**
 * サブロスレコ選択ダイアログ（デフォルト）
 */
export const Default: Story = {
  args: {
    open: true,
    lossRecords: sampleLossRecords,
    selectedIds: [],
    title: 'サブロスレコを選択',
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
    title: 'サブロスレコを選択',
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
    selectedIds: [1, 5, 7],
    title: 'サブロスレコを選択',
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
    title: 'サブロスレコを選択',
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
          className="rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
        >
          サブロスレコ選択ダイアログを開く
        </button>
        <p className="text-sm text-slate-500">
          選択中: {selectedIds.length} / 3
        </p>
        {selectedIds.length > 0 && (
          <div className="flex flex-col gap-1">
            {selectedIds.map((id) => {
              const lr = sampleLossRecords.find((l) => l.id === id)
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 rounded bg-slate-200 px-2 py-1 text-xs dark:bg-slate-700"
                >
                  <span>{lr?.name}</span>
                  <span className="text-slate-400">
                    ({lr?.supportNote.map((n) => `${n.name}x${n.quantity}`).join(', ')})
                  </span>
                </div>
              )
            })}
          </div>
        )}
        <SubLossRecordSelectDialog
          open={open}
          onOpenChange={setOpen}
          lossRecords={sampleLossRecords}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onDeselect={handleDeselect}
          title="サブロスレコを選択"
          maxSelection={3}
        />
      </div>
    )
  },
}
