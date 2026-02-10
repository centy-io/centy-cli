import { describe, it, expect } from 'vitest'
import { formatDocPlain } from './format-doc-output.js'

describe('formatDocPlain', () => {
  it('should be a function', () => {
    expect(typeof formatDocPlain).toBe('function')
  })
})
