import { describe, expect, it } from 'vitest'

describe('usePullRequests hook', () => {
  it('should export a hook function', async () => {
    const module = await import('./usePullRequests.js')
    expect(module.usePullRequests).toBeDefined()
    expect(typeof module.usePullRequests).toBe('function')
  })
})
