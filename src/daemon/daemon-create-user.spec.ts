import { describe, expect, it } from 'vitest'

describe('daemonCreateUser', () => {
  it('should export the daemonCreateUser function', async () => {
    const { daemonCreateUser } = await import('./daemon-create-user.js')
    expect(daemonCreateUser).toBeDefined()
    expect(typeof daemonCreateUser).toBe('function')
  })
})
