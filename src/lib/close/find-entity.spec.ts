import { describe, it, expect } from 'vitest'
import { findEntityByDisplayNumber } from './find-entity.js'

describe('findEntityByDisplayNumber', () => {
  it('should be a function', () => {
    expect(typeof findEntityByDisplayNumber).toBe('function')
  })
})
