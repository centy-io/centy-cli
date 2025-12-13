import { describe, expect, it } from 'vitest'

describe('GetUser command', () => {
  it('should export the GetUser class', async () => {
    const { default: GetUser } = await import('./user.js')
    expect(GetUser).toBeDefined()
  })

  it('should have a description', async () => {
    const { default: GetUser } = await import('./user.js')
    expect(GetUser.description).toBeDefined()
    expect(typeof GetUser.description).toBe('string')
  })
})
