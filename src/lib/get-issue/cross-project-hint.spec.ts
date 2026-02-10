import { describe, it, expect } from 'vitest'
import { checkCrossProjectIssue } from './cross-project-hint.js'

describe('checkCrossProjectIssue', () => {
  it('should be a function', () => {
    expect(typeof checkCrossProjectIssue).toBe('function')
  })
})
