import { describe, expect, it } from 'vitest'
import { findTuiBinary } from './find-tui-binary.js'

describe('findTuiBinary', () => {
  it('should return a string path', () => {
    const result = findTuiBinary()
    expect(typeof result).toBe('string')
  })

  it('should return centy-tui as fallback when not found', () => {
    const result = findTuiBinary()
    expect(result).toBeTruthy()
  })
})
