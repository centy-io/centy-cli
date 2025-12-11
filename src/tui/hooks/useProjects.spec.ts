import { describe, expect, it } from 'vitest'

describe('useProjects hook', () => {
  it('should export a hook function', async () => {
    const module = await import('./useProjects.js')
    expect(module.useProjects).toBeDefined()
    expect(typeof module.useProjects).toBe('function')
  })
})
