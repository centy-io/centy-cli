import { chmodSync } from 'node:fs'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { makeExecutable } from './make-executable.js'

vi.mock('node:fs', () => ({
  chmodSync: vi.fn(),
}))

vi.mock('./platform.js', () => ({
  isWindows: vi.fn().mockReturnValue(false),
}))

describe('makeExecutable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call chmodSync on non-Windows', () => {
    makeExecutable('/path/to/binary')
    expect(chmodSync).toHaveBeenCalledWith('/path/to/binary', 0o755)
  })

  it('should set 0o755 permissions', () => {
    makeExecutable('/path/to/binary')
    expect(chmodSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Number)
    )
    const call = vi.mocked(chmodSync).mock.calls[0]
    expect(call[1]).toBe(0o755)
  })
})
