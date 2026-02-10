import { describe, it, expect } from 'vitest'
import { CompactSaveError } from './compact-save-error.js'

describe('CompactSaveError', () => {
  it('should create an error with the correct name', () => {
    const error = new CompactSaveError('test')
    expect(error.name).toBe('CompactSaveError')
    expect(error.message).toBe('test')
  })
})
