import { type Meta, type StoryObj } from '@storybook/react'
import type { LossRecordInfo } from 'types/lossRecord'
import { LossRecordSkillSection } from './LossRecordSkillSection'

// サンプルロスレコデータを生成
const createSampleLossRecord = (
  id: number,
  name: string,
  star: number,
  element: string,
): LossRecordInfo => ({
  id,
  name,
  iconUrl: '/placeholder-lossrecord.png',
  star,
  element,
  mainSkillName: `${name}のスキル`,
  mainSkillDescription: `${name}のメインスキル説明。火属性の主力巡遊者のスキル発動後、爆炎を3獲得する。通常攻撃ダメージが14%増加する。`,
  supportNote: [
    { name: '幸運の音符', quantity: 4 },
    { name: '器用の音符', quantity: 10 },
  ],
  secondarySkillNotes: [
    { name: '強撃の音符', quantity: 15 },
    { name: '火の音符', quantity: 15 },
  ],
  maxStats: [
    { id: 'atk', label: 'ATK', value: 981 },
    { id: 'ignis_damage', label: 'Ignis Damage', value: 15, unit: '%' },
  ],
  mainSkill: {
    name: `${name}のスキル`,
    description: `火属性の主力巡遊者のスキル発動後、爆炎を{1}獲得する。通常攻撃ダメージが{2}%増加する。`,
    params: [
      ['1', '10'],
      ['2', '12'],
      ['3', '14'],
    ],
  },
  secondarySkills: [
    {
      name: '受け継がれる熱意',
      description:
        'チーム全体の火属性ダメージが{1}%増加する。チーム内の巡遊者がスキル発動後{2}秒間、火属性巡遊者のスキルダメージが{3}%増加する。',
      params: [
        ['15', '3', '15'],
        ['16', '3', '16'],
        ['17', '4', '17'],
        ['18', '4', '18'],
        ['20', '4', '20'],
      ],
      requirements: [
        [
          { name: '強撃の音符', quantity: 14 },
          { name: '火の音符', quantity: 14 },
        ],
        [
          { name: '強撃の音符', quantity: 28 },
          { name: '火の音符', quantity: 28 },
        ],
        [
          { name: '強撃の音符', quantity: 42 },
          { name: '火の音符', quantity: 42 },
        ],
        [
          { name: '強撃の音符', quantity: 56 },
          { name: '火の音符', quantity: 56 },
        ],
        [
          { name: '強撃の音符', quantity: 70 },
          { name: '火の音符', quantity: 70 },
        ],
      ],
    },
    {
      name: '猛る炎',
      description: '爆炎1ごとに、スキルダメージが{1}%増加する。',
      params: [['5.5'], ['6'], ['6.5'], ['7'], ['7.5']],
      requirements: [
        [
          { name: '強撃の音符', quantity: 15 },
          { name: '幸運の音符', quantity: 15 },
          { name: '火の音符', quantity: 15 },
        ],
        [
          { name: '強撃の音符', quantity: 30 },
          { name: '幸運の音符', quantity: 30 },
          { name: '火の音符', quantity: 30 },
        ],
        [
          { name: '強撃の音符', quantity: 45 },
          { name: '幸運の音符', quantity: 45 },
          { name: '火の音符', quantity: 45 },
        ],
        [
          { name: '強撃の音符', quantity: 60 },
          { name: '幸運の音符', quantity: 60 },
          { name: '火の音符', quantity: 60 },
        ],
        [
          { name: '強撃の音符', quantity: 75 },
          { name: '幸運の音符', quantity: 75 },
          { name: '火の音符', quantity: 75 },
        ],
      ],
    },
  ],
})

const sampleMainLossRecord = createSampleLossRecord(1, 'ハナビ', 5, '火')
const sampleSubLossRecords = [
  createSampleLossRecord(2, '在し日の記憶', 5, '火'),
  createSampleLossRecord(3, '一期一会', 5, '水'),
]

const meta: Meta<typeof LossRecordSkillSection> = {
  title: 'Build/LossRecordSkillSection',
  component: LossRecordSkillSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    mainLossRecords: {
      description: 'メインロスレコ情報の配列',
    },
    subLossRecords: {
      description: 'サブロスレコ情報の配列',
    },
  },
}

export default meta
type Story = StoryObj<typeof LossRecordSkillSection>

/**
 * メインロスレコのみ選択時
 */
export const MainLossRecordOnly: Story = {
  args: {
    mainLossRecords: [sampleMainLossRecord],
    subLossRecords: [],
  },
}

/**
 * サブロスレコのみ選択時（初期取得音符の合計表示）
 */
export const SubLossRecordsOnly: Story = {
  args: {
    mainLossRecords: [],
    subLossRecords: sampleSubLossRecords,
  },
}

/**
 * メインロスレコとサブロスレコを両方選択時
 */
export const MainAndSubLossRecords: Story = {
  args: {
    mainLossRecords: [sampleMainLossRecord],
    subLossRecords: sampleSubLossRecords,
  },
}

/**
 * ロスレコ未選択時
 */
export const NoLossRecordsSelected: Story = {
  args: {
    mainLossRecords: [],
    subLossRecords: [],
  },
}

/**
 * 複数のメインロスレコを選択時
 */
export const MultipleMainLossRecords: Story = {
  args: {
    mainLossRecords: [
      sampleMainLossRecord,
      createSampleLossRecord(4, '魔女の秘薬', 5, '闇'),
    ],
    subLossRecords: [],
  },
}

/**
 * インタラクティブなスキルレベル調整
 * スライダーを操作してスキルレベルを変更できます
 */
export const Interactive: Story = {
  args: {
    mainLossRecords: [sampleMainLossRecord],
    subLossRecords: sampleSubLossRecords,
  },
  render: (args) => (
    <div className="max-w-4xl">
      <div className="mb-4 rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
        <p className="text-sm">
          スライダーを操作してセカンダリスキルのレベルを変更できます。
          レベルに応じてスキル説明と必要音符が更新されます。
        </p>
      </div>
      <LossRecordSkillSection {...args} />
    </div>
  ),
}
