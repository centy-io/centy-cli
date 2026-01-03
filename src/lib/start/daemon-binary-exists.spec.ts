import { describe, expect, it } from 'vitest'
import { daemonBinaryExists } from './daemon-binary-exists.js'

describe('daemonBinaryExists', () => {
  it('should return true for centy-daemon name (PATH lookup)', () => {
    const result = daemonBinaryExists('centy-daemon')
    expect(result).toBe(true)
  })

  it('should return false for non-existent absolute path', () => {
    const result = daemonBinaryExists('/nonexistent/path/to/binary')
    expect(result).toBe(false)
  })

  it('should return true for existing file path', () => {
    // Using package.json as a known existing file
    const result = daemonBinaryExists('package.json')
    expect(result).toBe(true)
  })
})
