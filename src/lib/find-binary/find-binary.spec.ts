import { describe, expect, it } from 'vitest'
import { findBinary } from './find-binary.js'

describe('findBinary', () => {
  it('should return a string path', () => {
    const result = findBinary({
      binaryName: 'test-binary',
      envVar: 'TEST_BINARY_PATH',
      devRepoName: 'test-repo',
    })
    expect(typeof result).toBe('string')
  })

  it('should return binary name as fallback when not found', () => {
    const result = findBinary({
      binaryName: 'nonexistent-binary',
      envVar: 'NONEXISTENT_PATH',
      devRepoName: 'nonexistent-repo',
    })
    expect(result).toBe(
      process.platform === 'win32'
        ? 'nonexistent-binary.exe'
        : 'nonexistent-binary'
    )
  })

  it('should not use env path if file does not exist', () => {
    // eslint-disable-next-line no-restricted-syntax
    const originalEnv = process.env['TEST_FIND_BINARY_PATH']

    // eslint-disable-next-line no-restricted-syntax
    process.env['TEST_FIND_BINARY_PATH'] = '/nonexistent/path'
    const result = findBinary({
      binaryName: 'test-binary',
      envVar: 'TEST_FIND_BINARY_PATH',
      devRepoName: 'test-repo',
    })
    expect(result).not.toBe('/nonexistent/path')

    if (originalEnv !== undefined) {
      // eslint-disable-next-line no-restricted-syntax
      process.env['TEST_FIND_BINARY_PATH'] = originalEnv
    } else {
      // eslint-disable-next-line no-restricted-syntax
      delete process.env['TEST_FIND_BINARY_PATH']
    }
  })
})
