import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type GoogleGenerativeAI } from '@google/generative-ai'

// unstable_cacheのモック（キャッシュを無効化してテストを実行）
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}))

describe('Gemini Effect Parser', () => {
  const mockGenerateContent = vi.fn()
  let mockGenAI: GoogleGenerativeAI

  beforeEach(() => {
    vi.clearAllMocks()

    // モッククライアントを作成
    mockGenAI = {
      getGenerativeModel: vi.fn(() => ({
        generateContent: mockGenerateContent,
      })),
    } as unknown as GoogleGenerativeAI
  })

  describe('convertToEffectInfo', () => {
    it('スキル説明を効果情報に変換できる', async () => {
      // モックレスポンス
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify([
              {
                name: '火属性ダメージ増加',
                type: 'damage_elemental',
                value: 15,
                unit: '%',
                uptime: 999999,
                cooldown: 0,
                maxStacks: 1,
              },
            ]),
        },
      })

      const { convertToEffectInfo } = await import('lib/gemini-effect-parser')

      const result = await convertToEffectInfo(
        'テストキャラクター',
        'Ignis',
        [
          {
            name: 'コア素質1',
            description: '火属性ダメージが15%増加する',
          },
        ],
        mockGenAI,
      )

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('火属性ダメージ増加')
      expect(result[0].type).toBe('damage_elemental')
      expect(result[0].value).toBe(15)
    })

    it('複数の効果を含む説明を変換できる', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify([
              {
                name: '攻撃力増加',
                type: 'atk_increase',
                value: 20,
                unit: '%',
                uptime: 999999,
                cooldown: 0,
                maxStacks: 1,
              },
              {
                name: '会心率増加',
                type: 'crit_rate',
                value: 10,
                unit: '%',
                uptime: 999999,
                cooldown: 0,
                maxStacks: 1,
              },
            ]),
        },
      })

      const { convertToEffectInfo } = await import(
        'lib/gemini-effect-parser'
      )

      const result = await convertToEffectInfo(
        'テストキャラクター',
        'Ignis',
        [
          {
            name: '複合素質',
            description: '攻撃力が20%増加し、会心率が10%増加する',
          },
        ],
        mockGenAI,
      )

      expect(result).toHaveLength(2)
    })

    it('JSON形式がコードブロックで囲まれている場合も正しく解析できる', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => `\`\`\`json
[
  {
    "name": "スキルダメージ増加",
    "type": "damage_skill",
    "value": 12,
    "unit": "%",
    "uptime": 999999,
    "cooldown": 0,
    "maxStacks": 1
  }
]
\`\`\``,
        },
      })

      const { convertToEffectInfo } = await import(
        'lib/gemini-effect-parser'
      )

      const result = await convertToEffectInfo(
        'テストキャラクター',
        'Ignis',
        [
          {
            name: 'スキル素質',
            description: 'スキルダメージが12%増加する',
          },
        ],
        mockGenAI,
      )

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('スキルダメージ増加')
    })

    it('API呼び出しが失敗した場合にエラーをスローする', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'))

      const { convertToEffectInfo } = await import(
        'lib/gemini-effect-parser'
      )

      await expect(
        convertToEffectInfo(
          'テストキャラクター',
          'Ignis',
          [{ name: 'テスト', description: 'テスト説明' }],
          mockGenAI,
        ),
      ).rejects.toThrow('効果情報の変換に失敗しました')
    })

    it('無効なJSONレスポンスの場合にエラーをスローする', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Invalid JSON',
        },
      })

      const { convertToEffectInfo } = await import(
        'lib/gemini-effect-parser'
      )

      await expect(
        convertToEffectInfo(
          'テストキャラクター',
          'Ignis',
          [{ name: 'テスト', description: 'テスト説明' }],
          mockGenAI,
        ),
      ).rejects.toThrow()
    })
  })

  describe('convertTalentsToEffectInfo', () => {
    it('素質情報を効果情報に変換できる', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify([
              {
                name: '全体ダメージ増加',
                type: 'damage_increase',
                value: 5,
                unit: '%',
                uptime: 999999,
                cooldown: 0,
                maxStacks: 1,
              },
            ]),
        },
      })

      const { convertTalentsToEffectInfo } = await import(
        'lib/gemini-effect-parser'
      )

      const result = await convertTalentsToEffectInfo(
        'テストキャラクター',
        'Ignis',
        [
          {
            name: '共通素質',
            description: '全体的なダメージが5%増加する',
          },
        ],
        mockGenAI,
      )

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('damage_increase')
    })
  })

  describe('convertDiscSkillsToEffectInfo', () => {
    it('ロスレコスキル情報を効果情報に変換できる', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify([
              {
                name: '防御力減少',
                type: 'def_decrease',
                value: 15,
                unit: '%',
                uptime: 8,
                cooldown: 15,
                maxStacks: 1,
              },
            ]),
        },
      })

      const { convertDiscSkillsToEffectInfo } = await import(
        'lib/gemini-effect-parser'
      )

      const result = await convertDiscSkillsToEffectInfo(
        'テストロスレコ',
        'Ignis',
        [
          {
            name: 'メインスキル',
            description: '8秒間敵の防御力を15%減少させる',
          },
        ],
        mockGenAI,
      )

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('def_decrease')
      expect(result[0].uptime).toBe(8)
      expect(result[0].cooldown).toBe(15)
    })
  })

  describe('GEMINI_API_KEYが設定されていない場合', () => {
    it('警告を表示する', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      delete process.env.GEMINI_API_KEY

      // モジュールを再読み込み
      vi.resetModules()
      await import('lib/gemini-effect-parser')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'GEMINI_API_KEY is not set. LLM features will not be available.',
      )

      consoleWarnSpy.mockRestore()
    })
  })
})
