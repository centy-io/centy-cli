import { describe, expect, it } from 'vitest'

describe('updateFlags', () => {
  it('should export the update flags definition', async () => {
    const { updateFlags } = await import('./update-flags.js')
    expect(updateFlags).toBeDefined()
  })

  it('should include optional title flag', async () => {
    const { updateFlags } = await import('./update-flags.js')
    expect(updateFlags.title).toBeDefined()
  })

  it('should include link flag with multiple enabled', async () => {
    const { updateFlags } = await import('./update-flags.js')
    expect(updateFlags.link).toBeDefined()
  })

  it('should include project flag', async () => {
    const { updateFlags } = await import('./update-flags.js')
    expect(updateFlags.project).toBeDefined()
  })
})
