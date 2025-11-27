'use client'

import { SavedBuildList } from 'app/build/SavedBuildList'
import { Avatar, AvatarFallback, AvatarImage } from 'components/ui/avatar'
import { Badge } from 'components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'components/ui/dialog'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from 'components/ui/hover-card'
import { ScrollArea } from 'components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs'
import { useIsMobile } from 'hooks/use-mobile'
import { useSavedBuilds } from 'hooks/useSavedBuilds'
import {
  arrayToBase7BigInt,
  base7BigIntToArray,
  base64UrlToBigInt,
  bigIntToBase64Url,
} from 'lib/encoding-utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import type { CharacterQualities, QualityInfo } from 'types/quality'

/** デフォルトのビルドレベル（表示用） */
const DEFAULT_BUILD_LEVEL = 25

/** 素質画像のアスペクト比 (width / height = 432 / 606) */
const QUALITY_IMAGE_ASPECT_RATIO = 432 / 606

/** コア素質のインデックス（レベルなし、最大2個選択可能） */
const CORE_TALENT_INDICES = [0, 1, 5, 6]

/** コア素質の最大選択数 */
const MAX_CORE_TALENTS = 2

/** 通常素質の最大レベル */
const MAX_TALENT_LEVEL = 6

/** 素質がコア素質かどうかを判定 */
const isCoreTalent = (index: number): boolean => CORE_TALENT_INDICES.includes(index)

/** 素質数（1キャラクター16個 × 3人 = 48個） */
const TALENTS_PER_CHARACTER = 16
const TOTAL_CHARACTERS = 3
const TOTAL_TALENTS = TALENTS_PER_CHARACTER * TOTAL_CHARACTERS

/**
 * 選択された素質情報を48個の配列に変換
 * コア素質（0, 1, 5, 6）は選択時にlevel=1として扱う（レベル表示はしない）
 */
function selectedTalentsToArray(
  selectedTalents: SelectedTalent[],
  characters: CharacterSlot[],
): number[] {
  const result = new Array<number>(TOTAL_TALENTS).fill(0)

  for (const talent of selectedTalents) {
    const charIndex = characters.findIndex((c) => c.name === talent.characterName)
    if (charIndex === -1) continue

    // 主力はmain素質、支援はsub素質を使う
    const isMainChar = charIndex === 0
    const expectedRole = isMainChar ? 'main' : 'sub'
    if (talent.role !== expectedRole) continue

    const baseIndex = charIndex * TALENTS_PER_CHARACTER
    const talentIndex = baseIndex + talent.index

    // コア素質は選択時にlevel=1として扱う
    if (isCoreTalent(talent.index)) {
      result[talentIndex] = 1
    } else {
      result[talentIndex] = talent.level
    }
  }

  return result
}

/**
 * 48個の配列から選択された素質情報に変換
 */
function arrayToSelectedTalents(
  arr: number[],
  characters: CharacterSlot[],
): SelectedTalent[] {
  const result: SelectedTalent[] = []

  for (let charIndex = 0; charIndex < TOTAL_CHARACTERS; charIndex++) {
    const charName = characters[charIndex]?.name
    if (!charName) continue

    const isMainChar = charIndex === 0
    const role = isMainChar ? 'main' : 'sub'
    const baseIndex = charIndex * TALENTS_PER_CHARACTER

    for (let i = 0; i < TALENTS_PER_CHARACTER; i++) {
      const level = arr[baseIndex + i]
      if (level > 0) {
        result.push({
          characterName: charName,
          role: role as 'main' | 'sub',
          index: i,
          // コア素質はレベル0として扱う（表示しない）
          level: isCoreTalent(i) ? 0 : level,
        })
      }
    }
  }

  return result
}

/**
 * ビルド情報をURLパスにエンコード
 */
function encodeBuildToPath(
  characters: CharacterSlot[],
  selectedTalents: SelectedTalent[],
): string {
  const char1 = characters[0]?.name || ''
  const char2 = characters[1]?.name || ''
  const char3 = characters[2]?.name || ''

  if (!char1 || !char2 || !char3) {
    return '/build'
  }

  const talentsArray = selectedTalentsToArray(selectedTalents, characters)
  const bigIntValue = arrayToBase7BigInt(talentsArray)
  const talentsCode = bigIntToBase64Url(bigIntValue)

  return `/build/${encodeURIComponent(char1)}/${encodeURIComponent(char2)}/${encodeURIComponent(char3)}/${talentsCode}`
}

/**
 * URLパスからビルド情報をデコード
 */
function decodeBuildFromPath(
  char1: string,
  char2: string,
  char3: string,
  talentsCode: string,
  characterNames: string[],
): { characters: CharacterSlot[]; selectedTalents: SelectedTalent[] } {
  const decodedChar1 = decodeURIComponent(char1)
  const decodedChar2 = decodeURIComponent(char2)
  const decodedChar3 = decodeURIComponent(char3)

  // キャラクター名の検証
  const validChar1 = characterNames.includes(decodedChar1) ? decodedChar1 : null
  const validChar2 = characterNames.includes(decodedChar2) ? decodedChar2 : null
  const validChar3 = characterNames.includes(decodedChar3) ? decodedChar3 : null

  const characters: CharacterSlot[] = [
    { name: validChar1, role: 'main', label: '主力' },
    { name: validChar2, role: 'support', label: '支援1' },
    { name: validChar3, role: 'support', label: '支援2' },
  ]

  try {
    const bigIntValue = base64UrlToBigInt(talentsCode)
    const talentsArray = base7BigIntToArray(bigIntValue, TOTAL_TALENTS)
    const selectedTalents = arrayToSelectedTalents(talentsArray, characters)
    return { characters, selectedTalents }
  } catch (error) {
    console.warn('素質データのデコードに失敗しました:', error)
    return { characters, selectedTalents: [] }
  }
}

interface BuildCreatorProps {
  qualitiesData: Record<string, CharacterQualities>
  initialChar1?: string
  initialChar2?: string
  initialChar3?: string
  initialTalents?: string
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
  <HoverCard openDelay={200} closeDelay={100}>
    <HoverCardTrigger asChild>
      <button
        type="button"
        onClick={onClick}
        aria-label={`${quality.title}${isSelected ? (isCore ? '、選択中' : `、レベル${level}選択中`) : ''}`}
        className={`relative flex min-w-[130px] max-w-[150px] flex-col items-center rounded-lg border-2 p-1 transition-colors ${
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
            sizes="150px"
            className="object-cover"
          />
        </div>
        <span className="mt-1 line-clamp-1 w-full text-center text-xs">
          {quality.title}
        </span>
      </button>
    </HoverCardTrigger>
    <HoverCardContent className="w-72" side="top" align="center">
      <div className="space-y-2">
        <h4 className="font-bold text-sm">{quality.title}</h4>
        <p className="text-muted-foreground text-xs whitespace-pre-wrap">
          {quality.description}
        </p>
      </div>
    </HoverCardContent>
  </HoverCard>
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
    aria-label={`${label}を変更${name ? `（現在: ${name}）` : '（未選択）'}`}
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
            aria-label={`${name}を選択`}
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

/** 素質グループの定義 */
const QUALITY_GROUPS = [
  { name: '特化素質1', start: 0, end: 5 },
  { name: '特化素質2', start: 5, end: 10 },
  { name: '汎用素質', start: 10, end: 16 },
] as const

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
    <div className="space-y-3">
      {QUALITY_GROUPS.map((group) => (
        <div key={group.name}>
          <div className="mb-1 text-xs text-slate-500 font-medium">{group.name}</div>
          <div className="flex flex-wrap justify-start gap-2">
            {qualities.slice(group.start, group.end).map((quality, idx) => {
              const index = group.start + idx
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
      ))}
    </div>
  </div>
)

export const BuildCreator: FC<BuildCreatorProps> = ({
  qualitiesData,
  initialChar1,
  initialChar2,
  initialChar3,
  initialTalents,
}) => {
  // characterNamesをメモ化してパフォーマンス向上
  const characterNames = useMemo(() => Object.keys(qualitiesData), [qualitiesData])

  // 初期ステートを計算（遅延初期化パターン）
  const [characters, setCharacters] = useState<CharacterSlot[]>(() => {
    if (initialChar1 && initialChar2 && initialChar3 && initialTalents) {
      return decodeBuildFromPath(
        initialChar1,
        initialChar2,
        initialChar3,
        initialTalents,
        characterNames,
      ).characters
    }
    return [
      { name: characterNames[0] || null, role: 'main' as const, label: '主力' },
      { name: characterNames[1] || null, role: 'support' as const, label: '支援1' },
      { name: characterNames[2] || null, role: 'support' as const, label: '支援2' },
    ]
  })

  const [selectedTalents, setSelectedTalents] = useState<SelectedTalent[]>(() => {
    if (initialChar1 && initialChar2 && initialChar3 && initialTalents) {
      return decodeBuildFromPath(
        initialChar1,
        initialChar2,
        initialChar3,
        initialTalents,
        characterNames,
      ).selectedTalents
    }
    return []
  })

  const [buildName, setBuildName] = useState('新規ビルド')
  const [activeTab, setActiveTab] = useState('qualities')
  const [characterDialogOpen, setCharacterDialogOpen] = useState(false)
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null)
  const [currentUrl, setCurrentUrl] = useState(() => {
    if (initialChar1 && initialChar2 && initialChar3 && initialTalents) {
      const { characters: decodedChars, selectedTalents: decodedTalents } =
        decodeBuildFromPath(
          initialChar1,
          initialChar2,
          initialChar3,
          initialTalents,
          characterNames,
        )
      return encodeBuildToPath(decodedChars, decodedTalents)
    }
    return '/build'
  })

  // モバイル判定
  const isMobile = useIsMobile()

  // モバイル用のセクション折りたたみ状態（デフォルトは閉じた状態で素質選択エリアを広く表示）
  const [isBuildInfoOpen, setIsBuildInfoOpen] = useState(false)
  const [isSavedBuildsOpen, setIsSavedBuildsOpen] = useState(false)

  // 保存されたビルドの管理
  const { builds, addBuild, removeBuild } = useSavedBuilds()

  // URLを更新する関数
  const updateUrl = useCallback(
    (chars: CharacterSlot[], talents: SelectedTalent[]) => {
      const newPath = encodeBuildToPath(chars, talents)
      // 全てのキャラクターが選択されている場合のみURLを更新
      if (chars[0]?.name && chars[1]?.name && chars[2]?.name) {
        window.history.replaceState(null, '', newPath)
        setCurrentUrl(newPath)
      }
    },
    [],
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
        if (existing.level < MAX_TALENT_LEVEL) {
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

  const handleSaveBuild = () => {
    if (characters[0]?.name && characters[1]?.name && characters[2]?.name) {
      addBuild(buildName, currentUrl)
    }
  }

  const handleCharacterChange = (slotIndex: number, newName: string) => {
    // 変更前のキャラクター名とロールを取得
    const prevCharacterName = characters[slotIndex]?.name
    const prevRole = characters[slotIndex]?.role
    setCharacters((prev) =>
      prev.map((char, i) => (i === slotIndex ? { ...char, name: newName } : char)),
    )
    // 変更前キャラクターの素質をクリア（同じキャラが他スロットにいる場合は消さない）
    if (prevCharacterName && prevRole) {
      setSelectedTalents((prev) =>
        prev.filter(
          (t) => !(t.characterName === prevCharacterName && t.role === prevRole)
        )
      )
    }
  }

  const openCharacterDialog = (slotIndex: number) => {
    setEditingSlotIndex(slotIndex)
    setCharacterDialogOpen(true)
  }

  const mainCharacter = characters[0]
  const support1 = characters[1]
  const support2 = characters[2]

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="flex h-full flex-col gap-2 p-2 lg:gap-4 lg:p-4 lg:flex-row">
        {/* 左パネル - ビルド情報 */}
        <div className={`flex w-full shrink-0 flex-col rounded-xl border-2 border-slate-300 bg-slate-50/80 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-800/80 lg:h-full lg:w-80 ${isMobile ? 'p-2' : 'p-4'}`}>
          {/* ビルド名 - モバイルではコンパクトに */}
          <div className={`rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 text-white ${isMobile ? 'mb-2 p-2' : 'mb-4 p-4'}`}>
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center rounded-full bg-amber-500 font-bold ${isMobile ? 'h-8 w-8 text-sm' : 'h-10 w-10 text-lg'}`}>
                {DEFAULT_BUILD_LEVEL}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={buildName}
                  onChange={(e) => setBuildName(e.target.value)}
                  aria-label="ビルド名"
                  placeholder="ビルド名を入力"
                  className={`w-full bg-transparent font-bold outline-none ${isMobile ? 'text-base' : 'text-xl'}`}
                />
              </div>
            </div>
          </div>

          {/* モバイルの場合、ビルド情報を折りたたみ可能にする */}
          {isMobile ? (
            <Collapsible open={isBuildInfoOpen} onOpenChange={setIsBuildInfoOpen}>
              <CollapsibleTrigger
                className="mb-2 flex w-full items-center justify-between rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-bold dark:bg-slate-700"
                aria-expanded={isBuildInfoOpen}
              >
                <span className="flex items-center gap-1 text-amber-600">
                  <span>🏆</span>
                  巡遊者・ロスレコ
                </span>
                {isBuildInfoOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2">
                {/* 巡遊者（キャラクター）セクション - コンパクト版 */}
                <div>
                  <div className="grid grid-cols-3 gap-1">
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

                {/* メインロスレコセクション（プレースホルダー） - コンパクト版 */}
                <div>
                  <h3 className="mb-1 flex items-center gap-1 text-sm font-bold">
                    <span>⊕</span>
                    メインロスレコ
                  </h3>
                  <div className="grid grid-cols-3 gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg border-2 border-dashed border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-700"
                      />
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <>
              {/* デスクトップ: 巡遊者（キャラクター）セクション */}
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

              {/* デスクトップ: メインロスレコセクション（プレースホルダー） */}
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
            </>
          )}

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

          {/* ステータス表示 - モバイルではコンパクトに */}
          <div className={`rounded-lg bg-slate-200 dark:bg-slate-700 ${isMobile ? 'mt-2 p-2' : 'mt-4 p-3'}`}>
            <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <span className="text-blue-500">ℹ</span>
              <span>
                選択素質: {selectedTalents.length}個 / 合計Lv: {selectedTalents.reduce((sum, t) => sum + t.level, 0)}
              </span>
            </div>
          </div>

          {/* 登録ボタン */}
          <div className={isMobile ? 'mt-2' : 'mt-4'}>
            <button
              type="button"
              onClick={handleSaveBuild}
              disabled={!characters[0]?.name || !characters[1]?.name || !characters[2]?.name}
              className={`flex w-full items-center justify-center gap-1 rounded-lg bg-pink-100 font-medium text-pink-600 transition-colors hover:bg-pink-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-pink-900 dark:text-pink-300 dark:hover:bg-pink-800 ${isMobile ? 'py-1.5 text-sm' : 'py-2'}`}
            >
              ❤ 登録
            </button>
          </div>

          {/* 保存されたビルドリスト - モバイルでは折りたたみ可能 */}
          {isMobile ? (
            <Collapsible
              open={isSavedBuildsOpen}
              onOpenChange={setIsSavedBuildsOpen}
              className="mt-2"
            >
              <CollapsibleTrigger
                className="flex w-full items-center justify-between rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-bold dark:bg-slate-700"
                aria-expanded={isSavedBuildsOpen}
              >
                <span className="flex items-center gap-1">
                  <span>📋</span>
                  保存済み ({builds.length})
                </span>
                {isSavedBuildsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <SavedBuildList
                  builds={builds}
                  onRemove={removeBuild}
                  currentUrl={currentUrl}
                />
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <div className="mt-4 flex min-h-0 flex-1 flex-col">
              <h3 className="mb-2 flex items-center gap-1 font-bold">
                <span>📋</span>
                保存済みビルド
              </h3>
              <div className="min-h-0 flex-1 overflow-hidden">
                <SavedBuildList
                  builds={builds}
                  onRemove={removeBuild}
                  currentUrl={currentUrl}
                />
              </div>
            </div>
          )}
        </div>

        {/* 右パネル - 素質/ロスレコスキル */}
        <div className="flex min-h-0 flex-1 flex-col rounded-xl border-2 border-slate-300 bg-slate-50/80 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-800/80">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
            <TabsList className="w-full shrink-0 justify-start rounded-none rounded-t-xl border-b bg-slate-100 p-0 dark:bg-slate-900">
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

            <TabsContent value="qualities" className="mt-0 min-h-0 flex-1">
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

            <TabsContent value="lossreco" className="mt-0 min-h-0 flex-1">
              <ScrollArea className="h-full p-4">
                <div className="flex min-h-64 items-center justify-center text-slate-500">
                  <p>ロスレコスキル機能は準備中です</p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
