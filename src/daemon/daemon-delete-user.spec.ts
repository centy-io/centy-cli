import { describe, expect, it } from 'vitest'

describe('daemonDeleteUser', () => {
  it('should export the daemonDeleteUser function', async () => {
    const { daemonDeleteUser } = await import('./daemon-delete-user.js')
    expect(daemonDeleteUser).toBeDefined()
    expect(typeof daemonDeleteUser).toBe('function')
  })
})
