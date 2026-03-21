import { describe, expect, it } from 'vitest'
import { IS_WINDOWS } from '../../testing/platform.js'
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
      IS_WINDOWS ? 'nonexistent-binary.exe' : 'nonexistent-binary'
    )
  })

  it('should not use env path if file does not exist', () => {
    const originalEnv = Reflect.get(process.env, 'TEST_FIND_BINARY_PATH')
    Reflect.set(process.env, 'TEST_FIND_BINARY_PATH', '/nonexistent/path')
    const result = findBinary({
      binaryName: 'test-binary',
      envVar: 'TEST_FIND_BINARY_PATH',
      devRepoName: 'test-repo',
    })
    expect(result).not.toBe('/nonexistent/path')

    if (originalEnv !== undefined) {
      Reflect.set(process.env, 'TEST_FIND_BINARY_PATH', originalEnv)
    } else {
      Reflect.deleteProperty(process.env, 'TEST_FIND_BINARY_PATH')
    }
  })
})
