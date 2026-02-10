import { describe, it, expect } from 'vitest'
import { closeIssue } from './close-issue.js'

describe('closeIssue', () => {
  it('should be a function', () => {
    expect(typeof closeIssue).toBe('function')
  })
})
