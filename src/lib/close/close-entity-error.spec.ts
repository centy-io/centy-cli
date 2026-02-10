import { describe, it, expect } from 'vitest'
import { CloseEntityError } from './close-entity-error.js'

describe('CloseEntityError', () => {
  it('should create an error with the correct name', () => {
    const error = new CloseEntityError('test')
    expect(error.name).toBe('CloseEntityError')
    expect(error.message).toBe('test')
  })
})
