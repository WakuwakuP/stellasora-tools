/**
 * テスト用のモックデータ
 */

import type { ParsedEffect } from 'types/buildScore'

/**
 * モックキャラクターデータ
 */
export const mockCharacterData = {
	element: 'Water',
	id: 125,
	name: 'フリージア',
	potentials: {
		common: [
			{
				description: '基礎攻撃力が<color=#0abec5>&Param1&</color>上昇する',
				name: '攻撃力強化',
				params: ['50'],
			},
		],
		mainCore: [
			{
				description:
					'フリージアが##狂化#2014#状態時、自身の会心率が<color=#0abec5>&Param1&</color>上昇する。',
				name: '弁論と立証',
				params: ['10%'],
			},
		],
		mainNormal: [
			{
				description:
					'フリージアが敵にスキルダメージを与えるたびに、&Param1&秒間、その敵が受ける水属性ダメージを<color=#0abec5>&Param2&</color>増加させる。',
				name: '多角的な視点',
				params: ['14', '1.4%'],
			},
		],
		supportCore: [],
		supportNormal: [],
	},
}

/**
 * モックディスクデータ
 */
export const mockDiscData = {
	id: 214031,
	mainSkill: {
		description:
			'攻撃力が<color=#0abec5>&Param1&</color>、水属性ダメージが<color=#0abec5>&Param2&</color>増加する',
		name: '水属性攻撃',
		params: [['100', '5%'], ['150', '10%'], ['200', '15%']],
	},
	name: '水の音盤',
	secondarySkills: [
		{
			description:
				'必殺技のダメージが<color=#0abec5>&Param1&</color>増加する',
			name: '必殺技強化',
			params: [['15%'], ['20%'], ['25%']],
		},
	],
}

/**
 * モック解析効果
 */
export const mockParsedEffects: ParsedEffect[] = [
	{
		condition: '狂化状態時',
		duration: -1,
		maxStacks: 1,
		name: '会心率上昇',
		stackable: false,
		type: 'crit_rate',
		unit: '%',
		value: 10,
	},
	{
		condition: null,
		duration: 14,
		maxStacks: 10,
		name: '水属性ダメージ増加',
		stackable: true,
		type: 'elemental_damage',
		unit: '%',
		value: 1.4,
	},
	{
		condition: null,
		duration: -1,
		maxStacks: 1,
		name: '攻撃力増加',
		stackable: false,
		type: 'atk_increase',
		unit: '%',
		value: 15,
	},
]

/**
 * モックビルド構成
 */
export const mockBuildConfiguration = {
	characterIds: [125, 126, 127] as [number, number, number],
	discIds: [214031, 214032, 214033] as [number, number, number],
}
