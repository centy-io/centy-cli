import { describe, it, expect } from 'vitest'
import { startBackground } from './start-background.js'

describe('startBackground', () => {
  it('should be a function', () => {
    expect(typeof startBackground).toBe('function')
  })
})
