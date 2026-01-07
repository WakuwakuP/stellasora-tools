/**
 * モックデータ: キャラクターとロスレコのテスト用データ
 */

export const mockCharacterDetail = {
  attackType: 'ranged',
  background: 'test-bg.png',
  description: 'テスト用キャラクター',
  element: 'Ignis',
  faction: 'Test Guild',
  grade: 4,
  icon: 'test-icon.png',
  id: 125,
  name: 'テストキャラクター',
  portrait: 'test-portrait.png',
  position: 'Vanguard',
  potentials: {
    common: [
      {
        corner: null,
        description: '全体的なダメージが&Param1&%増加する',
        icon: 'common1_icon',
        name: '共通素質1',
        params: ['5'],
        rarity: 2,
        shortDescription: '全体的なダメージが5%増加する',
        stype: 3,
      },
    ],
    mainCore: [
      {
        corner: null,
        description: '火属性ダメージが&Param1&%増加する',
        icon: 'core1_icon',
        name: 'コア素質1',
        params: ['15'],
        rarity: 4,
        shortDescription: '火属性ダメージが15%増加する',
        stype: 1,
      },
      {
        corner: null,
        description: '会心率が&Param1&%増加する',
        icon: 'core2_icon',
        name: 'コア素質2',
        params: ['10'],
        rarity: 4,
        shortDescription: '会心率が10%増加する',
        stype: 1,
      },
    ],
    mainNormal: [
      {
        corner: null,
        description: '攻撃力が&Param1&%増加する',
        icon: 'normal1_icon',
        name: '通常素質1',
        params: ['20'],
        rarity: 3,
        shortDescription: '攻撃力が20%増加する',
        stype: 2,
      },
    ],
    supportCore: [
      {
        corner: null,
        description: 'スキルダメージが&Param1&%増加する',
        icon: 'support_core1_icon',
        name: 'サポートコア1',
        params: ['12'],
        rarity: 4,
        shortDescription: 'スキルダメージが12%増加する',
        stype: 1,
      },
    ],
    supportNormal: [
      {
        corner: null,
        description: '速度が&Param1&%増加する',
        icon: 'support1_icon',
        name: 'サポート素質1',
        params: ['8'],
        rarity: 3,
        shortDescription: '速度が8%増加する',
        stype: 2,
      },
    ],
  },
  style: 'Collector',
  tags: ['Test'],
  variants: {},
}

export const mockDiscDetail = {
  element: 'Ignis',
  icon: '/stella/assets/test-disc.png',
  id: 214031,
  mainSkill: {
    description:
      '敵に&Param1&%のダメージを与え、&Param2&秒間敵の防御力を&Param3&%減少させる',
    name: 'メインスキル',
    params: [
      ['100', '5', '10'],
      ['120', '6', '12'],
      ['150', '8', '15'],
    ],
  },
  name: 'テストロスレコ',
  secondarySkills: [
    {
      description: '通常攻撃時、&Param1&%の追加ダメージを与える',
      name: 'セカンダリスキル1',
      params: [['20'], ['25'], ['30']],
      requirements: [
        [
          { name: '音符A', quantity: 2 },
          { name: '音符B', quantity: 1 },
        ],
      ],
    },
    {
      description: '必殺技のクールダウンが&Param1&%減少する',
      name: 'セカンダリスキル2',
      params: [['10'], ['12'], ['15']],
      requirements: [
        [
          { name: '音符C', quantity: 3 },
          { name: '音符D', quantity: 2 },
        ],
      ],
    },
  ],
  star: 5,
  stats: [
    [
      { name: '攻撃力', value: 100 },
      { name: 'HP', value: 500 },
    ],
    [
      { name: '攻撃力', value: 150 },
      { name: 'HP', value: 600 },
    ],
    [
      { name: '攻撃力', value: 200 },
      { name: 'HP', value: 700 },
    ],
  ],
  supportNote: [
    [{ name: '音符E', quantity: 1 }],
    [{ name: '音符E', quantity: 2 }],
    [{ name: '音符E', quantity: 3 }],
  ],
}

export const mockEffectInfo = [
  {
    cooldown: 0,
    maxStacks: 1,
    name: '火属性ダメージ増加',
    type: 'damage_elemental' as const,
    unit: '%' as const,
    uptime: 999999,
    value: 15,
  },
  {
    cooldown: 0,
    maxStacks: 1,
    name: '会心率増加',
    type: 'crit_rate' as const,
    unit: '%' as const,
    uptime: 999999,
    value: 10,
  },
  {
    cooldown: 0,
    maxStacks: 1,
    name: '攻撃力増加',
    type: 'atk_increase' as const,
    unit: '%' as const,
    uptime: 999999,
    value: 20,
  },
  {
    cooldown: 0,
    maxStacks: 1,
    name: 'スキルダメージ増加',
    type: 'damage_skill' as const,
    unit: '%' as const,
    uptime: 999999,
    value: 12,
  },
  {
    cooldown: 15,
    maxStacks: 1,
    name: '防御力減少デバフ',
    type: 'def_decrease' as const,
    unit: '%' as const,
    uptime: 8,
    value: 15,
  },
  {
    cooldown: 0,
    maxStacks: 1,
    name: '追加ダメージ',
    type: 'damage_additional' as const,
    unit: '%' as const,
    uptime: 999999,
    value: 30,
  },
]
