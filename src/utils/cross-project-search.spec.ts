import { describe, it, expect } from 'vitest'
import { isValidUuid } from './cross-project-search.js'

describe('isValidUuid', () => {
  it('should return true for valid uuid', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('should return false for non-uuid string', () => {
    expect(isValidUuid('not-a-uuid')).toBe(false)
  })
})
