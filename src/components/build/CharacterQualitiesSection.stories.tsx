import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { QualityInfo } from 'types/quality'
import { CharacterQualitiesSection, type SelectedTalent } from './CharacterQualitiesSection'

// サンプル素質データを生成
const generateSampleQualities = (characterName: string): QualityInfo[] => {
  return Array.from({ length: 16 }, (_, i) => ({
    title: `${characterName}の素質${i + 1}`,
    description: `これは${characterName}の素質${i + 1}の説明です。\n効果の詳細がここに表示されます。`,
    fileName: '/placeholder-character.png',
  }))
}

const sampleQualities = generateSampleQualities('コハク')

const meta: Meta<typeof CharacterQualitiesSection> = {
  title: 'Build/CharacterQualitiesSection',
  component: CharacterQualitiesSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    characterName: {
      control: 'text',
      description: 'キャラクター名',
    },
    role: {
      control: 'radio',
      options: ['main', 'sub'],
      description: 'キャラクターの役割',
    },
    totalLevel: {
      control: { type: 'number', min: 0, max: 100 },
      description: '選択した素質の合計レベル',
    },
    onTalentSelect: {
      action: 'talentSelected',
      description: '素質選択時のハンドラー',
    },
  },
}

export default meta
type Story = StoryObj<typeof CharacterQualitiesSection>

/**
 * 主力キャラクター（素質未選択）
 */
export const MainCharacterEmpty: Story = {
  args: {
    characterName: 'コハク',
    qualities: sampleQualities,
    role: 'main',
    selectedTalents: [],
    totalLevel: 0,
  },
}

/**
 * 主力キャラクター（素質選択済み）
 */
export const MainCharacterWithSelections: Story = {
  args: {
    characterName: 'コハク',
    qualities: sampleQualities,
    role: 'main',
    selectedTalents: [
      { characterName: 'コハク', role: 'main', index: 0, level: 0 }, // コア素質
      { characterName: 'コハク', role: 'main', index: 5, level: 0 }, // コア素質
      { characterName: 'コハク', role: 'main', index: 2, level: 3 }, // 通常素質
      { characterName: 'コハク', role: 'main', index: 7, level: 5 }, // 通常素質
      { characterName: 'コハク', role: 'main', index: 12, level: 2 }, // 汎用素質
    ],
    totalLevel: 10,
  },
}

/**
 * 支援キャラクター
 */
export const SupportCharacter: Story = {
  args: {
    characterName: 'シア',
    qualities: generateSampleQualities('シア'),
    role: 'sub',
    selectedTalents: [
      { characterName: 'シア', role: 'sub', index: 1, level: 0 }, // コア素質
      { characterName: 'シア', role: 'sub', index: 3, level: 4 }, // 通常素質
    ],
    totalLevel: 4,
  },
}

/**
 * インタラクティブな素質選択
 */
export const Interactive: Story = {
  args: {
    characterName: 'コハク',
    qualities: sampleQualities,
    role: 'main',
    selectedTalents: [],
    totalLevel: 0,
  },
  render: function InteractiveSection() {
    const [selectedTalents, setSelectedTalents] = useState<SelectedTalent[]>([])

    const handleTalentSelect = (characterName: string, role: 'main' | 'sub', index: number) => {
      const CORE_INDICES = [0, 1, 5, 6]
      const isCore = CORE_INDICES.includes(index)

      setSelectedTalents((prev) => {
        const existing = prev.find(
          (t) => t.characterName === characterName && t.role === role && t.index === index
        )

        if (existing) {
          if (isCore) {
            return prev.filter((t) => t !== existing)
          }
          if (existing.level < 6) {
            return prev.map((t) => (t === existing ? { ...t, level: t.level + 1 } : t))
          }
          return prev.filter((t) => t !== existing)
        }

        if (isCore) {
          const currentCoreCount = prev.filter(
            (t) => t.characterName === characterName && CORE_INDICES.includes(t.index)
          ).length
          if (currentCoreCount >= 2) return prev
          return [...prev, { characterName, role, index, level: 0 }]
        }

        return [...prev, { characterName, role, index, level: 1 }]
      })
    }

    const totalLevel = selectedTalents.reduce((sum, t) => sum + t.level, 0)

    return (
      <div className="max-w-4xl">
        <div className="mb-4 rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
          <p className="text-sm">
            クリックで素質を選択/レベルアップできます。コア素質（ピンク枠）は最大2個まで選択可能です。
          </p>
        </div>
        <CharacterQualitiesSection
          characterName="コハク"
          qualities={sampleQualities}
          role="main"
          selectedTalents={selectedTalents}
          onTalentSelect={handleTalentSelect}
          totalLevel={totalLevel}
        />
      </div>
    )
  },
}
