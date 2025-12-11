import { describe, expect, it } from 'vitest'

describe('views types', () => {
  it('should export type definitions', async () => {
    const module = await import('./views.js')
    expect(module).toBeDefined()
  })
})
