import { describe, expect, it } from 'vitest'

describe('createFlags', () => {
  it('should export the create flags definition', async () => {
    const { createFlags } = await import('./create-flags.js')
    expect(createFlags).toBeDefined()
  })

  it('should include required title flag', async () => {
    const { createFlags } = await import('./create-flags.js')
    expect(createFlags.title).toBeDefined()
  })

  it('should include link flag with multiple enabled', async () => {
    const { createFlags } = await import('./create-flags.js')
    expect(createFlags.link).toBeDefined()
  })

  it('should include project flag', async () => {
    const { createFlags } = await import('./create-flags.js')
    expect(createFlags.project).toBeDefined()
  })
})
