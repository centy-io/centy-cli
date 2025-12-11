import { describe, expect, it } from 'vitest'

describe('useAssets hook', () => {
  it('should export a hook function', async () => {
    const module = await import('./useAssets.js')
    expect(module.useAssets).toBeDefined()
    expect(typeof module.useAssets).toBe('function')
  })
})
