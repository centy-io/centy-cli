import { describe, it, expect } from 'vitest'
import {
  PRIORITY_MAP,
  parseReviewers,
  hasAnyUpdates,
} from './process-fields.js'

describe('process-fields', () => {
  it('PRIORITY_MAP should have correct values', () => {
    expect(PRIORITY_MAP['high']).toBe(1)
    expect(PRIORITY_MAP['medium']).toBe(2)
    expect(PRIORITY_MAP['low']).toBe(3)
  })

  it('parseReviewers should be a function', () => {
    expect(typeof parseReviewers).toBe('function')
  })

  it('hasAnyUpdates should be a function', () => {
    expect(typeof hasAnyUpdates).toBe('function')
  })
})
