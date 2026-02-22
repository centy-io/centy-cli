import { describe, expect, it } from 'vitest'
import { toPlural } from './to-plural.js'

describe('toPlural', () => {
  it('should add s to regular words', () => {
    expect(toPlural('issue')).toBe('issues')
    expect(toPlural('doc')).toBe('docs')
    expect(toPlural('bug')).toBe('bugs')
  })

  it('should convert y ending to ies', () => {
    expect(toPlural('story')).toBe('stories')
  })

  it('should not double-pluralize words ending in s', () => {
    expect(toPlural('docs')).toBe('docs')
    expect(toPlural('issues')).toBe('issues')
  })

  it('should handle irregular plurals', () => {
    expect(toPlural('person')).toBe('people')
    expect(toPlural('child')).toBe('children')
    expect(toPlural('status')).toBe('statuses')
  })
})
