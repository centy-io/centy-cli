import { describe, expect, it } from 'vitest'
import { getDaemonSearchPaths } from './get-daemon-search-paths.js'

describe('getDaemonSearchPaths', () => {
  it('should return an array of strings', () => {
    const result = getDaemonSearchPaths()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    for (const p of result) {
      expect(typeof p).toBe('string')
    }
  })

  it('should include user install path for centy-daemon', () => {
    const result = getDaemonSearchPaths()
    expect(result.some(p => p.includes('.centy') && p.includes('centy-daemon'))).toBe(true)
  })

  it('should include PATH fallback as last entry', () => {
    const result = getDaemonSearchPaths()
    const last = result.at(-1)
    expect(last).toContain('centy-daemon')
    expect(last).toContain('PATH')
  })

  it('should include CENTY_DAEMON_PATH when env var is set', () => {
    // eslint-disable-next-line no-restricted-syntax
    const originalEnv = process.env['CENTY_DAEMON_PATH']
    // eslint-disable-next-line no-restricted-syntax
    process.env['CENTY_DAEMON_PATH'] = '/custom/centy-daemon'

    const result = getDaemonSearchPaths()
    expect(result).toContain('/custom/centy-daemon')

    if (originalEnv !== undefined) {
      // eslint-disable-next-line no-restricted-syntax
      process.env['CENTY_DAEMON_PATH'] = originalEnv
    } else {
      // eslint-disable-next-line no-restricted-syntax
      delete process.env['CENTY_DAEMON_PATH']
    }
  })
})
