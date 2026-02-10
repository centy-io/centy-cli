import { describe, it, expect } from 'vitest'
import { applyLlmResponseFromFile } from './apply-llm-response.js'

describe('applyLlmResponseFromFile', () => {
  it('should be a function', () => {
    expect(typeof applyLlmResponseFromFile).toBe('function')
  })
})
