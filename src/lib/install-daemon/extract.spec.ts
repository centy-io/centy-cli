import { execSync } from 'node:child_process'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { extractArchive } from './extract.js'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
}))

vi.mock('./platform.js', () => ({
  isWindows: vi.fn().mockReturnValue(false),
}))

describe('extractArchive', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call tar for .tar.gz archives', () => {
    extractArchive('/path/to/archive.tar.gz', '/dest')
    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('tar -xzf'),
      expect.any(Object)
    )
  })

  it('should call tar for .tgz archives', () => {
    extractArchive('/path/to/archive.tgz', '/dest')
    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('tar -xzf'),
      expect.any(Object)
    )
  })

  it('should call unzip for .zip archives on non-Windows', () => {
    extractArchive('/path/to/archive.zip', '/dest')
    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('unzip'),
      expect.any(Object)
    )
  })

  it('should throw for unsupported archive formats', () => {
    expect(() => extractArchive('/path/to/archive.rar', '/dest')).toThrow(
      'Unsupported archive format'
    )
  })
})
