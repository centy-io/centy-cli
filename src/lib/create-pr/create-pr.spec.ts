import { describe, expect, it } from 'vitest'

describe('createPr', () => {
  it('should export the function', async () => {
    const module = await import('./create-pr.js')
    expect(module.createPr).toBeDefined()
    expect(typeof module.createPr).toBe('function')
  })
})
