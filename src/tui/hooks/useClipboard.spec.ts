import { describe, expect, it } from 'vitest'

describe('useClipboard hook', () => {
  it('should export a hook function', async () => {
    const module = await import('./useClipboard.js')
    expect(module.useClipboard).toBeDefined()
    expect(typeof module.useClipboard).toBe('function')
  })
})
