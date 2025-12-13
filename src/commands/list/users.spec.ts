import { describe, expect, it } from 'vitest'

describe('ListUsers command', () => {
  it('should export the ListUsers class', async () => {
    const { default: ListUsers } = await import('./users.js')
    expect(ListUsers).toBeDefined()
  })

  it('should have a description', async () => {
    const { default: ListUsers } = await import('./users.js')
    expect(ListUsers.description).toBeDefined()
    expect(typeof ListUsers.description).toBe('string')
  })
})
