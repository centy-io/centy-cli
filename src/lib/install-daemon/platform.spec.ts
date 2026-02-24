import { describe, expect, it } from 'vitest'
import {
  isWindows,
  getBinaryFileName,
  getArchiveExtension,
} from './platform.js'

describe('isWindows', () => {
  it('should return a boolean', () => {
    expect(typeof isWindows()).toBe('boolean')
  })

  it('should return true only on win32 platform', () => {
    expect(isWindows()).toBe(process.platform === 'win32')
  })
})

describe('getBinaryFileName', () => {
  it('should append .exe on Windows', () => {
    const result = getBinaryFileName('centy-daemon')
    const expected =
      process.platform === 'win32' ? 'centy-daemon.exe' : 'centy-daemon'
    expect(result).toBe(expected)
  })

  it('should not append .exe on non-Windows platforms', () => {
    if (process.platform !== 'win32') {
      expect(getBinaryFileName('centy-daemon')).toBe('centy-daemon')
    }
  })

  it('should append .exe on Windows platforms', () => {
    if (process.platform === 'win32') {
      expect(getBinaryFileName('centy-daemon')).toBe('centy-daemon.exe')
    }
  })
})

describe('getArchiveExtension', () => {
  it('should return a non-empty string', () => {
    expect(getArchiveExtension().length).toBeGreaterThan(0)
  })

  it('should return zip on Windows', () => {
    if (process.platform === 'win32') {
      expect(getArchiveExtension()).toBe('zip')
    }
  })

  it('should return tar.gz on non-Windows', () => {
    if (process.platform !== 'win32') {
      expect(getArchiveExtension()).toBe('tar.gz')
    }
  })
})
