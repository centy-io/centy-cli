import { describe, expect, it } from 'vitest'

describe('DeleteUser command', () => {
  it('should export the DeleteUser class', async () => {
    const { default: DeleteUser } = await import('./user.js')
    expect(DeleteUser).toBeDefined()
  })

  it('should have a description', async () => {
    const { default: DeleteUser } = await import('./user.js')
    expect(DeleteUser.description).toBeDefined()
    expect(typeof DeleteUser.description).toBe('string')
  })
})
