import { describe, it, expect } from 'vitest'
import { closePr } from './close-pr.js'

describe('closePr', () => {
  it('should be a function', () => {
    expect(typeof closePr).toBe('function')
  })
})
