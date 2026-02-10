import { describe, it, expect } from 'vitest'
import { formatPrPlain } from './format-pr-output.js'

describe('formatPrPlain', () => {
  it('should be a function', () => {
    expect(typeof formatPrPlain).toBe('function')
  })
})
