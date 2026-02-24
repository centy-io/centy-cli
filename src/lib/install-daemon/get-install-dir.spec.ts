import { homedir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getInstallDir } from './get-install-dir.js'

describe('getInstallDir', () => {
  it('should return a path under the home directory', () => {
    const result = getInstallDir()
    expect(result.startsWith(homedir())).toBe(true)
  })

  it('should end with .centy/bin', () => {
    const result = getInstallDir()
    expect(result).toBe(join(homedir(), '.centy', 'bin'))
  })

  it('should return a string', () => {
    expect(typeof getInstallDir()).toBe('string')
  })
})
