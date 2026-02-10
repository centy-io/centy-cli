import { describe, it, expect } from 'vitest'
import { parseLlmResponse } from './parse-llm-response.js'

describe('parseLlmResponse', () => {
  it('should be a function', () => {
    expect(typeof parseLlmResponse).toBe('function')
  })
})
