import { describe, it, expect } from 'vitest'
import { handlePrNotInitialized } from './handle-not-initialized.js'

describe('handlePrNotInitialized', () => {
  it('should be a function', () => {
    expect(typeof handlePrNotInitialized).toBe('function')
  })
})
