import { describe, it, expect } from 'vitest'
import { searchEntitiesByUuid } from './search-entities.js'

describe('searchEntitiesByUuid', () => {
  it('should be a function', () => {
    expect(typeof searchEntitiesByUuid).toBe('function')
  })
})
