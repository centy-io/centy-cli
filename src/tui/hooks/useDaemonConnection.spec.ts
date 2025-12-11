import { describe, expect, it } from 'vitest'

describe('useDaemonConnection hook', () => {
  it('should export a hook function', async () => {
    const module = await import('./useDaemonConnection.js')
    expect(module.useDaemonConnection).toBeDefined()
    expect(typeof module.useDaemonConnection).toBe('function')
  })
})
