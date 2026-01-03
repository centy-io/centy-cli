import { describe, expect, it } from 'vitest'

describe('gatherMetadataFields', () => {
  it('should export the function', async () => {
    const module = await import('./gather-metadata-fields.js')
    expect(module.gatherMetadataFields).toBeDefined()
    expect(typeof module.gatherMetadataFields).toBe('function')
  })
})
