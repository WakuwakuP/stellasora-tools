import { describe, expect, it } from 'vitest'

import {
  buildFromPath,
  buildToPath,
  decodeTalents,
  encodeTalents,
  validateBuild,
  CORE_TALENTS_COUNT,
  MAX_CORE_SELECTED,
  MAX_SUB_MAIN,
  MAX_SUB_SUPPORT,
  SUB_TALENTS_COUNT,
} from './build-encoder-v2'
import type { Build } from 'types/build'

describe('build-encoder-v2', () => {
  describe('encodeTalents and decodeTalents', () => {
    it('should encode and decode empty talents', () => {
      const build: Build = {
        lossRecord: { main: [0, 0, 0], sub: [0, 0, 0] },
        main: {
          name: 'キャラ1',
          talents: { core: [], sub: [] },
        },
        supports: [
          { name: 'キャラ2', talents: { core: [], sub: [] } },
          { name: 'キャラ3', talents: { core: [], sub: [] } },
        ],
      }

      const encoded = encodeTalents(build)
      const [mainTalents, support0Talents, support1Talents] =
        decodeTalents(encoded)

      expect(mainTalents.core).toEqual([])
      expect(mainTalents.sub).toEqual([])
      expect(support0Talents.core).toEqual([])
      expect(support0Talents.sub).toEqual([])
      expect(support1Talents.core).toEqual([])
      expect(support1Talents.sub).toEqual([])
    })

    it('should encode and decode talents with data', () => {
      const build: Build = {
        lossRecord: { main: [0, 0, 0], sub: [0, 0, 0] },
        main: {
          name: 'キャラ1',
          talents: {
            core: [
              { id: 0, level: 5 },
              { id: 2, level: 3 },
            ],
            sub: [
              { id: 0, level: 2 },
              { id: 5, level: 6 },
            ],
          },
        },
        supports: [
          {
            name: 'キャラ2',
            talents: {
              core: [{ id: 1, level: 4 }],
              sub: [{ id: 3, level: 1 }],
            },
          },
          {
            name: 'キャラ3',
            talents: { core: [], sub: [{ id: 11, level: 6 }] },
          },
        ],
      }

      const encoded = encodeTalents(build)
      const [mainTalents, support0Talents, support1Talents] =
        decodeTalents(encoded)

      // Main character talents
      expect(mainTalents.core).toEqual(build.main.talents.core)
      expect(mainTalents.sub).toEqual(build.main.talents.sub)

      // Support 0 talents
      expect(support0Talents.core).toEqual(build.supports[0].talents.core)
      expect(support0Talents.sub).toEqual(build.supports[0].talents.sub)

      // Support 1 talents
      expect(support1Talents.core).toEqual(build.supports[1].talents.core)
      expect(support1Talents.sub).toEqual(build.supports[1].talents.sub)
    })

    it('should produce URL-safe characters', () => {
      const build: Build = {
        lossRecord: { main: [0, 0, 0], sub: [0, 0, 0] },
        main: {
          name: 'テスト',
          talents: {
            core: [{ id: 3, level: 6 }],
            sub: [],
          },
        },
        supports: [
          { name: 'サポート1', talents: { core: [], sub: [] } },
          { name: 'サポート2', talents: { core: [], sub: [] } },
        ],
      }

      const encoded = encodeTalents(build)
      // URL safe characters only (Base64URL)
      expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
    })
  })

  describe('buildFromPath and buildToPath', () => {
    it('should create build from path and back', () => {
      const build: Build = {
        lossRecord: { main: [0, 0, 0], sub: [0, 0, 0] },
        main: {
          name: 'メインキャラ',
          talents: {
            core: [{ id: 0, level: 5 }],
            sub: [{ id: 0, level: 3 }],
          },
        },
        supports: [
          {
            name: 'サポ1',
            talents: { core: [], sub: [] },
          },
          {
            name: 'サポ2',
            talents: { core: [{ id: 1, level: 2 }], sub: [] },
          },
        ],
      }

      const path = buildToPath(build)
      const pathParts = path.split('/').filter(Boolean)

      expect(pathParts.length).toBe(4)

      const reconstructed = buildFromPath(
        pathParts[0],
        pathParts[1],
        pathParts[2],
        pathParts[3],
      )

      expect(reconstructed.main.name).toBe(build.main.name)
      expect(reconstructed.supports[0].name).toBe(build.supports[0].name)
      expect(reconstructed.supports[1].name).toBe(build.supports[1].name)
      expect(reconstructed.main.talents).toEqual(build.main.talents)
      expect(reconstructed.supports[0].talents).toEqual(
        build.supports[0].talents,
      )
      expect(reconstructed.supports[1].talents).toEqual(
        build.supports[1].talents,
      )
    })
  })

  describe('validateBuild', () => {
    it('should validate a correct build', () => {
      const build: Build = {
        lossRecord: { main: [0, 0, 0], sub: [0, 0, 0] },
        main: {
          name: 'メイン',
          talents: {
            core: [
              { id: 0, level: 5 },
              { id: 1, level: 3 },
            ],
            sub: [
              { id: 0, level: 2 },
              { id: 1, level: 4 },
              { id: 2, level: 6 },
              { id: 3, level: 1 },
              { id: 4, level: 3 },
              { id: 5, level: 5 },
            ],
          },
        },
        supports: [
          {
            name: 'サポ1',
            talents: {
              core: [{ id: 0, level: 4 }],
              sub: [
                { id: 0, level: 1 },
                { id: 1, level: 2 },
                { id: 2, level: 3 },
                { id: 3, level: 4 },
                { id: 4, level: 5 },
              ],
            },
          },
          {
            name: 'サポ2',
            talents: { core: [], sub: [] },
          },
        ],
      }

      const result = validateBuild(build)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject missing character names', () => {
      const build: Build = {
        lossRecord: { main: [0, 0, 0], sub: [0, 0, 0] },
        main: {
          name: '',
          talents: { core: [], sub: [] },
        },
        supports: [
          { name: 'サポ1', talents: { core: [], sub: [] } },
          { name: '', talents: { core: [], sub: [] } },
        ],
      }

      const result = validateBuild(build)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('主力キャラクター名が必要です')
      expect(result.errors).toContain('支援2キャラクター名が必要です')
    })

    it('should reject too many core talents', () => {
      const build: Build = {
        lossRecord: { main: [0, 0, 0], sub: [0, 0, 0] },
        main: {
          name: 'メイン',
          talents: {
            core: [
              { id: 0, level: 5 },
              { id: 1, level: 3 },
              { id: 2, level: 4 },
            ],
            sub: [],
          },
        },
        supports: [
          { name: 'サポ1', talents: { core: [], sub: [] } },
          { name: 'サポ2', talents: { core: [], sub: [] } },
        ],
      }

      const result = validateBuild(build)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        `主力のコア素質は${MAX_CORE_SELECTED}個までです`,
      )
    })
  })

  describe('constants', () => {
    it('should export correct constants', () => {
      expect(CORE_TALENTS_COUNT).toBe(4)
      expect(SUB_TALENTS_COUNT).toBe(12)
      expect(MAX_CORE_SELECTED).toBe(2)
      expect(MAX_SUB_MAIN).toBe(6)
      expect(MAX_SUB_SUPPORT).toBe(5)
    })
  })
})
