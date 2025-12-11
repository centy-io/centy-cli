import { describe, expect, it } from 'vitest'

describe('local-config', () => {
  it('should export module functions', async () => {
    const module = await import('./local-config.js')
    expect(module).toBeDefined()
  })
})
