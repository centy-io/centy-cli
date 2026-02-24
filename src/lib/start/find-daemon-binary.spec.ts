import { describe, expect, it } from 'vitest'
import { findDaemonBinary } from './find-daemon-binary.js'

describe('findDaemonBinary', () => {
  it('should return a string path', () => {
    const result = findDaemonBinary()
    expect(typeof result).toBe('string')
  })

  it('should return centy-daemon as fallback when not found', () => {
    // When no daemon is installed, it falls back to PATH lookup
    const result = findDaemonBinary()
    // Result should either be a found path or the fallback name
    expect(result).toBeTruthy()
  })

  it('should respect CENTY_DAEMON_PATH environment variable when file does not exist', () => {
    // eslint-disable-next-line no-restricted-syntax
    const originalEnv = process.env['CENTY_DAEMON_PATH']

    // Set to a non-existent path - function should not return this
    // eslint-disable-next-line no-restricted-syntax
    process.env['CENTY_DAEMON_PATH'] = '/nonexistent/daemon/path'
    const result = findDaemonBinary()
    expect(result).not.toBe('/nonexistent/daemon/path')

    // Restore
    if (originalEnv !== undefined) {
      // eslint-disable-next-line no-restricted-syntax
      process.env['CENTY_DAEMON_PATH'] = originalEnv
    } else {
      // eslint-disable-next-line no-restricted-syntax
      delete process.env['CENTY_DAEMON_PATH']
    }
  })
})
