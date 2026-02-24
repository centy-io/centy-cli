import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearLocalConfig,
  deleteLocalConfigValue,
  getLocalConfig,
  getLocalConfigValue,
  resetStoreForTesting,
  setLocalConfigValue,
} from './local-config.js'

vi.mock('conf', () => {
  class MockConf {
    // eslint-disable-next-line no-restricted-syntax
    private data: Record<string, unknown> = {}

    get store(): Record<string, unknown> {
      return { ...this.data }
    }

    get(key: string, defaultValue?: unknown): unknown {
      // eslint-disable-next-line security/detect-object-injection
      return key in this.data ? this.data[key] : defaultValue
    }

    set(key: string, value: unknown): void {
      // eslint-disable-next-line security/detect-object-injection
      this.data[key] = value
    }

    delete(key: string): void {
      // eslint-disable-next-line security/detect-object-injection
      delete this.data[key]
    }

    clear(): void {
      this.data = {}
    }
  }

  return { default: MockConf }
})

describe('local-config', () => {
  beforeEach(() => {
    resetStoreForTesting()
  })

  afterEach(() => {
    resetStoreForTesting()
  })

  describe('getLocalConfig', () => {
    it('should return empty object when no values set', () => {
      const config = getLocalConfig()
      expect(config).toEqual({})
    })

    it('should return all stored values', () => {
      setLocalConfigValue('preferredProject', '/path/to/project')
      const config = getLocalConfig()
      expect(config).toEqual({ preferredProject: '/path/to/project' })
    })
  })

  describe('setLocalConfigValue and getLocalConfigValue', () => {
    it('should store and retrieve preferredProject', () => {
      setLocalConfigValue('preferredProject', '/path/to/my-project')
      const value = getLocalConfigValue('preferredProject', '')
      expect(value).toBe('/path/to/my-project')
    })

    it('should return default value when key is not set', () => {
      const value = getLocalConfigValue('preferredProject', '/default/path')
      expect(value).toBe('/default/path')
    })

    it('should overwrite existing value', () => {
      setLocalConfigValue('preferredProject', '/first/path')
      setLocalConfigValue('preferredProject', '/second/path')
      const value = getLocalConfigValue('preferredProject', '')
      expect(value).toBe('/second/path')
    })
  })

  describe('deleteLocalConfigValue', () => {
    it('should remove a stored value', () => {
      setLocalConfigValue('preferredProject', '/path/to/project')
      deleteLocalConfigValue('preferredProject')
      const value = getLocalConfigValue('preferredProject', '/default')
      expect(value).toBe('/default')
    })

    it('should not throw when deleting a non-existent key', () => {
      expect(() => deleteLocalConfigValue('preferredProject')).not.toThrow()
    })
  })

  describe('clearLocalConfig', () => {
    it('should remove all stored values', () => {
      setLocalConfigValue('preferredProject', '/path/to/project')
      clearLocalConfig()
      const config = getLocalConfig()
      expect(config).toEqual({})
    })
  })
})
