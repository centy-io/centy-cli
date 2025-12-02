import { describe, it, expect } from 'vitest'
import { VERSION } from './version.js'

describe('VERSION', () => {
  it('should be defined', () => {
    expect(VERSION).toBeDefined()
  })

  it('should be a string', () => {
    expect(typeof VERSION).toBe('string')
  })

  it('should be a valid semver format', () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+/)
  })
})
