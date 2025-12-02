import { describe, it, expect } from 'vitest'
import { getVersion } from './get-version.js'
import { VERSION } from './version.js'

describe('getVersion', () => {
  it('should return the VERSION constant', () => {
    expect(getVersion()).toBe(VERSION)
  })

  it('should return a valid semver format', () => {
    const version = getVersion()
    expect(version).toMatch(/^\d+\.\d+\.\d+/)
  })
})
