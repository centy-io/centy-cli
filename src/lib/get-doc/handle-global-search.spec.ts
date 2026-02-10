import { describe, it, expect } from 'vitest'
import { handleGlobalDocSearch } from './handle-global-search.js'

describe('handleGlobalDocSearch', () => {
  it('should be a function', () => {
    expect(typeof handleGlobalDocSearch).toBe('function')
  })
})
