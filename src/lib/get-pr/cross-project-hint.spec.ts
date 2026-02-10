import { describe, it, expect } from 'vitest'
import { checkCrossProjectPr } from './cross-project-hint.js'

describe('checkCrossProjectPr', () => {
  it('should be a function', () => {
    expect(typeof checkCrossProjectPr).toBe('function')
  })
})
