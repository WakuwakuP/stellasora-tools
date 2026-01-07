/**
 * ハーモニーシステム最適化
 * 音符マッチングとサポートディスク選択の最適化
 */

import {
  type Disc,
  type DiscFilterCriteria,
  type HarmonyActivationState,
  type HarmonyOptimizationRequirement,
  type HarmonyOptimizationResult,
  type HarmonySkill,
  type NotePool,
  type NoteRequirement,
  type NoteType,
} from 'types/harmony-system'

/**
 * 音符プールを初期化
 * @returns 空の音符プール
 */
export function createEmptyNotePool(): NotePool {
  return {
    notes: {
      Aqua: 0,
      Ignis: 0,
      Lux: 0,
      Terra: 0,
      Umbra: 0,
      Ventus: 0,
    },
  }
}

/**
 * 音符プールに音符を追加
 * @param pool - 現在の音符プール
 * @param type - 音符の種類
 * @param count - 追加する数
 * @returns 更新された音符プール
 */
export function addNotesToPool(
  pool: NotePool,
  type: NoteType,
  count: number,
): NotePool {
  return {
    notes: {
      ...pool.notes,
      [type]: pool.notes[type] + count,
    },
  }
}

/**
 * ディスク構成から音符プールを計算
 * @param supportDiscs - サポートディスクのリスト
 * @returns 音符プール
 */
export function calculateNotePool(supportDiscs: Disc[]): NotePool {
  let pool = createEmptyNotePool()

  for (const disc of supportDiscs) {
    for (const noteProvision of disc.supportNotes) {
      pool = addNotesToPool(pool, noteProvision.type, noteProvision.count)
    }
  }

  return pool
}

/**
 * ハーモニースキルの発動条件を満たしているかチェック
 * @param notePool - 現在の音符プール
 * @param requirements - 必要な音符条件
 * @returns 条件を満たしているかどうか
 */
export function checkHarmonyRequirements(
  notePool: NotePool,
  requirements: NoteRequirement[],
): boolean {
  return requirements.every((req) => notePool.notes[req.type] >= req.count)
}

/**
 * ハーモニー発動状態を計算
 * @param mainDiscs - メインディスクのリスト
 * @param supportDiscs - サポートディスクのリスト
 * @returns ハーモニー発動状態
 */
export function calculateHarmonyActivation(
  mainDiscs: [Disc, Disc, Disc],
  supportDiscs: [Disc, Disc, Disc],
): HarmonyActivationState {
  const notePool = calculateNotePool(supportDiscs)
  const activeHarmonies: HarmonySkill[] = []
  const activationStatus: Record<string, boolean> = {}

  for (const disc of mainDiscs) {
    if (disc.harmonySkill) {
      const canActivate = checkHarmonyRequirements(
        notePool,
        disc.harmonySkill.requiredNotes,
      )
      activationStatus[disc.harmonySkill.id] = canActivate

      if (canActivate) {
        activeHarmonies.push(disc.harmonySkill)
      }
    }
  }

  return {
    activationStatus,
    activeHarmonies,
    notePool,
  }
}

/**
 * 最適化要件から必要な音符を抽出
 * @param mainDiscs - メインディスク
 * @returns 必要な音符の総数
 */
export function extractRequiredNotes(
  mainDiscs: [Disc, Disc, Disc],
): Record<NoteType, number> {
  const required: Record<NoteType, number> = {
    Aqua: 0,
    Ignis: 0,
    Lux: 0,
    Terra: 0,
    Umbra: 0,
    Ventus: 0,
  }

  for (const disc of mainDiscs) {
    if (disc.harmonySkill) {
      for (const req of disc.harmonySkill.requiredNotes) {
        // 重複する属性要件は最大値を採用
        required[req.type] = Math.max(required[req.type], req.count)
      }
    }
  }

  return required
}

/**
 * ディスクリストをフィルタリング
 * @param allDiscs - 全ディスクリスト
 * @param criteria - フィルタリング条件
 * @returns フィルタリングされたディスクリスト
 */
export function filterDiscs(
  allDiscs: Disc[],
  criteria: DiscFilterCriteria,
): Disc[] {
  return allDiscs.filter((disc) => {
    // レアリティチェック
    if (criteria.minRarity !== undefined && disc.rarity < criteria.minRarity) {
      return false
    }
    if (criteria.maxRarity !== undefined && disc.rarity > criteria.maxRarity) {
      return false
    }

    // 属性チェック
    const discElements = disc.supportNotes.map((note) => note.type)

    if (criteria.includeElements) {
      // 少なくとも1つの含める属性を持っているか
      const hasIncluded = discElements.some((elem) =>
        criteria.includeElements?.includes(elem),
      )
      if (!hasIncluded) return false
    }

    if (criteria.excludeElements) {
      // 除外する属性を持っていないか
      const hasExcluded = discElements.some((elem) =>
        criteria.excludeElements?.includes(elem),
      )
      if (hasExcluded) return false
    }

    return true
  })
}

/**
 * サポートディスクの最適な組み合わせを探索
 * @param requirement - 最適化要件
 * @param availableDiscs - 利用可能なディスクリスト
 * @returns 最適化結果
 */
export function optimizeSupportDiscs(
  requirement: HarmonyOptimizationRequirement,
  availableDiscs: Disc[],
): HarmonyOptimizationResult {
  const { mainDiscs, requiredNotes } = requirement

  // 必要な属性を含むディスクのみをフィルタリング
  const relevantElements = Object.entries(requiredNotes)
    .filter(([, count]) => count > 0)
    .map(([element]) => element as NoteType)

  const candidateDiscs = filterDiscs(availableDiscs, {
    includeElements: relevantElements,
  })

  let bestResult: HarmonyOptimizationResult | null = null
  let bestScore = -1

  // 3つのサポートディスクの組み合わせを評価
  // 注: 実際の実装では、より効率的なアルゴリズム（遺伝的アルゴリズムなど）を使用すべき
  for (let i = 0; i < candidateDiscs.length; i++) {
    for (let j = i; j < candidateDiscs.length; j++) {
      for (let k = j; k < candidateDiscs.length; k++) {
        const supports: [Disc, Disc, Disc] = [
          candidateDiscs[i],
          candidateDiscs[j],
          candidateDiscs[k],
        ]

        const result = evaluateSupportCombination(mainDiscs, supports)

        if (result.score > bestScore) {
          bestScore = result.score
          bestResult = result
        }
      }
    }
  }

  // 最適解が見つからない場合のフォールバック
  if (!bestResult) {
    const emptySupports: [Disc, Disc, Disc] = [
      candidateDiscs[0] || createDummyDisc(),
      candidateDiscs[0] || createDummyDisc(),
      candidateDiscs[0] || createDummyDisc(),
    ]
    return evaluateSupportCombination(mainDiscs, emptySupports)
  }

  return bestResult
}

/**
 * サポートディスクの組み合わせを評価
 * @param mainDiscs - メインディスク
 * @param supportDiscs - サポートディスク
 * @returns 評価結果
 */
function evaluateSupportCombination(
  mainDiscs: [Disc, Disc, Disc],
  supportDiscs: [Disc, Disc, Disc],
): HarmonyOptimizationResult {
  const harmonyState = calculateHarmonyActivation(mainDiscs, supportDiscs)
  const requiredNotes = extractRequiredNotes(mainDiscs)

  // 未満足の要件を計算
  const unmetRequirements: NoteRequirement[] = []
  for (const [element, requiredCount] of Object.entries(requiredNotes)) {
    const actualCount = harmonyState.notePool.notes[element as NoteType]
    if (actualCount < requiredCount) {
      unmetRequirements.push({
        count: requiredCount - actualCount,
        type: element as NoteType,
      })
    }
  }

  // スコア計算
  const activeHarmonyCount = harmonyState.activeHarmonies.length
  const totalHarmonies = mainDiscs.filter((d) => d.harmonySkill !== null).length

  // 基本スコア: 発動できたハーモニーの割合 × 100
  let score =
    totalHarmonies > 0 ? (activeHarmonyCount / totalHarmonies) * 100 : 0

  // ボーナス: 余剰音符は少しだけ価値がある
  const totalExcessNotes = Object.values(harmonyState.notePool.notes).reduce(
    (sum, count) => sum + count,
    0,
  )
  const totalRequiredNotes = Object.values(requiredNotes).reduce(
    (sum, count) => sum + count,
    0,
  )
  const excessBonus = Math.max(0, totalExcessNotes - totalRequiredNotes) * 0.1

  score += excessBonus

  return {
    activeHarmonyCount,
    finalNotePool: harmonyState.notePool,
    recommendedSupports: supportDiscs,
    score,
    unmetRequirements,
  }
}

/**
 * ダミーディスクを作成（フォールバック用）
 * @returns ダミーディスク
 */
function createDummyDisc(): Disc {
  return {
    harmonySkill: null,
    id: 'dummy',
    melodySkill: null,
    name: 'ダミーディスク',
    rarity: 3,
    supportNotes: [],
  }
}
