import { describe, expect, it } from 'vitest'

describe('useDaemonInfo hook', () => {
  it('should export a hook function', async () => {
    const module = await import('./useDaemonInfo.js')
    expect(module.useDaemonInfo).toBeDefined()
    expect(typeof module.useDaemonInfo).toBe('function')
  })
})
