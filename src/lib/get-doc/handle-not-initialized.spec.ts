import { describe, it, expect } from 'vitest'
import { handleDocNotInitialized } from './handle-not-initialized.js'

describe('handleDocNotInitialized', () => {
  it('should be a function', () => {
    expect(typeof handleDocNotInitialized).toBe('function')
  })
})
