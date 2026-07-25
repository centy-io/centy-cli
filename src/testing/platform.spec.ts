import { describe, expect, it } from 'vitest'
import { IS_UNIX, IS_WINDOWS, skipOnUnix, skipOnWindows } from './platform.js'

describe('platform helpers', () => {
  it('IS_WINDOWS reflects process.platform', () => {
    expect(IS_WINDOWS).toBe(process.platform === 'win32')
  })

  it('IS_UNIX reflects non-Windows platforms', () => {
    expect(IS_UNIX).toBe(process.platform !== 'win32')
  })

  it('IS_WINDOWS and IS_UNIX are mutually exclusive', () => {
    expect(IS_WINDOWS && IS_UNIX).toBe(false)
  })

  it('IS_WINDOWS and IS_UNIX are exhaustive', () => {
    expect(IS_WINDOWS || IS_UNIX).toBe(true)
  })

  it('skipOnWindows is defined', () => {
    expect(skipOnWindows).toBeDefined()
  })

  it('skipOnUnix is defined', () => {
    expect(skipOnUnix).toBeDefined()
  })

  skipOnWindows('only runs on Unix (skipOnWindows skips on Windows)', () => {
    expect(IS_UNIX).toBe(true)
  })

  skipOnUnix('only runs on Windows (skipOnUnix skips on Unix)', () => {
    expect(IS_WINDOWS).toBe(true)
  })
})
