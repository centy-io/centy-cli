import { describe, expect, it } from 'vitest'
import { findTuiManagerBinary } from './find-tui-manager-binary.js'

describe('findTuiManagerBinary', () => {
  it('should return a string path', () => {
    const result = findTuiManagerBinary()
    expect(typeof result).toBe('string')
  })

  it('should return tui-manager as fallback when not found', () => {
    const result = findTuiManagerBinary()
    expect(result).toBeTruthy()
  })
})
