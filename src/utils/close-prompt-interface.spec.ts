import { describe, expect, it } from 'vitest'

describe('closePromptInterface', () => {
  it('should export the closePromptInterface function', async () => {
    const mod = await import('./close-prompt-interface.js')
    expect(mod.closePromptInterface).toBeDefined()
    expect(typeof mod.closePromptInterface).toBe('function')
  })
})
