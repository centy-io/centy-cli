import { createRequire } from 'node:module'
import { describe, it, expect } from 'vitest'
import { VERSION } from './version.js'
import { getVersion } from './get-version.js'
const require = createRequire(import.meta.url)
const pkg: { version: string } = require('../package.json')

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

  it('should equal the version in package.json', () => {
    expect(getVersion()).toBe(pkg.version)
  })
})
