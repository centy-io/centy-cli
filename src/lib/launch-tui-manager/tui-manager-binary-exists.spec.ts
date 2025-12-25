import { describe, expect, it } from 'vitest'
import { tuiManagerBinaryExists } from './tui-manager-binary-exists.js'

describe('tuiManagerBinaryExists', () => {
  it('should return true for PATH lookup name', () => {
    expect(tuiManagerBinaryExists('tui-manager')).toBe(true)
  })

  it('should return true for Windows PATH lookup name', () => {
    expect(tuiManagerBinaryExists('tui-manager.exe')).toBe(true)
  })

  it('should return false for non-existent path', () => {
    expect(tuiManagerBinaryExists('/nonexistent/tui-manager')).toBe(false)
  })
})
