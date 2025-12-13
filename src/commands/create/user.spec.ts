import { describe, expect, it } from 'vitest'

describe('CreateUser command', () => {
  it('should export the CreateUser class', async () => {
    const { default: CreateUser } = await import('./user.js')
    expect(CreateUser).toBeDefined()
  })

  it('should have a description', async () => {
    const { default: CreateUser } = await import('./user.js')
    expect(CreateUser.description).toBeDefined()
    expect(typeof CreateUser.description).toBe('string')
  })
})
