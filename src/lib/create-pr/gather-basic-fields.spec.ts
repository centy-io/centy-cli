import { describe, expect, it } from 'vitest'

describe('gatherBasicFields', () => {
  it('should export the function', async () => {
    const module = await import('./gather-basic-fields.js')
    expect(module.gatherBasicFields).toBeDefined()
    expect(typeof module.gatherBasicFields).toBe('function')
  })
})
