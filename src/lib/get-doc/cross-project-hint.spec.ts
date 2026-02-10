import { describe, it, expect } from 'vitest'
import { checkCrossProjectDoc } from './cross-project-hint.js'

describe('checkCrossProjectDoc', () => {
  it('should be a function', () => {
    expect(typeof checkCrossProjectDoc).toBe('function')
  })
})
