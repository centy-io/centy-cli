import { describe, it, expect } from 'vitest'
import { handleIssueNotInitialized } from './handle-not-initialized.js'

describe('handleIssueNotInitialized', () => {
  it('should be a function', () => {
    expect(typeof handleIssueNotInitialized).toBe('function')
  })
})
