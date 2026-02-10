import { describe, it, expect } from 'vitest'
import { extractAndMarkIssues } from './mark-issues.js'

describe('extractAndMarkIssues', () => {
  it('should be a function', () => {
    expect(typeof extractAndMarkIssues).toBe('function')
  })
})
