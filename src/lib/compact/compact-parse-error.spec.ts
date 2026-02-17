import { describe, it, expect } from 'vitest'
import { CompactParseError } from './compact-parse-error.js'

describe('CompactParseError', () => {
  it('should create an error with the correct name', () => {
    const error = new CompactParseError()
    expect(error.name).toBe('CompactParseError')
    expect(error.message).toBe(
      'Could not parse LLM response. Expected MIGRATION_CONTENT and COMPACT_CONTENT sections.'
    )
  })
})
