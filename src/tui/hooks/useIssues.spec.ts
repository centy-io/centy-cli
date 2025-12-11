import { describe, expect, it } from 'vitest'

describe('useIssues hook', () => {
  it('should export a hook function', async () => {
    const module = await import('./useIssues.js')
    expect(module.useIssues).toBeDefined()
    expect(typeof module.useIssues).toBe('function')
  })
})
