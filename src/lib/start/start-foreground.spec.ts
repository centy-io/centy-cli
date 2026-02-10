import { describe, it, expect } from 'vitest'
import { startForeground } from './start-foreground.js'

describe('startForeground', () => {
  it('should be a function', () => {
    expect(typeof startForeground).toBe('function')
  })
})
