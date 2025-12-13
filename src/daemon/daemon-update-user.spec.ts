import { describe, expect, it } from 'vitest'

describe('daemonUpdateUser', () => {
  it('should export the daemonUpdateUser function', async () => {
    const { daemonUpdateUser } = await import('./daemon-update-user.js')
    expect(daemonUpdateUser).toBeDefined()
    expect(typeof daemonUpdateUser).toBe('function')
  })
})
