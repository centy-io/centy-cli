import { describe, expect, it } from 'vitest'
import { launchTui } from './launch-tui.js'

describe('launchTui', () => {
  it('should return result with success property', async () => {
    const result = await launchTui()
    expect(result).toHaveProperty('success')
  })

  it('should return error when binary not found', async () => {
    const result = await launchTui()
    // When TUI is not installed, should return an error
    if (!result.success) {
      expect(result.error).toBeTruthy()
    }
  })
})
