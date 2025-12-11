import { describe, expect, it } from 'vitest'

describe('useAutoSelectProject hook', () => {
  it('should export a hook function', async () => {
    const module = await import('./useAutoSelectProject.js')
    expect(module.useAutoSelectProject).toBeDefined()
    expect(typeof module.useAutoSelectProject).toBe('function')
  })
})
