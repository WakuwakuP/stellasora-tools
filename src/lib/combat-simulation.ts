import {
  type CombatAction,
  type CombatSimulationResult,
  type EffectInfo,
} from 'types/buildScore'

/**
 * 戦闘シミュレーションモジュール
 *
 * 120秒間の戦闘をシミュレートし、各効果のアップタイムカバレッジを計算する
 */

/** シミュレーション時間（秒） */
const SIMULATION_DURATION = 120

/** 通常攻撃の間隔（秒） */
const NORMAL_ATTACK_INTERVAL = 0.5

/** スキルの実行時間（秒） */
const SKILL_DURATION = 1

/** 必殺技の実行時間（秒） */
const ULTIMATE_DURATION = 3

/** 必殺技の発動タイミング（秒） */
const ULTIMATE_TIMING = 60

/**
 * 主力スキルの定義
 * 実際のゲームデータに基づいて調整が必要
 */
interface MainSkill {
  name: string
  cooldown: number
  duration: number
}

/**
 * 効果の稼働状態を追跡
 */
interface EffectUptime {
  /** 効果名 */
  name: string
  /** 稼働時間の合計（秒） */
  totalUptime: number
  /** 現在の稼働開始時刻（稼働中の場合） */
  currentStart?: number
  /** 次回発動可能時刻 */
  nextAvailableTime: number
  /** スタック数 */
  stacks: number
}

/**
 * 戦闘シミュレーションを実行する
 *
 * @param effects - 効果情報のリスト
 * @param mainSkills - 主力スキルのリスト（クールダウン毎に撃つ）
 * @returns シミュレーション結果
 */
export function simulateCombat(
  effects: EffectInfo[],
  mainSkills: MainSkill[] = [],
): CombatSimulationResult {
  const actions: CombatAction[] = []
  const effectUptimes = new Map<string, EffectUptime>()

  // 効果の稼働状態を初期化
  for (const effect of effects) {
    effectUptimes.set(effect.name, {
      name: effect.name,
      nextAvailableTime: 0,
      stacks: 0,
      totalUptime: 0,
    })
  }

  let currentTime = 0
  const nextSkillTimes: number[] = mainSkills.map(() => 0)
  let nextNormalAttackTime = 0
  let ultimateUsed = false

  // 120秒間のシミュレーション
  while (currentTime < SIMULATION_DURATION) {
    // 必殺技の判定（60秒時点）
    if (!ultimateUsed && currentTime >= ULTIMATE_TIMING) {
      actions.push({
        duration: ULTIMATE_DURATION,
        name: '必殺技',
        time: currentTime,
        type: 'ultimate',
      })
      currentTime += ULTIMATE_DURATION
      ultimateUsed = true

      // 必殺技に関連する効果を発動
      activateEffects(effects, effectUptimes, currentTime, 'ultimate')
      continue
    }

    // 主力スキルの判定
    let skillUsed = false
    for (let i = 0; i < mainSkills.length; i++) {
      const skill = mainSkills[i]
      if (currentTime >= nextSkillTimes[i]) {
        actions.push({
          duration: skill.duration,
          name: skill.name,
          time: currentTime,
          type: 'skill',
        })
        currentTime += skill.duration
        nextSkillTimes[i] = currentTime + skill.cooldown
        skillUsed = true

        // スキルに関連する効果を発動
        activateEffects(effects, effectUptimes, currentTime, 'skill')
        break
      }
    }

    if (skillUsed) {
      continue
    }

    // 通常攻撃
    if (currentTime >= nextNormalAttackTime) {
      actions.push({
        duration: NORMAL_ATTACK_INTERVAL,
        name: '通常攻撃',
        time: currentTime,
        type: 'normal_attack',
      })

      // 通常攻撃に関連する効果を発動
      activateEffects(effects, effectUptimes, currentTime, 'normal_attack')

      nextNormalAttackTime = currentTime + NORMAL_ATTACK_INTERVAL
      currentTime = nextNormalAttackTime
    } else {
      currentTime += 0.1 // 時間を進める
    }
  }

  // 最終的な稼働時間を計算
  for (const uptimeData of effectUptimes.values()) {
    if (uptimeData.currentStart !== undefined) {
      uptimeData.totalUptime += SIMULATION_DURATION - uptimeData.currentStart
    }
  }

  // 稼働率を計算
  const effectUptime: Record<string, number> = {}
  for (const [name, uptimeData] of effectUptimes.entries()) {
    effectUptime[name] = uptimeData.totalUptime / SIMULATION_DURATION
  }

  return {
    actions,
    duration: SIMULATION_DURATION,
    effectUptime,
    totalDamage: 0, // ダメージ計算は別途実装
  }
}

/**
 * 効果を発動する
 */
function activateEffects(
  effects: EffectInfo[],
  effectUptimes: Map<string, EffectUptime>,
  currentTime: number,
  actionType: 'normal_attack' | 'skill' | 'ultimate',
): void {
  for (const effect of effects) {
    const uptimeData = effectUptimes.get(effect.name)
    if (!uptimeData) continue

    // 常時発動の効果
    if (effect.cooldown === 0 && effect.uptime === 999999) {
      if (uptimeData.currentStart === undefined) {
        uptimeData.currentStart = currentTime
      }
      continue
    }

    // クールダウン中の場合はスキップ
    if (currentTime < uptimeData.nextAvailableTime) {
      continue
    }

    // アクションタイプに応じて効果を発動
    const shouldActivate = shouldActivateEffect(effect, actionType)
    if (!shouldActivate) continue

    // 効果を発動
    if (uptimeData.currentStart === undefined) {
      uptimeData.currentStart = currentTime
    }

    // スタックを増やす
    if (uptimeData.stacks < effect.maxStacks) {
      uptimeData.stacks += 1
    }

    // 効果が終了する時刻を計算
    const endTime = currentTime + effect.uptime

    // 稼働時間を記録
    uptimeData.totalUptime += effect.uptime
    uptimeData.currentStart = undefined

    // 次回発動可能時刻を更新
    uptimeData.nextAvailableTime = currentTime + effect.cooldown
  }
}

/**
 * 効果を発動すべきかを判定
 */
function shouldActivateEffect(
  effect: EffectInfo,
  actionType: 'normal_attack' | 'skill' | 'ultimate',
): boolean {
  // 効果の種類に応じて判定
  switch (effect.type) {
    case 'damage_normal_attack':
      return actionType === 'normal_attack'
    case 'damage_skill':
      return actionType === 'skill'
    case 'damage_ultimate':
      return actionType === 'ultimate'
    case 'damage_increase':
    case 'damage_elemental':
    case 'damage_mark':
    case 'damage_additional':
    case 'atk_increase':
    case 'speed_increase':
    case 'cooldown_reduction':
    case 'crit_rate':
    case 'crit_damage':
    case 'damage_taken_increase':
    case 'def_decrease':
      // これらの効果は全てのアクションで発動可能
      return true
    default:
      return false
  }
}
