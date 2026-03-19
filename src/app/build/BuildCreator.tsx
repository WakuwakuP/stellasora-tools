'use client'

import { buildSearchParamKeys, buildSerializer } from '@/app/build/searchParams'
import { SavedBuildList } from '@/app/build/SavedBuildList'
import {
  CharacterAvatar,
  CharacterQualitiesSection,
  CharacterSelectDialog,
  isCoreTalent,
  LossRecordSelectDialog,
  LossRecordSkillSection,
  LossRecordSlots,
  MAX_CORE_TALENTS,
  MAX_TALENT_LEVEL,
  SubLossRecordSelectDialog,
} from '@/components/build'
import type { CharacterInfo, SelectedTalent } from '@/components/build'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useIsLandscape, useIsMobile } from '@/hooks/use-mobile'
import { useSavedBuilds } from '@/hooks/useSavedBuilds'
import { useShare } from '@/hooks/useShare'
import {
  arrayToBase7BigInt,
  base7BigIntToArray,
  base7ToArray,
  base64UrlToBigInt,
  bigIntToBase64Url,
} from '@/lib/encoding-utils'
import { ChevronDown, ChevronUp, Pencil, Share2 } from 'lucide-react'
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { createShortenedUrl } from '@/actions/shortenUrl'
import type { LossRecordInfo } from '@/types/lossRecord'
import type { CharacterQualities } from '@/types/quality'

/** 素質数（1キャラクター16個 × 3人 = 48個） */
const TALENTS_PER_CHARACTER = 16
const TOTAL_CHARACTERS = 3
const TOTAL_TALENTS = TALENTS_PER_CHARACTER * TOTAL_CHARACTERS

/**
 * エンコード形式の判定閾値
 * Base-7 (v1): 最大23文字、Base-10 (v2): 24文字以上
 * 長さで自動判別することでプレフィックス不要
 */
const BASE7_MAX_LENGTH = 23

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
 * nuqsのcreateSerializerを使用してパラメータを生成
 */
function encodeBuildToQueryString(
  buildName: string,
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

  // nuqsのcreateSerializerを使用してURL生成
  const queryString = buildSerializer('/build', {
    [buildSearchParamKeys.char1]: char1,
    [buildSearchParamKeys.char2]: char2,
    [buildSearchParamKeys.char3]: char3,
    [buildSearchParamKeys.mainLossRecords]: mainLossRecordIds.length > 0 ? mainLossRecordIds : null,
    [buildSearchParamKeys.name]: buildName || null,
    [buildSearchParamKeys.subLossRecords]: subLossRecordIds.length > 0 ? subLossRecordIds : null,
    [buildSearchParamKeys.talents]: talentsCode,
  })

  return queryString
}

/**
 * URLクエリからビルド情報をデコード（v1/v2両対応）
 * 長さで自動判別:
 * - 長さ <= 23: v1形式（Base-7、レベル0-6）
 * - 長さ >= 24: v2形式（Base-10、レベル0-9）
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
    // 長さで判別（Base-7は最大23文字、Base-10は24文字以上）
    const isBase10 = talentsCode.length > BASE7_MAX_LENGTH
    
    const bigIntValue = base64UrlToBigInt(talentsCode)
    const talentsArray = isBase10
      ? base7BigIntToArray(bigIntValue, TOTAL_TALENTS) // v2: Base-10
      : base7ToArray(bigIntValue, TOTAL_TALENTS) // v1: Base-7
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
      // パラメータはアルファベット順（c1, c2, c3, m, n, s, t）
      [buildSearchParamKeys.char1]: parseAsString,
      [buildSearchParamKeys.char2]: parseAsString,
      [buildSearchParamKeys.char3]: parseAsString,
      [buildSearchParamKeys.mainLossRecords]: parseAsArrayOf(parseAsInteger, ','),
      [buildSearchParamKeys.name]: parseAsString,
      [buildSearchParamKeys.subLossRecords]: parseAsArrayOf(parseAsInteger, ','),
      [buildSearchParamKeys.talents]: parseAsString,
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

  const [buildName, setBuildName] = useState(
    searchParams[buildSearchParamKeys.name] || '',
  )
  const [activeTab, setActiveTab] = useState('qualities')
  const [characterDialogOpen, setCharacterDialogOpen] = useState(false)
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null)

  // ビルド名入力ダイアログ用のステート
  const [buildNameDialogOpen, setBuildNameDialogOpen] = useState(false)
  const [pendingBuildName, setPendingBuildName] = useState('')

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
  const isLandscape = useIsLandscape()

  // モバイル用のセクション折りたたみ状態（デフォルトは閉じた状態で素質選択エリアを広く表示）
  const [isBuildInfoOpen, setIsBuildInfoOpen] = useState(false)
  const [isSavedBuildsOpen, setIsSavedBuildsOpen] = useState(false)

  // 横向きモード用の左パネルタブ状態
  const [leftPanelTab, setLeftPanelTab] = useState('characters')

  // モード切替時にタブ状態をリセット
  useEffect(() => {
    // デスクトップモードで landscape 専用タブが選択されている場合は characters にリセット
    if (!isMobile && !isLandscape) {
      if (leftPanelTab === 'main-lr' || leftPanelTab === 'sub-lr') {
        setLeftPanelTab('characters')
      }
    }
  }, [isMobile, isLandscape, leftPanelTab])

  // 保存されたビルドの管理
  const { builds, addBuild, removeBuild } = useSavedBuilds()

  // URL共有機能
  const { share } = useShare()

  // 現在のURL（保存用）
  const currentUrl = useMemo(
    () =>
      encodeBuildToQueryString(
        buildName,
        characters,
        selectedTalents,
        mainLossRecordIds,
        subLossRecordIds,
      ),
    [buildName, characters, selectedTalents, mainLossRecordIds, subLossRecordIds],
  )

  // URLを更新する関数
  const updateUrlParams = useCallback(
    (
      name: string,
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

      // パラメータはアルファベット順（c1, c2, c3, m, n, s, t）
      setSearchParams({
        [buildSearchParamKeys.char1]: char1,
        [buildSearchParamKeys.char2]: char2,
        [buildSearchParamKeys.char3]: char3,
        [buildSearchParamKeys.mainLossRecords]: mainLrIds.length > 0 ? mainLrIds : null,
        [buildSearchParamKeys.name]: name || null,
        [buildSearchParamKeys.subLossRecords]: subLrIds.length > 0 ? subLrIds : null,
        [buildSearchParamKeys.talents]: talentsCode,
      })
    },
    [setSearchParams],
  )

  // 初回レンダリング時にURLパラメータがあるかどうかをチェック（refで初回値をキャプチャ）
  const hasInitialUrlParamsRef = useRef(
    !!(
      searchParams[buildSearchParamKeys.char1] &&
      searchParams[buildSearchParamKeys.char2] &&
      searchParams[buildSearchParamKeys.char3] &&
      searchParams[buildSearchParamKeys.talents]
    ),
  )

  // ユーザーが変更を加えたかどうかを追跡
  const [hasUserMadeChanges, setHasUserMadeChanges] = useState(hasInitialUrlParamsRef.current)

  // ステート変更時にURLを更新（ユーザーが変更を加えた場合のみ）
  useEffect(() => {
    if (hasUserMadeChanges) {
      updateUrlParams(buildName, characters, selectedTalents, mainLossRecordIds, subLossRecordIds)
    }
  }, [buildName, characters, selectedTalents, mainLossRecordIds, subLossRecordIds, updateUrlParams, hasUserMadeChanges])

  // URLパラメータが外部から変更された時（保存済みビルドのクリックなど）にステートを同期
  useEffect(() => {
    const urlName = searchParams[buildSearchParamKeys.name]
    const urlChar1 = searchParams[buildSearchParamKeys.char1]
    const urlChar2 = searchParams[buildSearchParamKeys.char2]
    const urlChar3 = searchParams[buildSearchParamKeys.char3]
    const urlTalents = searchParams[buildSearchParamKeys.talents]
    const urlMainLr = searchParams[buildSearchParamKeys.mainLossRecords] ?? []
    const urlSubLr = searchParams[buildSearchParamKeys.subLossRecords] ?? []

    // URLにパラメータがある場合、ステートを同期
    if (urlChar1 && urlChar2 && urlChar3 && urlTalents) {
      const decoded = decodeBuildFromQuery(urlChar1, urlChar2, urlChar3, urlTalents, characterNames)
      
      // 現在のステートとURLが異なる場合のみ更新（無限ループ防止）
      const currentChar1 = characters[0]?.name
      const currentChar2 = characters[1]?.name
      const currentChar3 = characters[2]?.name
      const currentName = buildName
      const newName = urlName || ''
      
      if (urlChar1 !== currentChar1 || urlChar2 !== currentChar2 || urlChar3 !== currentChar3 || newName !== currentName) {
        setBuildName(newName)
        setCharacters(decoded.characters)
        setSelectedTalents(decoded.selectedTalents)
        setMainLossRecordIds(urlMainLr)
        setSubLossRecordIds(urlSubLr)
        setHasUserMadeChanges(true)
      }
    }
  }, [searchParams, characterNames])

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
          const newLevel = (existing.level + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
          return prev.map((t) =>
            t === existing ? { ...t, level: newLevel } : t,
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

  const handleTalentDeselect = (
    characterName: string,
    role: 'main' | 'sub',
    index: number,
  ) => {
    setHasUserMadeChanges(true)
    setSelectedTalents((prev) =>
      prev.filter(
        (t) =>
          !(
            t.characterName === characterName &&
            t.role === role &&
            t.index === index
          ),
      ),
    )
  }

  const calculateTotalLevel = (characterName: string) => {
    return selectedTalents
      .filter((t) => t.characterName === characterName)
      .reduce((sum, t) => sum + t.level, 0)
  }

  const handleSaveBuild = () => {
    if (characters[0]?.name && characters[1]?.name && characters[2]?.name) {
      if (!buildName.trim()) {
        // ビルド名が空の場合は入力ダイアログを表示
        setPendingBuildName('')
        setBuildNameDialogOpen(true)
      } else {
        addBuild(buildName, currentUrl)
      }
    }
  }

  const handleSaveBuildWithName = () => {
    if (pendingBuildName.trim()) {
      // ビルド名を設定してURLも更新
      const trimmedName = pendingBuildName.trim()
      setBuildName(trimmedName)
      // 新しい名前でURLを生成
      const newUrl = encodeBuildToQueryString(
        trimmedName,
        characters,
        selectedTalents,
        mainLossRecordIds,
        subLossRecordIds,
      )
      addBuild(trimmedName, newUrl)
      setBuildNameDialogOpen(false)
      setHasUserMadeChanges(true)
    }
  }

  const handleShareBuild = async () => {
    if (characters[0]?.name && characters[1]?.name && characters[2]?.name) {
      const shareTitle = buildName || '新規ビルド'
      const absoluteUrl = `${window.location.origin}${currentUrl}`

      // 短縮URL生成を試みる
      try {
        const result = await createShortenedUrl(absoluteUrl)
        if ('code' in result) {
          const shortUrl = `${window.location.origin}/s/${result.code}`
          share({
            title: `${shareTitle} - Stellasora Tools`,
            text: `ビルド編成: ${characters[0].name}, ${characters[1].name}, ${characters[2].name}`,
            url: shortUrl,
          })
          return
        }
      } catch {
        // 短縮URL生成失敗時はフォールバック
      }

      // フォールバック: 元のURLで共有
      share({
        title: `${shareTitle} - Stellasora Tools`,
        text: `ビルド編成: ${characters[0].name}, ${characters[1].name}, ${characters[2].name}`,
        url: currentUrl,
      })
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
      <div className="flex h-full flex-col gap-2 p-2 md:gap-3 md:p-3 lg:gap-4 lg:p-4 md:flex-row landscape:gap-1.5 landscape:p-1.5">
        {/* 左パネル - ビルド情報 */}
        <div className={`flex w-full shrink-0 flex-col rounded-xl border-2 border-slate-300 bg-slate-50/80 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-800/80 md:h-full md:w-64 lg:w-80 xl:w-96 landscape:rounded-lg ${isMobile ? 'p-2' : 'p-3 lg:p-4'} landscape:p-2`}>
          {/* ビルド名 - モバイルではコンパクトに */}
          <div className={`rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 text-white ${isMobile ? 'mb-2 p-2' : 'mb-4 p-4'} landscape:mb-1.5 landscape:p-1.5`}>
            <div className="flex items-center gap-2">
              <Pencil className={`shrink-0 text-slate-400 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'} landscape:h-3.5 landscape:w-3.5`} />
              <div className="flex-1">
                <input
                  type="text"
                  value={buildName}
                  onChange={(e) => setBuildName(e.target.value)}
                  aria-label="ビルド名"
                  placeholder="新規ビルド"
                  className={`w-full bg-transparent font-bold outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-slate-400 focus:rounded ${isMobile ? 'text-base' : 'text-xl'} landscape:text-sm`}
                />
              </div>
            </div>
          </div>

          {/* 横向きモードの場合、タブ表示にする */}
          {isLandscape ? (
            <Tabs value={leftPanelTab} onValueChange={setLeftPanelTab} className="flex min-h-0 flex-1 flex-col">
              <TabsList className="w-full shrink-0 grid grid-cols-4 rounded-lg p-0.5">
                <TabsTrigger value="characters" className="px-1 py-1 text-xs">
                  キャラクター
                </TabsTrigger>
                <TabsTrigger value="main-lr" className="px-1 py-1 text-xs">
                  メイン
                </TabsTrigger>
                <TabsTrigger value="sub-lr" className="px-1 py-1 text-xs">
                  サブ
                </TabsTrigger>
                <TabsTrigger value="builds" className="px-1 py-1 text-xs">
                  ビルド
                </TabsTrigger>
              </TabsList>

              <TabsContent value="characters" className="mt-1.5 min-h-0 flex-1">
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
              </TabsContent>

              <TabsContent value="main-lr" className="mt-1.5 min-h-0 flex-1">
                <div>
                  <h3 className="mb-1 flex items-center gap-1 text-xs font-bold">
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
                    showSecondaryNotes
                  />
                </div>
              </TabsContent>

              <TabsContent value="sub-lr" className="mt-1.5 min-h-0 flex-1">
                <div>
                  <h3 className="mb-1 flex items-center gap-1 text-xs font-bold">
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
              </TabsContent>

              <TabsContent value="builds" className="mt-1.5 min-h-0 flex-1 overflow-hidden">
                <SavedBuildList
                  builds={builds}
                  onRemove={removeBuild}
                  currentUrl={currentUrl}
                />
              </TabsContent>

              {/* ステータス表示 */}
              <div className="mt-1.5 rounded-lg bg-slate-200 p-1.5 dark:bg-slate-700">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-blue-500">ℹ</span>
                  <span>
                    選択素質: {selectedTalents.length}個 / 合計Lv: {selectedTalents.reduce((sum, t) => sum + t.level, 0)}
                  </span>
                </div>
              </div>

              {/* 登録・共有ボタン */}
              <div className="mt-1.5 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={handleSaveBuild}
                  disabled={!characters[0]?.name || !characters[1]?.name || !characters[2]?.name}
                  className="flex items-center justify-center gap-0.5 rounded-lg bg-pink-100 py-1 text-xs font-medium text-pink-600 transition-colors hover:bg-pink-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-pink-900 dark:text-pink-300 dark:hover:bg-pink-800"
                >
                  ❤ 登録
                </button>
                <button
                  type="button"
                  onClick={handleShareBuild}
                  disabled={!characters[0]?.name || !characters[1]?.name || !characters[2]?.name}
                  className="flex items-center justify-center gap-0.5 rounded-lg bg-blue-100 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                >
                  <Share2 className="h-3 w-3" />
                  共有
                </button>
              </div>
            </Tabs>
          ) : isMobile ? (
            /* モバイルの場合、ビルド情報を折りたたみ可能にする */
            <>
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
                      showSecondaryNotes
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

              {/* モバイル: ステータス表示 */}
              <div className="mt-2 rounded-lg bg-slate-200 p-2 dark:bg-slate-700">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-blue-500">ℹ</span>
                  <span>
                    選択素質: {selectedTalents.length}個 / 合計Lv: {selectedTalents.reduce((sum, t) => sum + t.level, 0)}
                  </span>
                </div>
              </div>

              {/* モバイル: 登録・共有ボタン */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSaveBuild}
                  disabled={!characters[0]?.name || !characters[1]?.name || !characters[2]?.name}
                  className="flex items-center justify-center gap-1 rounded-lg bg-pink-100 py-1.5 font-medium text-pink-600 text-sm transition-colors hover:bg-pink-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-pink-900 dark:text-pink-300 dark:hover:bg-pink-800"
                >
                  ❤ 登録
                </button>
                <button
                  type="button"
                  onClick={handleShareBuild}
                  disabled={!characters[0]?.name || !characters[1]?.name || !characters[2]?.name}
                  className="flex items-center justify-center gap-1 rounded-lg bg-blue-100 py-1.5 font-medium text-blue-600 text-sm transition-colors hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                >
                  <Share2 className="h-4 w-4" />
                  共有
                </button>
              </div>

              {/* モバイル: 保存されたビルドリスト - 折りたたみ可能 */}
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
            </>
          ) : (
            /* デスクトップ: タブ表示（キャラクターとビルドの2タブ） */
            <Tabs value={leftPanelTab} onValueChange={setLeftPanelTab} className="flex min-h-0 flex-1 flex-col">
              <TabsList className="w-full shrink-0 grid grid-cols-2 rounded-lg p-1">
                <TabsTrigger value="characters" className="text-sm">
                  キャラクター
                </TabsTrigger>
                <TabsTrigger value="builds" className="text-sm">
                  ビルド
                </TabsTrigger>
              </TabsList>

              <TabsContent value="characters" className="mt-2 min-h-0 flex-1 flex flex-col">
                <ScrollArea className="min-h-0 flex-1">
                  <div className="space-y-2 pr-3">
                    {/* 巡遊者（キャラクター）セクション */}
                    <div>
                      <h3 className="mb-1 flex items-center gap-1 text-sm font-bold text-amber-600">
                        <span>🏆</span>
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

                    {/* メインロスレコセクション */}
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
                        showSecondaryNotes
                      />
                    </div>

                    {/* サブロスレコセクション */}
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
                      />
                    </div>

                    {/* ステータス表示 */}
                    <div className="rounded-lg bg-slate-200 p-2 dark:bg-slate-700">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-blue-500">ℹ</span>
                        <span>
                          選択素質: {selectedTalents.length}個 / 合計Lv: {selectedTalents.reduce((sum, t) => sum + t.level, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* 登録・共有ボタン */}
                <div className="mt-2 shrink-0 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleSaveBuild}
                    disabled={!characters[0]?.name || !characters[1]?.name || !characters[2]?.name}
                    className="flex items-center justify-center gap-1 rounded-lg bg-pink-100 py-1.5 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-pink-900 dark:text-pink-300 dark:hover:bg-pink-800"
                  >
                    ❤ 登録
                  </button>
                  <button
                    type="button"
                    onClick={handleShareBuild}
                    disabled={!characters[0]?.name || !characters[1]?.name || !characters[2]?.name}
                    className="flex items-center justify-center gap-1 rounded-lg bg-blue-100 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                  >
                    <Share2 className="h-4 w-4" />
                    共有
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="builds" className="mt-2 min-h-0 flex-1 overflow-hidden">
                <SavedBuildList
                  builds={builds}
                  onRemove={removeBuild}
                  currentUrl={currentUrl}
                />
              </TabsContent>
            </Tabs>
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
        </div>

        {/* 右パネル - 素質/ロスレコスキル */}
        <div className="flex min-h-0 flex-1 flex-col rounded-xl border-2 border-slate-300 bg-slate-50/80 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-800/80 landscape:rounded-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
            <TabsList className="w-full shrink-0 justify-start rounded-none rounded-t-xl border-b bg-slate-100 p-0 dark:bg-slate-900 landscape:rounded-t-lg">
              <TabsTrigger
                value="qualities"
                className="rounded-none rounded-tl-xl border-r px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 landscape:rounded-tl-lg landscape:px-2.5 landscape:py-1.5"
              >
                素質収集
              </TabsTrigger>
              <TabsTrigger
                value="lossreco"
                className="rounded-none border-r px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 landscape:px-2.5 landscape:py-1.5"
              >
                ロスレコスキル
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qualities" className="mt-0 min-h-0 flex-1">
              <ScrollArea className="h-full p-2 sm:p-3 md:p-4 landscape:p-1.5">
                {/* 主力キャラクターの素質 */}
                {mainCharacter.name && qualitiesData[mainCharacter.name] && (
                  <CharacterQualitiesSection
                    characterName={mainCharacter.name}
                    qualities={qualitiesData[mainCharacter.name].main}
                    role="main"
                    selectedTalents={selectedTalents}
                    onTalentSelect={handleTalentSelect}
                    onTalentDeselect={handleTalentDeselect}
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
                    onTalentDeselect={handleTalentDeselect}
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
                    onTalentDeselect={handleTalentDeselect}
                    totalLevel={calculateTotalLevel(support2.name)}
                  />
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="lossreco" className="mt-0 min-h-0 flex-1">
              <ScrollArea className="h-full p-2 sm:p-3 md:p-4 landscape:p-1.5">
                <LossRecordSkillSection
                  mainLossRecords={mainLossRecordIds
                    .map((id) => getLossRecordById(id))
                    .filter((lr): lr is LossRecordInfo => lr !== undefined)}
                  subLossRecords={subLossRecordIds
                    .map((id) => getLossRecordById(id))
                    .filter((lr): lr is LossRecordInfo => lr !== undefined)}
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ビルド名入力ダイアログ */}
      <Dialog open={buildNameDialogOpen} onOpenChange={setBuildNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ビルド名を入力</DialogTitle>
            <DialogDescription>
              保存するビルドの名前を入力してください
            </DialogDescription>
          </DialogHeader>
          <Input
            value={pendingBuildName}
            onChange={(e) => setPendingBuildName(e.target.value)}
            placeholder="ビルド名を入力"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && pendingBuildName.trim()) {
                handleSaveBuildWithName()
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBuildNameDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSaveBuildWithName}
              disabled={!pendingBuildName.trim()}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
