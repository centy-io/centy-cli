import { describe, expect, it } from 'vitest'

describe('promptForDescription', () => {
  it('should export the promptForDescription function', async () => {
    const mod = await import('./prompt-for-description.js')
    expect(mod.promptForDescription).toBeDefined()
    expect(typeof mod.promptForDescription).toBe('function')
  })
})
