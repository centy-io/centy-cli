import { describe, expect, it } from 'vitest'

describe('projectFlag', () => {
  it('should export the project flag definition', async () => {
    const { projectFlag } = await import('./project-flag.js')
    expect(projectFlag).toBeDefined()
  })

  it('should have a description', async () => {
    const { projectFlag } = await import('./project-flag.js')
    expect(projectFlag.description).toBeDefined()
    expect(typeof projectFlag.description).toBe('string')
  })
})
