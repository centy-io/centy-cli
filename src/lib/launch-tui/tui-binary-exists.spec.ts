import { describe, expect, it } from 'vitest'
import { tuiBinaryExists } from './tui-binary-exists.js'

describe('tuiBinaryExists', () => {
  it('should return true for PATH lookup name', () => {
    expect(tuiBinaryExists('centy-tui')).toBe(true)
  })

  it('should return true for Windows PATH lookup name', () => {
    expect(tuiBinaryExists('centy-tui.exe')).toBe(true)
  })

  it('should return false for non-existent path', () => {
    expect(tuiBinaryExists('/nonexistent/centy-tui')).toBe(false)
  })
})
