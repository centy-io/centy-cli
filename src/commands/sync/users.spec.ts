import { describe, expect, it } from 'vitest'

describe('SyncUsers command', () => {
  it('should export the SyncUsers class', async () => {
    const { default: SyncUsers } = await import('./users.js')
    expect(SyncUsers).toBeDefined()
  })

  it('should have a description', async () => {
    const { default: SyncUsers } = await import('./users.js')
    expect(SyncUsers.description).toBeDefined()
    expect(typeof SyncUsers.description).toBe('string')
  })
})
