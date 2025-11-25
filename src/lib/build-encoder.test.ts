import { describe, expect, it } from 'vitest'

import {
  decodeBuild,
  encodeBuild,
  validateBuild,
  CORE_TALENTS_COUNT,
  MAX_CORE_SELECTED,
  MAX_SUB_MAIN,
  MAX_SUB_SUPPORT,
  MAIN_LOSS_RECORD_COUNT,
  SUB_LOSS_RECORD_COUNT,
  SUB_TALENTS_COUNT,
} from './build-encoder'
import { type Build } from 'types/build'

describe('build-encoder', () => {
  describe('encodeBuild and decodeBuild', () => {
    it('should encode and decode a minimal build', () => {
      const build: Build = {
        main: {
          id: 0,
          talents: {
            core: [],
            sub: [],
          },
        },
        supports: [
          {
            id: 1,
            talents: {
              core: [],
              sub: [],
            },
          },
          {
            id: 2,
            talents: {
              core: [],
              sub: [],
            },
          },
        ],
        lossRecord: {
          main: [0, 1, 2],
          sub: [3, 4, 5],
        },
      }

      const encoded = encodeBuild(build)
      const decoded = decodeBuild(encoded)

      expect(decoded.main.id).toBe(build.main.id)
      expect(decoded.supports[0].id).toBe(build.supports[0].id)
      expect(decoded.supports[1].id).toBe(build.supports[1].id)
      expect(decoded.lossRecord.main).toEqual(build.lossRecord.main)
      expect(decoded.lossRecord.sub).toEqual(build.lossRecord.sub)
    })

    it('should encode and decode a build with talents', () => {
      const build: Build = {
        main: {
          id: 10,
          talents: {
            core: [
              { id: 0, level: 6 },
              { id: 2, level: 3 },
            ],
            sub: [
              { id: 0, level: 5 },
              { id: 3, level: 4 },
              { id: 7, level: 6 },
            ],
          },
        },
        supports: [
          {
            id: 20,
            talents: {
              core: [{ id: 1, level: 4 }],
              sub: [
                { id: 2, level: 2 },
                { id: 5, level: 3 },
              ],
            },
          },
          {
            id: 30,
            talents: {
              core: [],
              sub: [{ id: 11, level: 1 }],
            },
          },
        ],
        lossRecord: {
          main: [10, 20, 30],
          sub: [40, 50, 60],
        },
      }

      const encoded = encodeBuild(build)
      const decoded = decodeBuild(encoded)

      // Main character
      expect(decoded.main.id).toBe(build.main.id)
      expect(decoded.main.talents.core).toEqual(build.main.talents.core)
      expect(decoded.main.talents.sub).toEqual(build.main.talents.sub)

      // Support 1
      expect(decoded.supports[0].id).toBe(build.supports[0].id)
      expect(decoded.supports[0].talents.core).toEqual(
        build.supports[0].talents.core,
      )
      expect(decoded.supports[0].talents.sub).toEqual(
        build.supports[0].talents.sub,
      )

      // Support 2
      expect(decoded.supports[1].id).toBe(build.supports[1].id)
      expect(decoded.supports[1].talents.core).toEqual(
        build.supports[1].talents.core,
      )
      expect(decoded.supports[1].talents.sub).toEqual(
        build.supports[1].talents.sub,
      )

      // Loss record
      expect(decoded.lossRecord.main).toEqual(build.lossRecord.main)
      expect(decoded.lossRecord.sub).toEqual(build.lossRecord.sub)
    })

    it('should produce URL-safe characters', () => {
      const build: Build = {
        main: {
          id: 255,
          talents: {
            core: [{ id: 3, level: 6 }],
            sub: [],
          },
        },
        supports: [
          {
            id: 128,
            talents: { core: [], sub: [] },
          },
          {
            id: 64,
            talents: { core: [], sub: [] },
          },
        ],
        lossRecord: {
          main: [100, 200, 300],
          sub: [400, 500, 600],
        },
      }

      const encoded = encodeBuild(build)

      // URL safe characters only (Base64URL + delimiters: _, -, .)
      expect(encoded).toMatch(/^[A-Za-z0-9_.-]+$/)
    })
  })

  describe('validateBuild', () => {
    it('should validate a correct build', () => {
      const build: Build = {
        main: {
          id: 1,
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
            id: 2,
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
            id: 3,
            talents: {
              core: [],
              sub: [],
            },
          },
        ],
        lossRecord: {
          main: [0, 1, 2],
          sub: [3, 4, 5],
        },
      }

      const result = validateBuild(build)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject too many core talents for main', () => {
      const build: Build = {
        main: {
          id: 1,
          talents: {
            core: [
              { id: 0, level: 5 },
              { id: 1, level: 3 },
              { id: 2, level: 4 }, // Too many
            ],
            sub: [],
          },
        },
        supports: [
          { id: 2, talents: { core: [], sub: [] } },
          { id: 3, talents: { core: [], sub: [] } },
        ],
        lossRecord: {
          main: [0, 1, 2],
          sub: [3, 4, 5],
        },
      }

      const result = validateBuild(build)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        `主力のコア素質は${MAX_CORE_SELECTED}個までです`,
      )
    })

    it('should reject too many sub talents for main', () => {
      const build: Build = {
        main: {
          id: 1,
          talents: {
            core: [],
            sub: [
              { id: 0, level: 1 },
              { id: 1, level: 1 },
              { id: 2, level: 1 },
              { id: 3, level: 1 },
              { id: 4, level: 1 },
              { id: 5, level: 1 },
              { id: 6, level: 1 }, // Too many
            ],
          },
        },
        supports: [
          { id: 2, talents: { core: [], sub: [] } },
          { id: 3, talents: { core: [], sub: [] } },
        ],
        lossRecord: {
          main: [0, 1, 2],
          sub: [3, 4, 5],
        },
      }

      const result = validateBuild(build)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        `主力のサブ素質は${MAX_SUB_MAIN}個までです`,
      )
    })

    it('should reject too many sub talents for support', () => {
      const build: Build = {
        main: {
          id: 1,
          talents: { core: [], sub: [] },
        },
        supports: [
          {
            id: 2,
            talents: {
              core: [],
              sub: [
                { id: 0, level: 1 },
                { id: 1, level: 1 },
                { id: 2, level: 1 },
                { id: 3, level: 1 },
                { id: 4, level: 1 },
                { id: 5, level: 1 }, // Too many
              ],
            },
          },
          { id: 3, talents: { core: [], sub: [] } },
        ],
        lossRecord: {
          main: [0, 1, 2],
          sub: [3, 4, 5],
        },
      }

      const result = validateBuild(build)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        `支援1のサブ素質は${MAX_SUB_SUPPORT}個までです`,
      )
    })

    it('should reject wrong number of loss records', () => {
      const build: Build = {
        main: {
          id: 1,
          talents: { core: [], sub: [] },
        },
        supports: [
          { id: 2, talents: { core: [], sub: [] } },
          { id: 3, talents: { core: [], sub: [] } },
        ],
        lossRecord: {
          main: [0, 1], // Too few
          sub: [3, 4, 5],
        },
      }

      const result = validateBuild(build)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        `メインロスレコは${MAIN_LOSS_RECORD_COUNT}個必要です`,
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
      expect(MAIN_LOSS_RECORD_COUNT).toBe(3)
      expect(SUB_LOSS_RECORD_COUNT).toBe(3)
    })
  })
})
