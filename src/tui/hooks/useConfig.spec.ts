import { describe, expect, it } from 'vitest'

describe('useConfig hook', () => {
  it('should export a hook function', async () => {
    const module = await import('./useConfig.js')
    expect(module.useConfig).toBeDefined()
    expect(typeof module.useConfig).toBe('function')
  })
})
