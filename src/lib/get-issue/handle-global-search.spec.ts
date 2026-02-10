import { describe, it, expect } from 'vitest'
import { handleGlobalIssueSearch } from './handle-global-search.js'

describe('handleGlobalIssueSearch', () => {
  it('should be a function', () => {
    expect(typeof handleGlobalIssueSearch).toBe('function')
  })
})
