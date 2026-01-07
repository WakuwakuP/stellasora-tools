'use client'

import type { BuildEvaluationMetrics } from 'types/damage-calculation'
import type { FC } from 'react'

interface BuildEvaluationDisplayProps {
	metrics: BuildEvaluationMetrics | null
	isCalculating?: boolean
}

export type { BuildEvaluationDisplayProps }

/**
 * ビルド評価スコアを表示するコンポーネント
 */
export const BuildEvaluationDisplay: FC<BuildEvaluationDisplayProps> = ({
	metrics,
	isCalculating = false,
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
					formula="(ATK / 基準ATK) × 50\n基準ATK = 3000\n2倍で100点"
					icon="⚔️"
					label="攻撃力"
					score={metrics.attackScore}
				/>
				<ScoreItem
					formula="基本 = (会心率 × 会心ダメージ / 0.5) / 1.5 × 100\n会心率100%超過: 1%毎に-0.5点\n理想値: 会心率50% × 会心ダメージ100%"
					icon="💥"
					label="会心効率"
					score={metrics.critEfficiencyScore}
				/>
				<ScoreItem
					formula="(ダメージボーナス合計 + 防御貫通価値) / 150 × 100\n防御%無視 × 200 + 固定貫通 / 10"
					icon="✨"
					label="属性ダメージ"
					score={metrics.elementalDamageScore}
				/>
				<ScoreItem
					formula="(DPS / 基準DPS) × 50\n基準DPS = 5000\n2倍で100点"
					icon="⚡"
					label="DPS"
					score={metrics.dpsScore}
				/>
				<ScoreItem
					formula="各バフタイプ毎: Σ(バフ量 × 稼働率)\n稼働率 = 継続時間 / (継続時間 + CD)\n攻撃力50%=50点, ダメージ100%=30点, 会心系=20点"
					icon="🔥"
					label="バフ稼働率"
					score={metrics.buffUptimeScore}
				/>
			</div>
		</div>
	)
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
