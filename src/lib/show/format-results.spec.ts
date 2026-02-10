import { describe, it, expect } from 'vitest'
import { formatIssueResults, formatPrResults } from './format-results.js'

describe('format-results', () => {
  it('formatIssueResults should be a function', () => {
    expect(typeof formatIssueResults).toBe('function')
  })

  it('formatPrResults should be a function', () => {
    expect(typeof formatPrResults).toBe('function')
  })
})
