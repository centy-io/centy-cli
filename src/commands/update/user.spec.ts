import { describe, expect, it } from 'vitest'

describe('UpdateUser command', () => {
  it('should export the UpdateUser class', async () => {
    const { default: UpdateUser } = await import('./user.js')
    expect(UpdateUser).toBeDefined()
  })

  it('should have a description', async () => {
    const { default: UpdateUser } = await import('./user.js')
    expect(UpdateUser.description).toBeDefined()
    expect(typeof UpdateUser.description).toBe('string')
  })
})
