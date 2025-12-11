import { describe, expect, it } from 'vitest'

describe('useDocs hook', () => {
  it('should export a hook function', async () => {
    const module = await import('./useDocs.js')
    expect(module.useDocs).toBeDefined()
    expect(typeof module.useDocs).toBe('function')
  })
})
