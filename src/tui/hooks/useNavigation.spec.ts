import { describe, expect, it } from 'vitest'

describe('useNavigation hook', () => {
  it('should export a hook function', async () => {
    const module = await import('./useNavigation.js')
    expect(module.useNavigation).toBeDefined()
    expect(typeof module.useNavigation).toBe('function')
  })
})
