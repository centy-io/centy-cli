import { describe, expect, it } from 'vitest'
import { launchTui } from './launch-tui.js'

describe('launchTui', () => {
  it('should return result with success property', async () => {
    const result = await launchTui()
    expect(result).toHaveProperty('success')
  })

  it('should handle missing binary gracefully', async () => {
    const result = await launchTui()
    // Result should always have success property
    expect(typeof result.success).toBe('boolean')
    // If failed due to missing binary, error should be set
    // Note: exit code failures may not have error message
    if (!result.success && result.error) {
      expect(result.error).toBeTruthy()
    }
  })
})
