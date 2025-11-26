'use client'

import { Avatar, AvatarFallback, AvatarImage } from 'components/ui/avatar'
import { Badge } from 'components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'components/ui/dialog'
import { ScrollArea } from 'components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { type FC, useCallback, useEffect, useState } from 'react'
import type { CharacterQualities, QualityInfo } from 'types/quality'

/** スコア計算時の1レベルあたりのポイント */
const POINTS_PER_LEVEL = 100

/** デフォルトのビルドレベル（表示用） */
const DEFAULT_BUILD_LEVEL = 25

/** 素質画像のアスペクト比 (width / height = 432 / 606) */
const QUALITY_IMAGE_ASPECT_RATIO = 432 / 606

/** コア素質のインデックス（レベルなし、最大2個選択可能） */
const CORE_TALENT_INDICES = [0, 1, 5, 6]

/** コア素質の最大選択数 */
const MAX_CORE_TALENTS = 2

/** 素質がコア素質かどうかを判定 */
const isCoreTalent = (index: number): boolean => CORE_TALENT_INDICES.includes(index)

interface BuildCreatorProps {
  qualitiesData: Record<string, CharacterQualities>
}

interface SelectedTalent {
  characterName: string
  role: 'main' | 'sub'
  index: number
  level: number
}

interface CharacterSlot {
  name: string | null
  role: 'main' | 'support'
  label: string
}

const QualityCard: FC<{
  quality: QualityInfo
  index: number
  isSelected: boolean
  level?: number
  isCore: boolean
  onClick: () => void
}> = ({ quality, index, isSelected, level, isCore, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex flex-col items-center rounded-lg border-2 p-1 transition-all hover:scale-105 ${
      isSelected
        ? isCore
          ? 'border-pink-400 bg-pink-50 shadow-lg dark:bg-pink-950'
          : 'border-amber-400 bg-amber-50 shadow-lg dark:bg-amber-950'
        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'
    }`}
  >
    {/* コア素質は選択時にチェックマーク、通常素質はレベル表示 */}
    {isSelected && (
      <Badge
        className={`absolute top-0 left-0 z-10 rounded-br-lg rounded-tl-lg text-white ${
          isCore ? 'bg-pink-500' : 'bg-blue-600'
        }`}
      >
        {isCore ? '✓' : level}
      </Badge>
    )}
    <div
      className="relative w-full overflow-hidden rounded-md"
      style={{ aspectRatio: QUALITY_IMAGE_ASPECT_RATIO }}
    >
      <Image
        src={quality.fileName}
        alt={quality.title}
        fill
        sizes="100px"
        className="object-cover"
      />
    </div>
    <span className="mt-1 line-clamp-1 w-full text-center text-xs">
      {quality.title}
    </span>
  </button>
)

const CharacterAvatar: FC<{
  name: string | null
  label: string
  isMain?: boolean
  totalLevel?: number
  onClick?: () => void
}> = ({ name, label, isMain = false, totalLevel = 0, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative flex flex-col items-center rounded-lg border-2 p-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
      isMain ? 'border-red-500' : 'border-slate-300'
    }`}
  >
    {isMain && (
      <Badge className="absolute top-0 left-0 z-10 rounded-br-lg rounded-tl-lg bg-red-500 text-white text-xs">
        主力
      </Badge>
    )}
    {!isMain && label && (
      <Badge className="absolute top-0 left-0 z-10 rounded-br-lg rounded-tl-lg bg-slate-500 text-white text-xs">
        支援
      </Badge>
    )}
    <Avatar className="h-16 w-16">
      <AvatarImage src="/placeholder-character.png" alt={name || 'キャラクター'} />
      <AvatarFallback className="text-lg">
        {name ? name.charAt(0) : '?'}
      </AvatarFallback>
    </Avatar>
    <span className="mt-1 text-center text-sm font-medium">
      {name || '未選択'}
    </span>
    {totalLevel > 0 && (
      <div className="mt-0.5 flex items-center gap-0.5 text-xs text-slate-500">
        <span>⊕</span>
        <span>{totalLevel}</span>
      </div>
    )}
  </button>
)

/** キャラクター選択ダイアログ */
const CharacterSelectDialog: FC<{
  open: boolean
  onOpenChange: (open: boolean) => void
  characterNames: string[]
  selectedName: string | null
  onSelect: (name: string) => void
  slotLabel: string
}> = ({ open, onOpenChange, characterNames, selectedName, onSelect, slotLabel }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{slotLabel}を選択</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-3 gap-3 p-2">
        {characterNames.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              onSelect(name)
              onOpenChange(false)
            }}
            className={`flex flex-col items-center rounded-lg border-2 p-3 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
              selectedName === name
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <Avatar className="h-14 w-14">
              <AvatarImage src="/placeholder-character.png" alt={name} />
              <AvatarFallback className="text-xl">{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="mt-2 text-center text-sm font-medium">{name}</span>
          </button>
        ))}
      </div>
    </DialogContent>
  </Dialog>
)

const CharacterQualitiesSection: FC<{
  characterName: string
  qualities: QualityInfo[]
  role: 'main' | 'sub'
  selectedTalents: SelectedTalent[]
  onTalentSelect: (characterName: string, role: 'main' | 'sub', index: number) => void
  totalLevel: number
}> = ({ characterName, qualities, role, selectedTalents, onTalentSelect, totalLevel }) => (
  <div className="mb-6">
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/placeholder-character.png" alt={characterName} />
          <AvatarFallback>{characterName.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="font-bold text-lg">{characterName}</span>
      </div>
      <div className="flex items-center gap-1 text-slate-500">
        <span className="text-xl">⊕</span>
        <span className="font-bold text-lg">{totalLevel}</span>
      </div>
    </div>
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
      {qualities.map((quality, index) => {
        const selectedTalent = selectedTalents.find(
          (t) =>
            t.characterName === characterName &&
            t.role === role &&
            t.index === index,
        )
        const isCore = isCoreTalent(index)
        return (
          <QualityCard
            key={`${characterName}-${role}-${index}`}
            quality={quality}
            index={index}
            isSelected={selectedTalent !== undefined}
            level={selectedTalent?.level}
            isCore={isCore}
            onClick={() => onTalentSelect(characterName, role, index)}
          />
        )
      })}
    </div>
  </div>
)

export const BuildCreator: FC<BuildCreatorProps> = ({ qualitiesData }) => {
  const characterNames = Object.keys(qualitiesData)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // URLからステートを復元
  const parseStateFromUrl = useCallback(() => {
    const chars = searchParams.get('chars')
    const talents = searchParams.get('talents')

    let parsedCharacters: CharacterSlot[] = [
      { name: characterNames[0] || null, role: 'main', label: '主力' },
      { name: characterNames[1] || null, role: 'support', label: '支援1' },
      { name: characterNames[2] || null, role: 'support', label: '支援2' },
    ]

    if (chars) {
      const charNames = chars.split(',')
      parsedCharacters = parsedCharacters.map((char, i) => ({
        ...char,
        name: charNames[i] && characterNames.includes(charNames[i]) ? charNames[i] : char.name,
      }))
    }

    let parsedTalents: SelectedTalent[] = []
    if (talents) {
      // フォーマット: charIndex-role-talentIndex-level,...
      // 例: 0-main-0-1,0-main-2-3,1-sub-4-2
      const talentParts = talents.split(',').filter(Boolean)
      parsedTalents = talentParts.map((part) => {
        const [charIdxStr, role, indexStr, levelStr] = part.split('-')
        const charIdx = Number.parseInt(charIdxStr, 10)
        const charName = parsedCharacters[charIdx]?.name
        return {
          characterName: charName || '',
          role: role as 'main' | 'sub',
          index: Number.parseInt(indexStr, 10),
          level: Number.parseInt(levelStr, 10) || 1,
        }
      }).filter((t) => t.characterName)
    }

    return { parsedCharacters, parsedTalents }
  }, [characterNames, searchParams])

  // 初期ステートをURLから復元
  const { parsedCharacters: initialCharacters, parsedTalents: initialTalents } = parseStateFromUrl()

  const [characters, setCharacters] = useState<CharacterSlot[]>(initialCharacters)
  const [selectedTalents, setSelectedTalents] = useState<SelectedTalent[]>(initialTalents)
  const [buildName, setBuildName] = useState('新規ビルド')
  const [activeTab, setActiveTab] = useState('qualities')
  const [characterDialogOpen, setCharacterDialogOpen] = useState(false)
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null)

  // URLを更新する関数
  const updateUrl = useCallback(
    (chars: CharacterSlot[], talents: SelectedTalent[]) => {
      const params = new URLSearchParams()

      // キャラクター情報
      const charNames = chars.map((c) => c.name || '').join(',')
      if (charNames.replace(/,/g, '')) {
        params.set('chars', charNames)
      }

      // 素質情報
      if (talents.length > 0) {
        const talentStr = talents
          .map((t) => {
            const charIdx = chars.findIndex((c) => c.name === t.characterName)
            if (charIdx === -1) return ''
            return `${charIdx}-${t.role}-${t.index}-${t.level}`
          })
          .filter(Boolean)
          .join(',')
        if (talentStr) {
          params.set('talents', talentStr)
        }
      }

      const queryString = params.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname
      window.history.replaceState(null, '', newUrl)
    },
    [pathname],
  )

  // ステート変更時にURLを更新
  useEffect(() => {
    updateUrl(characters, selectedTalents)
  }, [characters, selectedTalents, updateUrl])

  const handleTalentSelect = (
    characterName: string,
    role: 'main' | 'sub',
    index: number,
  ) => {
    const isCore = isCoreTalent(index)

    setSelectedTalents((prev) => {
      const existing = prev.find(
        (t) =>
          t.characterName === characterName &&
          t.role === role &&
          t.index === index,
      )

      if (existing) {
        // 既に選択されている場合
        if (isCore) {
          // コア素質は選択解除のみ
          return prev.filter((t) => t !== existing)
        }
        // 通常素質はレベルアップ、最大レベルで解除
        if (existing.level < 6) {
          return prev.map((t) =>
            t === existing ? { ...t, level: t.level + 1 } : t,
          )
        }
        return prev.filter((t) => t !== existing)
      }

      // 新規選択
      if (isCore) {
        // コア素質の選択数チェック（キャラクター・ロールごとに最大2個）
        const currentCoreCount = prev.filter(
          (t) =>
            t.characterName === characterName &&
            t.role === role &&
            isCoreTalent(t.index),
        ).length

        if (currentCoreCount >= MAX_CORE_TALENTS) {
          // 最大数に達している場合は選択不可
          return prev
        }

        // コア素質はレベルなし（level: 0として扱う）
        return [
          ...prev,
          {
            characterName,
            role,
            index,
            level: 0,
          },
        ]
      }

      // 通常素質
      return [
        ...prev,
        {
          characterName,
          role,
          index,
          level: 1,
        },
      ]
    })
  }

  const calculateTotalLevel = (characterName: string) => {
    return selectedTalents
      .filter((t) => t.characterName === characterName)
      .reduce((sum, t) => sum + t.level, 0)
  }

  const calculateTotalScore = () => {
    return selectedTalents.reduce((sum, t) => sum + t.level * POINTS_PER_LEVEL, 0)
  }

  const handleCharacterChange = (slotIndex: number, newName: string) => {
    setCharacters((prev) =>
      prev.map((char, i) => (i === slotIndex ? { ...char, name: newName } : char)),
    )
  }

  const openCharacterDialog = (slotIndex: number) => {
    setEditingSlotIndex(slotIndex)
    setCharacterDialogOpen(true)
  }

  const mainCharacter = characters[0]
  const support1 = characters[1]
  const support2 = characters[2]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="flex flex-col gap-4 p-4 lg:flex-row">
        {/* 左パネル - ビルド情報 */}
        <div className="w-full rounded-xl border-2 border-slate-300 bg-slate-50/80 p-4 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-800/80 lg:w-80">
          {/* ビルド名・スコア */}
          <div className="mb-4 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 p-4 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 font-bold text-lg">
                {DEFAULT_BUILD_LEVEL}
              </div>
              <div>
                <input
                  type="text"
                  value={buildName}
                  onChange={(e) => setBuildName(e.target.value)}
                  className="bg-transparent font-bold text-xl outline-none"
                />
                <div className="flex items-center gap-1 text-sm">
                  <span>⊕ スコア</span>
                  <span className="rounded bg-slate-500 px-2 py-0.5">
                    {calculateTotalScore()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 巡遊者（キャラクター）セクション */}
          <div className="mb-4">
            <h3 className="mb-2 flex items-center gap-1 font-bold text-amber-600">
              <span className="text-lg">🏆</span>
              巡遊者
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {characters.map((char, index) => (
                <CharacterAvatar
                  key={char.label}
                  name={char.name}
                  label={char.label}
                  isMain={char.role === 'main'}
                  totalLevel={char.name ? calculateTotalLevel(char.name) : 0}
                  onClick={() => openCharacterDialog(index)}
                />
              ))}
            </div>
          </div>

          {/* キャラクター選択ダイアログ */}
          {editingSlotIndex !== null && (
            <CharacterSelectDialog
              open={characterDialogOpen}
              onOpenChange={setCharacterDialogOpen}
              characterNames={characterNames}
              selectedName={characters[editingSlotIndex]?.name ?? null}
              onSelect={(name) => handleCharacterChange(editingSlotIndex, name)}
              slotLabel={characters[editingSlotIndex]?.label ?? ''}
            />
          )}

          {/* メインロスレコセクション（プレースホルダー） */}
          <div className="mb-4">
            <h3 className="mb-2 flex items-center gap-1 font-bold">
              <span>⊕</span>
              メインロスレコ
              <span className="ml-auto text-slate-400">🔍</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg border-2 border-dashed border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-700"
                />
              ))}
            </div>
          </div>

          {/* ステータス表示 */}
          <div className="rounded-lg bg-slate-200 p-3 dark:bg-slate-700">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-500">ℹ</span>
              <span>
                選択素質: {selectedTalents.length}個 / 合計レベル: {selectedTalents.reduce((sum, t) => sum + t.level, 0)}
              </span>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-200 py-2 font-medium transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              🔒 ロック済
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-pink-100 py-2 font-medium text-pink-600 transition-colors hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-300 dark:hover:bg-pink-800"
            >
              ❤ 登録
            </button>
          </div>
        </div>

        {/* 右パネル - 素質/ロスレコスキル */}
        <div className="flex-1 rounded-xl border-2 border-slate-300 bg-slate-50/80 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-800/80">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="w-full justify-start rounded-none rounded-t-xl border-b bg-slate-100 p-0 dark:bg-slate-900">
              <TabsTrigger
                value="qualities"
                className="rounded-none rounded-tl-xl border-r px-6 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
              >
                素質収集
              </TabsTrigger>
              <TabsTrigger
                value="lossreco"
                className="rounded-none border-r px-6 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
              >
                ロスレコスキル
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qualities" className="mt-0 h-[calc(100vh-200px)]">
              <ScrollArea className="h-full p-4">
                {/* 主力キャラクターの素質 */}
                {mainCharacter.name && qualitiesData[mainCharacter.name] && (
                  <CharacterQualitiesSection
                    characterName={mainCharacter.name}
                    qualities={qualitiesData[mainCharacter.name].main}
                    role="main"
                    selectedTalents={selectedTalents}
                    onTalentSelect={handleTalentSelect}
                    totalLevel={calculateTotalLevel(mainCharacter.name)}
                  />
                )}

                {/* 支援1キャラクターの素質 */}
                {support1.name && qualitiesData[support1.name] && (
                  <CharacterQualitiesSection
                    characterName={support1.name}
                    qualities={qualitiesData[support1.name].sub}
                    role="sub"
                    selectedTalents={selectedTalents}
                    onTalentSelect={handleTalentSelect}
                    totalLevel={calculateTotalLevel(support1.name)}
                  />
                )}

                {/* 支援2キャラクターの素質 */}
                {support2.name && qualitiesData[support2.name] && (
                  <CharacterQualitiesSection
                    characterName={support2.name}
                    qualities={qualitiesData[support2.name].sub}
                    role="sub"
                    selectedTalents={selectedTalents}
                    onTalentSelect={handleTalentSelect}
                    totalLevel={calculateTotalLevel(support2.name)}
                  />
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="lossreco" className="mt-0 p-4">
              <div className="flex h-64 items-center justify-center text-slate-500">
                <p>ロスレコスキル機能は準備中です</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
