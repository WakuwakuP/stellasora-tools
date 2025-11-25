'use client'

import { Button } from 'components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'components/ui/card'
import { Input } from 'components/ui/input'
import { Label } from 'components/ui/label'
import { Separator } from 'components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs'
import { type FC, useCallback, useId, useState } from 'react'

import { TalentSelector } from './TalentSelector'

/** 素質カテゴリ */
type TalentCategory = 'specialization1' | 'specialization2' | 'general'

/** 素質タイプ */
type TalentType = 'main' | 'support'

/** 素質データ */
interface TalentData {
  id: number
  level: number
  name: string
}

/** カテゴリ別素質データ */
interface CategoryTalents {
  general: TalentData[]
  specialization1: TalentData[]
  specialization2: TalentData[]
}

/** キャラクター素質データ */
interface CharacterTalentData {
  main: CategoryTalents
  support: CategoryTalents
}

/** カテゴリ情報 */
const CATEGORY_INFO: Record<
  TalentCategory,
  { count: number; description: string; title: string }
> = {
  general: {
    count: 5,
    description: '汎用的な素質',
    title: '汎用素質',
  },
  specialization1: {
    count: 5,
    description: '特定の方向性に特化した構築',
    title: '特化構築1',
  },
  specialization2: {
    count: 5,
    description: '特定の方向性に特化した構築',
    title: '特化構築2',
  },
}

/** 初期素質データを生成 */
const createInitialTalents = (): CategoryTalents => ({
  general: Array.from({ length: CATEGORY_INFO.general.count }, (_, i) => ({
    id: i,
    level: 0,
    name: '',
  })),
  specialization1: Array.from(
    { length: CATEGORY_INFO.specialization1.count },
    (_, i) => ({
      id: i,
      level: 0,
      name: '',
    }),
  ),
  specialization2: Array.from(
    { length: CATEGORY_INFO.specialization2.count },
    (_, i) => ({
      id: i,
      level: 0,
      name: '',
    }),
  ),
})

/** 初期キャラクター素質データを生成 */
const createInitialCharacterTalents = (): CharacterTalentData => ({
  main: createInitialTalents(),
  support: createInitialTalents(),
})

/** 素質更新パラメータ */
interface TalentUpdateParams {
  category: TalentCategory
  field: 'name' | 'level'
  index: number
  type: TalentType
  value: string | number
}

export const CharacterDatasetForm: FC = () => {
  const [characterName, setCharacterName] = useState('')
  const [talents, setTalents] = useState<CharacterTalentData>(
    createInitialCharacterTalents(),
  )
  const [activeTab, setActiveTab] = useState<TalentType>('main')
  const characterNameId = useId()

  /** 素質を更新 */
  const handleTalentUpdate = useCallback((params: TalentUpdateParams) => {
    const { category, field, index, type, value } = params
    setTalents((prev) => {
      const newTalents = { ...prev }
      const categoryData = [...newTalents[type][category]]
      categoryData[index] = {
        ...categoryData[index],
        [field]: value,
      }
      newTalents[type] = {
        ...newTalents[type],
        [category]: categoryData,
      }
      return newTalents
    })
  }, [])

  /** フォームをリセット */
  const handleReset = useCallback(() => {
    setCharacterName('')
    setTalents(createInitialCharacterTalents())
  }, [])

  /** データを出力 */
  const handleExport = useCallback(() => {
    const data = {
      characterName,
      talents,
    }
    console.log('Character Dataset:', JSON.stringify(data, null, 2))
    // 将来的にはデータを保存する処理を追加
    alert('データがコンソールに出力されました')
  }, [characterName, talents])

  return (
    <div className="space-y-6">
      {/* キャラクター名入力 */}
      <Card>
        <CardHeader>
          <CardTitle>キャラクター情報</CardTitle>
          <CardDescription>キャラクター名を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor={characterNameId}>キャラクター名</Label>
            <Input
              id={characterNameId}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="キャラクター名を入力"
              value={characterName}
            />
          </div>
        </CardContent>
      </Card>

      {/* 素質入力 */}
      <Card>
        <CardHeader>
          <CardTitle>素質データ</CardTitle>
          <CardDescription>
            スクリーンショットを参照しながら素質データを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            onValueChange={(v) => setActiveTab(v as TalentType)}
            value={activeTab}
          >
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="main">主力</TabsTrigger>
              <TabsTrigger value="support">支援</TabsTrigger>
            </TabsList>

            <TabsContent value="main">
              <TalentCategorySection
                onTalentUpdate={handleTalentUpdate}
                talents={talents.main}
                type="main"
              />
            </TabsContent>

            <TabsContent value="support">
              <TalentCategorySection
                onTalentUpdate={handleTalentUpdate}
                talents={talents.support}
                type="support"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <div className="flex justify-end gap-4">
        <Button onClick={handleReset} variant="outline">
          リセット
        </Button>
        <Button disabled={!characterName.trim()} onClick={handleExport}>
          データを出力
        </Button>
      </div>
    </div>
  )
}

/** 素質カテゴリセクション */
interface TalentCategorySectionProps {
  onTalentUpdate: (params: TalentUpdateParams) => void
  talents: CategoryTalents
  type: TalentType
}

const TalentCategorySection: FC<TalentCategorySectionProps> = ({
  onTalentUpdate,
  talents,
  type,
}) => {
  const categories: TalentCategory[] = [
    'specialization1',
    'specialization2',
    'general',
  ]

  return (
    <div className="space-y-6">
      {categories.map((category, categoryIndex) => (
        <div key={category}>
          {categoryIndex > 0 && <Separator className="my-4" />}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">
                {CATEGORY_INFO[category].title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {CATEGORY_INFO[category].description}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {talents[category].map((talent, index) => (
                <TalentSelector
                  index={index}
                  key={`${category}-${talent.id}`}
                  onLevelChange={(value) =>
                    onTalentUpdate({
                      category,
                      field: 'level',
                      index,
                      type,
                      value,
                    })
                  }
                  onNameChange={(value) =>
                    onTalentUpdate({
                      category,
                      field: 'name',
                      index,
                      type,
                      value,
                    })
                  }
                  talent={talent}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
