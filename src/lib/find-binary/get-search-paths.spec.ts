import { describe, expect, it } from 'vitest'
import { getSearchPaths } from './get-search-paths.js'

describe('getSearchPaths', () => {
  it('should return an array of strings', () => {
    const result = getSearchPaths({
      binaryName: 'test-binary',
      envVar: 'NONEXISTENT_TEST_ENV_VAR',
      devRepoName: 'test-repo',
    })
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    for (const p of result) {
      expect(typeof p).toBe('string')
    }
  })

  it('should include user install path', () => {
    const result = getSearchPaths({
      binaryName: 'test-binary',
      envVar: 'NONEXISTENT_TEST_ENV_VAR',
      devRepoName: 'test-repo',
    })
    expect(result.some(p => p.includes('.centy'))).toBe(true)
  })

  it('should include PATH fallback as last entry', () => {
    const result = getSearchPaths({
      binaryName: 'test-binary',
      envVar: 'NONEXISTENT_TEST_ENV_VAR',
      devRepoName: 'test-repo',
    })
    const last = result.at(-1)
    expect(last).toContain('PATH')
  })

  it('should include env var path when set', () => {
    // eslint-disable-next-line no-restricted-syntax
    const originalEnv = process.env['TEST_SEARCH_PATHS_ENV']
    // eslint-disable-next-line no-restricted-syntax
    process.env['TEST_SEARCH_PATHS_ENV'] = '/custom/path/to/binary'

    const result = getSearchPaths({
      binaryName: 'test-binary',
      envVar: 'TEST_SEARCH_PATHS_ENV',
      devRepoName: 'test-repo',
    })
    expect(result).toContain('/custom/path/to/binary')

    if (originalEnv !== undefined) {
      // eslint-disable-next-line no-restricted-syntax
      process.env['TEST_SEARCH_PATHS_ENV'] = originalEnv
    } else {
      // eslint-disable-next-line no-restricted-syntax
      delete process.env['TEST_SEARCH_PATHS_ENV']
    }
  })

  it('should not include env var path when not set', () => {
    // eslint-disable-next-line no-restricted-syntax
    delete process.env['NONEXISTENT_TEST_ENV_VAR_2']
    const result = getSearchPaths({
      binaryName: 'test-binary',
      envVar: 'NONEXISTENT_TEST_ENV_VAR_2',
      devRepoName: 'test-repo',
    })
    expect(result.every(p => !p.includes('undefined'))).toBe(true)
  })
})
