import { describe, expect, it } from 'vitest'

describe('daemonGetUser', () => {
  it('should export the daemonGetUser function', async () => {
    const { daemonGetUser } = await import('./daemon-get-user.js')
    expect(daemonGetUser).toBeDefined()
    expect(typeof daemonGetUser).toBe('function')
  })
})
