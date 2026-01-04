import { describe, expect, it, afterEach } from 'vitest'
import { getPermissionDeniedMsg } from './get-permission-denied-msg.js'

describe('getPermissionDeniedMsg', () => {
  const originalPlatform = process.platform

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform })
  })

  it('should return chmod message on non-Windows platforms', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' })

    const result = getPermissionDeniedMsg('/path/to/binary')

    expect(result).toContain('Permission denied: /path/to/binary')
    expect(result).toContain('chmod +x')
  })

  it('should return Windows-specific message on Windows', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' })

    const result = getPermissionDeniedMsg('C:\\path\\to\\binary.exe')

    expect(result).toContain('Permission denied: C:\\path\\to\\binary.exe')
    expect(result).toContain('Windows security')
    expect(result).toContain('Unblock')
    expect(result).not.toContain('chmod')
  })
})
