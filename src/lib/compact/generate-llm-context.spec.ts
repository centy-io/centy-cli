import { describe, it, expect } from 'vitest'
import { generateLlmContext } from './generate-llm-context.js'

describe('generateLlmContext', () => {
  it('should be a function', () => {
    expect(typeof generateLlmContext).toBe('function')
  })
})
