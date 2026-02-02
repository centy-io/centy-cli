import { describe, expect, it } from 'vitest'
import { isPrerelease, compareVersions, isNewerVersion } from './prerelease.js'

describe('prerelease utilities', () => {
  describe('isPrerelease', () => {
    it('should return true for alpha versions', () => {
      expect(isPrerelease('0.2.0-alpha.9')).toBe(true)
    })

    it('should return true for beta versions', () => {
      expect(isPrerelease('1.0.0-beta.1')).toBe(true)
    })

    it('should return true for rc versions', () => {
      expect(isPrerelease('2.0.0-rc.1')).toBe(true)
    })

    it('should return false for stable versions', () => {
      expect(isPrerelease('1.0.0')).toBe(false)
    })

    it('should return false for simple versions', () => {
      expect(isPrerelease('0.2.0')).toBe(false)
    })
  })

  describe('compareVersions', () => {
    it('should compare major versions correctly', () => {
      expect(compareVersions('2.0.0', '1.0.0')).toBeGreaterThan(0)
      expect(compareVersions('1.0.0', '2.0.0')).toBeLessThan(0)
    })

    it('should compare minor versions correctly', () => {
      expect(compareVersions('1.2.0', '1.1.0')).toBeGreaterThan(0)
      expect(compareVersions('1.1.0', '1.2.0')).toBeLessThan(0)
    })

    it('should compare patch versions correctly', () => {
      expect(compareVersions('1.0.2', '1.0.1')).toBeGreaterThan(0)
      expect(compareVersions('1.0.1', '1.0.2')).toBeLessThan(0)
    })

    it('should return 0 for equal versions', () => {
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0)
    })

    it('should consider stable version greater than prerelease of same base', () => {
      expect(compareVersions('1.0.0', '1.0.0-alpha.1')).toBeGreaterThan(0)
      expect(compareVersions('1.0.0-alpha.1', '1.0.0')).toBeLessThan(0)
    })

    it('should compare prerelease types correctly (alpha < beta < rc)', () => {
      expect(compareVersions('1.0.0-beta.1', '1.0.0-alpha.1')).toBeGreaterThan(
        0
      )
      expect(compareVersions('1.0.0-rc.1', '1.0.0-beta.1')).toBeGreaterThan(0)
      expect(compareVersions('1.0.0-rc.1', '1.0.0-alpha.1')).toBeGreaterThan(0)
    })

    it('should compare prerelease numbers correctly', () => {
      expect(
        compareVersions('0.2.0-alpha.10', '0.2.0-alpha.9')
      ).toBeGreaterThan(0)
      expect(compareVersions('0.2.0-alpha.9', '0.2.0-alpha.10')).toBeLessThan(0)
    })

    it('should handle equal prereleases', () => {
      expect(compareVersions('0.2.0-alpha.9', '0.2.0-alpha.9')).toBe(0)
    })
  })

  describe('isNewerVersion', () => {
    it('should return true when available is newer', () => {
      expect(isNewerVersion('0.2.0-alpha.9', '0.2.0-alpha.10')).toBe(true)
    })

    it('should return false when available is older', () => {
      expect(isNewerVersion('0.2.0-alpha.10', '0.2.0-alpha.9')).toBe(false)
    })

    it('should return false when versions are equal', () => {
      expect(isNewerVersion('0.2.0-alpha.9', '0.2.0-alpha.9')).toBe(false)
    })

    it('should return true when stable version is available for prerelease user', () => {
      expect(isNewerVersion('0.2.0-alpha.9', '0.2.0')).toBe(true)
    })

    it('should handle major version jumps', () => {
      expect(isNewerVersion('0.2.0', '1.0.0')).toBe(true)
    })
  })
})
