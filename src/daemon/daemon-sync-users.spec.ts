import { describe, expect, it } from 'vitest'

describe('daemonSyncUsers', () => {
  it('should export the daemonSyncUsers function', async () => {
    const { daemonSyncUsers } = await import('./daemon-sync-users.js')
    expect(daemonSyncUsers).toBeDefined()
    expect(typeof daemonSyncUsers).toBe('function')
  })
})
