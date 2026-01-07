'use client'

import type { BuildEvaluationMetrics } from 'types/damage-calculation'
import type { FC } from 'react'

interface BuildEvaluationDisplayProps {
	metrics: BuildEvaluationMetrics | null
	isCalculating?: boolean
	calculationDetails?: CalculationDetails | null
}

export type { BuildEvaluationDisplayProps }

/**
 * 計算の詳細情報（実際の数値を表示するため）
 */
export interface CalculationDetails {
	atk?: number
	baselineAtk?: number
	critRate?: number
	critDmg?: number
	dps?: number
	baselineDps?: number
	damageBonusTotal?: number
	defPenValue?: number
	buffs?: Array<{
		type: string
		amount: number
		duration: number
		cooldown: number
		uptime: number
	}>
}

/**
 * ビルド評価スコアを表示するコンポーネント
 */
export const BuildEvaluationDisplay: FC<BuildEvaluationDisplayProps> = ({
	calculationDetails,
	isCalculating = false,
	metrics,
}) => {
	if (isCalculating) {
		return (
			<div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-3 dark:from-purple-950 dark:to-pink-950">
				<div className="flex items-center gap-2">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
					<span className="text-sm text-purple-600 dark:text-purple-300">
						評価計算中...
					</span>
				</div>
			</div>
		)
	}

	if (!metrics) {
		return (
			<div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
				<div className="text-center text-sm text-slate-500 dark:text-slate-400">
					キャラクターを選択すると評価が表示されます
				</div>
			</div>
		)
	}

	// スコアに応じた色を返す関数
	const getScoreColor = (score: number): string => {
		if (score >= 80) return 'text-green-600 dark:text-green-400'
		if (score >= 60) return 'text-blue-600 dark:text-blue-400'
		if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
		return 'text-orange-600 dark:text-orange-400'
	}

	// スコアバーの背景色
	const getScoreBarColor = (score: number): string => {
		if (score >= 80) return 'bg-green-500'
		if (score >= 60) return 'bg-blue-500'
		if (score >= 40) return 'bg-yellow-500'
		return 'bg-orange-500'
	}

	// スコアアイコン
	const getScoreIcon = (score: number): string => {
		if (score >= 80) return '🌟'
		if (score >= 60) return '⭐'
		if (score >= 40) return '✨'
		return '💫'
	}

	return (
		<div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-3 dark:from-purple-950 dark:to-pink-950">
			<h4 className="mb-3 flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300">
				<span className="text-lg">📊</span>
				ビルド評価
			</h4>

			{/* 総合スコア */}
			<div className="mb-3 rounded-lg bg-white p-3 dark:bg-slate-800">
				<div className="mb-2 flex items-center justify-between">
					<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
						総合スコア
					</span>
					<span className={`text-2xl font-bold ${getScoreColor(metrics.totalScore)}`}>
						{getScoreIcon(metrics.totalScore)} {metrics.totalScore.toFixed(1)}
					</span>
				</div>
				<div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
					<div
						className={`h-full transition-all duration-500 ${getScoreBarColor(metrics.totalScore)}`}
						style={{ width: `${Math.min(metrics.totalScore, 100)}%` }}
					/>
				</div>
			</div>

			{/* 個別スコア */}
			<div className="space-y-2">
				<ScoreItem
					formula={getAttackFormula(calculationDetails)}
					icon="⚔️"
					label="攻撃力"
					score={metrics.attackScore}
				/>
				<ScoreItem
					formula={getCritEfficiencyFormula(calculationDetails)}
					icon="💥"
					label="会心効率"
					score={metrics.critEfficiencyScore}
				/>
				<ScoreItem
					formula={getElementalDamageFormula(calculationDetails)}
					icon="✨"
					label="属性ダメージ"
					score={metrics.elementalDamageScore}
				/>
				<ScoreItem
					formula={getDpsFormula(calculationDetails)}
					icon="⚡"
					label="DPS"
					score={metrics.dpsScore}
				/>
				<ScoreItem
					formula={getBuffUptimeFormula(calculationDetails)}
					icon="🔥"
					label="バフ稼働率"
					score={metrics.buffUptimeScore}
				/>
			</div>
		</div>
	)
}

/**
 * 攻撃力スコアの計算式を生成
 */
function getAttackFormula(details?: CalculationDetails | null): string {
	if (!details?.atk) {
		return '(ATK / 基準ATK) × 50\n基準ATK = 3000\n2倍で100点'
	}
	const baselineAtk = details.baselineAtk || 3000
	const ratio = details.atk / baselineAtk
	const score = Math.min(ratio * 50, 100)
	return `(${details.atk} / ${baselineAtk}) × 50\n= ${ratio.toFixed(3)} × 50\n= ${score.toFixed(1)}点`
}

/**
 * 会心効率スコアの計算式を生成
 */
function getCritEfficiencyFormula(details?: CalculationDetails | null): string {
	if (!details?.critRate || !details?.critDmg) {
		return '基本 = (会心率 × 会心ダメージ / 0.5) / 1.5 × 100\n会心率100%超過: 1%毎に-0.5点\n理想値: 会心率50% × 会心ダメージ100%'
	}
	const critRatePercent = (details.critRate * 100).toFixed(1)
	const critDmgPercent = (details.critDmg * 100).toFixed(1)
	const critValue = details.critRate * details.critDmg
	const idealValue = 0.5 * 1.0
	const baseScore = ((critValue / idealValue) / 1.5) * 100
	
	let formula = `(${critRatePercent}% × ${critDmgPercent}% / 50%) / 1.5 × 100\n`
	formula += `= (${critValue.toFixed(3)} / 0.5) / 1.5 × 100\n`
	formula += `= ${baseScore.toFixed(1)}点`
	
	if (details.critRate > 1) {
		const excess = ((details.critRate - 1) * 100).toFixed(1)
		const penalty = (details.critRate - 1) * 50
		formula += `\n\n会心率超過ペナルティ:\n${excess}% × 0.5 = -${penalty.toFixed(1)}点`
		formula += `\n最終スコア: ${(baseScore - penalty).toFixed(1)}点`
	}
	
	return formula
}

/**
 * 属性ダメージスコアの計算式を生成
 */
function getElementalDamageFormula(details?: CalculationDetails | null): string {
	if (!details?.damageBonusTotal && !details?.defPenValue) {
		return '(ダメージボーナス合計 + 防御貫通価値) / 150 × 100\n防御%無視 × 200 + 固定貫通 / 10'
	}
	const bonusTotal = details.damageBonusTotal || 0
	const penValue = details.defPenValue || 0
	const totalValue = bonusTotal + penValue
	const score = Math.min((totalValue / 150) * 100, 100)
	return `(${bonusTotal.toFixed(1)} + ${penValue.toFixed(1)}) / 150 × 100\n= ${totalValue.toFixed(1)} / 150 × 100\n= ${score.toFixed(1)}点`
}

/**
 * DPSスコアの計算式を生成
 */
function getDpsFormula(details?: CalculationDetails | null): string {
	if (!details?.dps) {
		return '(DPS / 基準DPS) × 50\n基準DPS = 5000\n2倍で100点'
	}
	const baselineDps = details.baselineDps || 5000
	const ratio = details.dps / baselineDps
	const score = Math.min(ratio * 50, 100)
	return `(${details.dps.toFixed(1)} / ${baselineDps}) × 50\n= ${ratio.toFixed(3)} × 50\n= ${score.toFixed(1)}点`
}

/**
 * バフ稼働率スコアの計算式を生成
 */
function getBuffUptimeFormula(details?: CalculationDetails | null): string {
	if (!details?.buffs || details.buffs.length === 0) {
		return '各バフタイプ毎: Σ(バフ量 × 稼働率)\n稼働率 = 継続時間 / (継続時間 + CD)\n攻撃力50%=50点, ダメージ100%=30点, 会心系=20点'
	}
	
	let formula = '各バフの稼働率計算:\n\n'
	for (const buff of details.buffs) {
		const uptimePercent = (buff.uptime * 100).toFixed(1)
		const contribution = buff.amount * buff.uptime
		formula += `${buff.type}: ${buff.amount}% × ${uptimePercent}% = ${contribution.toFixed(1)}\n`
		formula += `  (${buff.duration}s / (${buff.duration}s + ${buff.cooldown}s))\n`
	}
	
	return formula.trim()
}

interface ScoreItemProps {
	icon: string
	label: string
	score: number
	formula?: string
}

const ScoreItem: FC<ScoreItemProps> = ({ formula, icon, label, score }) => {
	const getScoreBarColor = (score: number): string => {
		if (score >= 80) return 'bg-green-500'
		if (score >= 60) return 'bg-blue-500'
		if (score >= 40) return 'bg-yellow-500'
		return 'bg-orange-500'
	}

	return (
		<div className="group relative rounded bg-white p-2 dark:bg-slate-800">
			<div className="mb-1 flex items-center justify-between">
				<span className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
					<span>{icon}</span>
					{label}
				</span>
				<span className="text-xs font-bold text-slate-700 dark:text-slate-200">
					{score.toFixed(1)}
				</span>
			</div>
			<div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
				<div
					className={`h-full transition-all duration-500 ${getScoreBarColor(score)}`}
					style={{ width: `${Math.min(score, 100)}%` }}
				/>
			</div>
			{formula && (
				<div className="absolute bottom-full left-0 z-10 mb-1 hidden w-full min-w-[200px] rounded bg-slate-800 p-2 text-xs text-white shadow-lg group-hover:block dark:bg-slate-700">
					<div className="font-bold">計算式:</div>
					<div className="mt-1 whitespace-pre-wrap font-mono text-[10px]">
						{formula}
					</div>
				</div>
			)}
		</div>
	)
}
