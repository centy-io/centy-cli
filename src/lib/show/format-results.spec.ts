import { describe, it, expect } from 'vitest'
import { formatIssueResults } from './format-results.js'

describe('format-results', () => {
  it('formatIssueResults should be a function', () => {
    expect(typeof formatIssueResults).toBe('function')
  })
})
