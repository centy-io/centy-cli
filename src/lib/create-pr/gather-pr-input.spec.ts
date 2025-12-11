import { describe, expect, it } from 'vitest'

describe('gatherPrInput', () => {
  it('should export the function', async () => {
    const module = await import('./gather-pr-input.js')
    expect(module.gatherPrInput).toBeDefined()
    expect(typeof module.gatherPrInput).toBe('function')
  })
})
