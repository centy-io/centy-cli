import { describe, it, expect } from 'vitest'
import { formatIssuePlain } from './format-issue-output.js'

describe('formatIssuePlain', () => {
  it('should be a function', () => {
    expect(typeof formatIssuePlain).toBe('function')
  })
})
