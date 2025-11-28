'use client'

import { buildSearchParamKeys } from 'app/build/searchParams'
import { SavedBuildList } from 'app/build/SavedBuildList'
import {
  CharacterAvatar,
  CharacterQualitiesSection,
  CharacterSelectDialog,
  isCoreTalent,
  LossRecordSelectDialog,
  LossRecordSlots,
  MAX_CORE_TALENTS,
  MAX_TALENT_LEVEL,
  SubLossRecordSelectDialog,
} from 'components/build'
import type { CharacterInfo, SelectedTalent } from 'components/build'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'components/ui/collapsible'
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
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import type { LossRecordInfo } from 'types/lossRecord'
import type { CharacterQualities } from 'types/quality'

/** デフォルトのビルドレベル（表示用） */
const DEFAULT_BUILD_LEVEL = 25

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
 * ビルド情報をURLクエリ文字列に変換
 */
function encodeBuildToQueryString(
  characters: CharacterSlot[],
  selectedTalents: SelectedTalent[],
  mainLossRecordIds: number[],
  subLossRecordIds: number[],
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

  const params = new URLSearchParams()
  params.set(buildSearchParamKeys.char1, char1)
  params.set(buildSearchParamKeys.char2, char2)
  params.set(buildSearchParamKeys.char3, char3)
  params.set(buildSearchParamKeys.talents, talentsCode)

  if (mainLossRecordIds.length > 0) {
    params.set(buildSearchParamKeys.mainLossRecords, mainLossRecordIds.join(','))
  }
  if (subLossRecordIds.length > 0) {
    params.set(buildSearchParamKeys.subLossRecords, subLossRecordIds.join(','))
  }

  return `/build?${params.toString()}`
}

/**
 * URLクエリからビルド情報をデコード
 */
function decodeBuildFromQuery(
  char1: string | null,
  char2: string | null,
  char3: string | null,
  talentsCode: string | null,
  characterNames: string[],
): { characters: CharacterSlot[]; selectedTalents: SelectedTalent[] } {
  // キャラクター名の検証
  const validChar1 = char1 && characterNames.includes(char1) ? char1 : null
  const validChar2 = char2 && characterNames.includes(char2) ? char2 : null
  const validChar3 = char3 && characterNames.includes(char3) ? char3 : null

  const characters: CharacterSlot[] = [
    { name: validChar1, role: 'main', label: '主力' },
    { name: validChar2, role: 'support', label: '支援1' },
    { name: validChar3, role: 'support', label: '支援2' },
  ]

  if (!talentsCode) {
    return { characters, selectedTalents: [] }
  }

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
  lossRecordData?: LossRecordInfo[]
}

interface CharacterSlot {
  name: string | null
  role: 'main' | 'support'
  label: string
}

export const BuildCreator: FC<BuildCreatorProps> = ({
  qualitiesData,
  lossRecordData = [],
}) => {
  // nuqsを使ってクエリパラメータを型安全に管理
  const [searchParams, setSearchParams] = useQueryStates(
    {
      [buildSearchParamKeys.char1]: parseAsString,
      [buildSearchParamKeys.char2]: parseAsString,
      [buildSearchParamKeys.char3]: parseAsString,
      [buildSearchParamKeys.talents]: parseAsString,
      [buildSearchParamKeys.mainLossRecords]: parseAsArrayOf(parseAsInteger, ','),
      [buildSearchParamKeys.subLossRecords]: parseAsArrayOf(parseAsInteger, ','),
    },
    {
      history: 'replace',
      shallow: true,
    },
  )

  // キャラクター情報（名前、アイコン、属性、ロール）をメモ化してパフォーマンス向上
  const characterInfoList = useMemo<CharacterInfo[]>(
    () =>
      Object.entries(qualitiesData).map(([name, qualities]) => ({
        element: qualities.element,
        iconUrl: qualities.icon,
        name,
        position: qualities.position,
      })),
    [qualitiesData],
  )

  // 後方互換性のためcharacterNamesも保持
  const characterNames = useMemo(
    () => characterInfoList.map((c) => c.name),
    [characterInfoList],
  )

  // キャラクター名からアイコンURLを取得するヘルパー
  const getCharacterIconUrl = useCallback(
    (name: string | null): string | undefined => {
      if (!name) return undefined
      return characterInfoList.find((c) => c.name === name)?.iconUrl
    },
    [characterInfoList],
  )

  // URLパラメータからキャラクターと素質を復元（初期化時のみ）
  const initialBuild = useMemo(() => {
    const char1 = searchParams[buildSearchParamKeys.char1]
    const char2 = searchParams[buildSearchParamKeys.char2]
    const char3 = searchParams[buildSearchParamKeys.char3]
    const talents = searchParams[buildSearchParamKeys.talents]

    if (char1 && char2 && char3) {
      return decodeBuildFromQuery(char1, char2, char3, talents, characterNames)
    }

    // デフォルト値
    return {
      characters: [
        { name: characterNames[0] || null, role: 'main' as const, label: '主力' },
        { name: characterNames[1] || null, role: 'support' as const, label: '支援1' },
        { name: characterNames[2] || null, role: 'support' as const, label: '支援2' },
      ],
      selectedTalents: [],
    }
  }, [searchParams, characterNames])

  // ローカルのUIステート
  const [characters, setCharacters] = useState<CharacterSlot[]>(initialBuild.characters)
  const [selectedTalents, setSelectedTalents] = useState<SelectedTalent[]>(
    initialBuild.selectedTalents,
  )

  const [buildName, setBuildName] = useState('新規ビルド')
  const [activeTab, setActiveTab] = useState('qualities')
  const [characterDialogOpen, setCharacterDialogOpen] = useState(false)
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null)

  // ロスレコ選択状態（初期値をURLパラメータから復元）
  const [mainLossRecordIds, setMainLossRecordIds] = useState<number[]>(
    searchParams[buildSearchParamKeys.mainLossRecords] ?? [],
  )
  const [subLossRecordIds, setSubLossRecordIds] = useState<number[]>(
    searchParams[buildSearchParamKeys.subLossRecords] ?? [],
  )
  const [mainLossRecordDialogOpen, setMainLossRecordDialogOpen] = useState(false)
  const [subLossRecordDialogOpen, setSubLossRecordDialogOpen] = useState(false)

  // モバイル判定
  const isMobile = useIsMobile()

  // モバイル用のセクション折りたたみ状態（デフォルトは閉じた状態で素質選択エリアを広く表示）
  const [isBuildInfoOpen, setIsBuildInfoOpen] = useState(false)
  const [isSavedBuildsOpen, setIsSavedBuildsOpen] = useState(false)

  // 保存されたビルドの管理
  const { builds, addBuild, removeBuild } = useSavedBuilds()

  // 現在のURL（保存用）
  const currentUrl = useMemo(
    () =>
      encodeBuildToQueryString(
        characters,
        selectedTalents,
        mainLossRecordIds,
        subLossRecordIds,
      ),
    [characters, selectedTalents, mainLossRecordIds, subLossRecordIds],
  )

  // URLを更新する関数
  const updateUrlParams = useCallback(
    (
      chars: CharacterSlot[],
      talents: SelectedTalent[],
      mainLrIds: number[],
      subLrIds: number[],
    ) => {
      const char1 = chars[0]?.name
      const char2 = chars[1]?.name
      const char3 = chars[2]?.name

      if (!char1 || !char2 || !char3) {
        return
      }

      const talentsArray = selectedTalentsToArray(talents, chars)
      const bigIntValue = arrayToBase7BigInt(talentsArray)
      const talentsCode = bigIntToBase64Url(bigIntValue)

      setSearchParams({
        [buildSearchParamKeys.char1]: char1,
        [buildSearchParamKeys.char2]: char2,
        [buildSearchParamKeys.char3]: char3,
        [buildSearchParamKeys.talents]: talentsCode,
        [buildSearchParamKeys.mainLossRecords]: mainLrIds.length > 0 ? mainLrIds : null,
        [buildSearchParamKeys.subLossRecords]: subLrIds.length > 0 ? subLrIds : null,
      })
    },
    [setSearchParams],
  )

  // 初回レンダリング時にURLパラメータがあるかどうかをチェック
  const hasInitialUrlParams = useMemo(() => {
    return !!(
      searchParams[buildSearchParamKeys.char1] &&
      searchParams[buildSearchParamKeys.char2] &&
      searchParams[buildSearchParamKeys.char3] &&
      searchParams[buildSearchParamKeys.talents]
    )
  }, []) // 空の依存配列で初回のみ計算

  // ユーザーが変更を加えたかどうかを追跡
  const [hasUserMadeChanges, setHasUserMadeChanges] = useState(hasInitialUrlParams)

  // ステート変更時にURLを更新（ユーザーが変更を加えた場合のみ）
  useEffect(() => {
    if (hasUserMadeChanges) {
      updateUrlParams(characters, selectedTalents, mainLossRecordIds, subLossRecordIds)
    }
  }, [characters, selectedTalents, mainLossRecordIds, subLossRecordIds, updateUrlParams, hasUserMadeChanges])

  const handleTalentSelect = (
    characterName: string,
    role: 'main' | 'sub',
    index: number,
  ) => {
    setHasUserMadeChanges(true)
    // 素質データを取得してコア判定に使用
    const charData = qualitiesData[characterName]
    const qualityRole = role === 'main' ? 'main' : 'sub'
    const quality = charData?.[qualityRole]?.[index]
    const isCore = isCoreTalent(index, quality)

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
        const currentCoreCount = prev.filter((t) => {
          const tCharData = qualitiesData[t.characterName]
          const tQualityRole = t.role === 'main' ? 'main' : 'sub'
          const tQuality = tCharData?.[tQualityRole]?.[t.index]
          return (
            t.characterName === characterName &&
            t.role === role &&
            isCoreTalent(t.index, tQuality)
          )
        }).length

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
    setHasUserMadeChanges(true)
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

  // ロスレコID -> ロスレコ情報を取得するヘルパー
  const getLossRecordById = useCallback(
    (id: number): LossRecordInfo | undefined => {
      return lossRecordData.find((lr) => lr.id === id)
    },
    [lossRecordData],
  )

  // メインロスレコの選択ハンドラー
  const handleMainLossRecordSelect = (id: number) => {
    setHasUserMadeChanges(true)
    setMainLossRecordIds((prev) => {
      if (prev.length >= 3) return prev
      if (prev.includes(id)) return prev // 重複チェック
      return [...prev, id]
    })
  }

  const handleMainLossRecordDeselect = (id: number) => {
    setHasUserMadeChanges(true)
    setMainLossRecordIds((prev) => prev.filter((lrId) => lrId !== id))
  }

  // サブロスレコの選択ハンドラー
  const handleSubLossRecordSelect = (id: number) => {
    setHasUserMadeChanges(true)
    setSubLossRecordIds((prev) => {
      if (prev.length >= 3) return prev
      if (prev.includes(id)) return prev // 重複チェック
      return [...prev, id]
    })
  }

  const handleSubLossRecordDeselect = (id: number) => {
    setHasUserMadeChanges(true)
    setSubLossRecordIds((prev) => prev.filter((lrId) => lrId !== id))
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
                        iconUrl={getCharacterIconUrl(char.name)}
                        label={char.label}
                        isMain={char.role === 'main'}
                        totalLevel={char.name ? calculateTotalLevel(char.name) : 0}
                        onClick={() => openCharacterDialog(index)}
                      />
                    ))}
                  </div>
                </div>

                {/* メインロスレコセクション - コンパクト版 */}
                <div>
                  <h3 className="mb-1 flex items-center gap-1 text-sm font-bold">
                    <span>⊕</span>
                    メインロスレコ
                    <button
                      type="button"
                      onClick={() => setMainLossRecordDialogOpen(true)}
                      className="ml-auto text-slate-400 hover:text-slate-600"
                      aria-label="メインロスレコを選択"
                    >
                      🔍
                    </button>
                  </h3>
                  <LossRecordSlots
                    lossRecordIds={mainLossRecordIds}
                    getLossRecordById={getLossRecordById}
                    onSlotClick={() => setMainLossRecordDialogOpen(true)}
                    onDeselect={handleMainLossRecordDeselect}
                    compact
                  />
                </div>

                {/* サブロスレコセクション - コンパクト版 */}
                <div>
                  <h3 className="mb-1 flex items-center gap-1 text-sm font-bold">
                    <span>⊖</span>
                    サブロスレコ
                    <button
                      type="button"
                      onClick={() => setSubLossRecordDialogOpen(true)}
                      className="ml-auto text-slate-400 hover:text-slate-600"
                      aria-label="サブロスレコを選択"
                    >
                      🔍
                    </button>
                  </h3>
                  <LossRecordSlots
                    lossRecordIds={subLossRecordIds}
                    getLossRecordById={getLossRecordById}
                    onSlotClick={() => setSubLossRecordDialogOpen(true)}
                    onDeselect={handleSubLossRecordDeselect}
                    compact
                  />
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
                      iconUrl={getCharacterIconUrl(char.name)}
                      label={char.label}
                      isMain={char.role === 'main'}
                      totalLevel={char.name ? calculateTotalLevel(char.name) : 0}
                      onClick={() => openCharacterDialog(index)}
                    />
                  ))}
                </div>
              </div>

              {/* デスクトップ: メインロスレコセクション */}
              <div className="mb-4">
                <h3 className="mb-2 flex items-center gap-1 font-bold">
                  <span>⊕</span>
                  メインロスレコ
                  <button
                    type="button"
                    onClick={() => setMainLossRecordDialogOpen(true)}
                    className="ml-auto text-slate-400 hover:text-slate-600"
                    aria-label="メインロスレコを選択"
                  >
                    🔍
                  </button>
                </h3>
                <LossRecordSlots
                  lossRecordIds={mainLossRecordIds}
                  getLossRecordById={getLossRecordById}
                  onSlotClick={() => setMainLossRecordDialogOpen(true)}
                  onDeselect={handleMainLossRecordDeselect}
                />
              </div>

              {/* デスクトップ: サブロスレコセクション */}
              <div className="mb-4">
                <h3 className="mb-2 flex items-center gap-1 font-bold">
                  <span>⊖</span>
                  サブロスレコ
                  <button
                    type="button"
                    onClick={() => setSubLossRecordDialogOpen(true)}
                    className="ml-auto text-slate-400 hover:text-slate-600"
                    aria-label="サブロスレコを選択"
                  >
                    🔍
                  </button>
                </h3>
                <LossRecordSlots
                  lossRecordIds={subLossRecordIds}
                  getLossRecordById={getLossRecordById}
                  onSlotClick={() => setSubLossRecordDialogOpen(true)}
                  onDeselect={handleSubLossRecordDeselect}
                />
              </div>
            </>
          )}

          {/* キャラクター選択ダイアログ */}
          {editingSlotIndex !== null && (
            <CharacterSelectDialog
              open={characterDialogOpen}
              onOpenChange={setCharacterDialogOpen}
              characters={characterInfoList}
              selectedName={characters[editingSlotIndex]?.name ?? null}
              onSelect={(name) => handleCharacterChange(editingSlotIndex, name)}
              slotLabel={characters[editingSlotIndex]?.label ?? ''}
            />
          )}

          {/* メインロスレコ選択ダイアログ */}
          <LossRecordSelectDialog
            open={mainLossRecordDialogOpen}
            onOpenChange={setMainLossRecordDialogOpen}
            lossRecords={lossRecordData}
            selectedIds={mainLossRecordIds}
            onSelect={handleMainLossRecordSelect}
            onDeselect={handleMainLossRecordDeselect}
            title="メインロスレコを選択"
            maxSelection={3}
          />

          {/* サブロスレコ選択ダイアログ */}
          <SubLossRecordSelectDialog
            open={subLossRecordDialogOpen}
            onOpenChange={setSubLossRecordDialogOpen}
            lossRecords={lossRecordData}
            selectedIds={subLossRecordIds}
            onSelect={handleSubLossRecordSelect}
            onDeselect={handleSubLossRecordDeselect}
            title="サブロスレコを選択"
            maxSelection={3}
          />

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
