import { describe, expect, it } from 'vitest'

describe('daemonListUsers', () => {
  it('should export the daemonListUsers function', async () => {
    const { daemonListUsers } = await import('./daemon-list-users.js')
    expect(daemonListUsers).toBeDefined()
    expect(typeof daemonListUsers).toBe('function')
  })
})
