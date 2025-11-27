import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { QualityInfo } from 'types/quality'
import {
  CharacterQualitiesSection,
  isCoreTalent,
  MAX_CORE_TALENTS,
  MAX_TALENT_LEVEL,
  type SelectedTalent,
} from './CharacterQualitiesSection'

// サンプル素質データを生成
// API形式: mainCore(4) + mainNormal(9) + common(3) = 16
const generateSampleQualities = (characterName: string): QualityInfo[] => {
  return Array.from({ length: 16 }, (_, i) => {
    // 最初の4つはコア素質
    const isCore = i < 4
    // サブ素質のレアリティ: 4-9がrarity1（mainNormal前半）、10-12がrarity2（mainNormal後半）、13-15がcommon（rarity1）
    const rarity = isCore ? 1 : i < 10 || i >= 13 ? 1 : 2
    return {
      description: `これは${characterName}の素質${i + 1}の説明です。\n効果の詳細がここに表示されます。`,
      fileName: '/placeholder-character.png',
      isCore,
      rarity,
      title: `${characterName}の素質${i + 1}`,
    }
  })
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
      { characterName: 'コハク', role: 'main', index: 1, level: 0 }, // コア素質
      { characterName: 'コハク', role: 'main', index: 5, level: 3 }, // サブ素質
      { characterName: 'コハク', role: 'main', index: 7, level: 5 }, // サブ素質
      { characterName: 'コハク', role: 'main', index: 12, level: 2 }, // サブ素質
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
      { characterName: 'シア', role: 'sub', index: 5, level: 4 }, // サブ素質
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

    const handleTalentSelect = (
      characterName: string,
      role: 'main' | 'sub',
      index: number,
    ) => {
      const quality = sampleQualities[index]
      const isCore = isCoreTalent(index, quality)

      setSelectedTalents((prev) => {
        const existing = prev.find(
          (t) =>
            t.characterName === characterName &&
            t.role === role &&
            t.index === index,
        )

        if (existing) {
          if (isCore) {
            return prev.filter((t) => t !== existing)
          }
          if (existing.level < MAX_TALENT_LEVEL) {
            return prev.map((t) =>
              t === existing ? { ...t, level: t.level + 1 } : t,
            )
          }
          return prev.filter((t) => t !== existing)
        }

        if (isCore) {
          const currentCoreCount = prev.filter((t) => {
            const tQuality = sampleQualities[t.index]
            return t.characterName === characterName && isCoreTalent(t.index, tQuality)
          }).length
          if (currentCoreCount >= MAX_CORE_TALENTS) return prev
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
