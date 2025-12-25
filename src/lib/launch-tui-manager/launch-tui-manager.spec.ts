import { describe, expect, it } from 'vitest'
import { launchTuiManager } from './launch-tui-manager.js'

describe('launchTuiManager', () => {
  it('should return result with success property', async () => {
    const result = await launchTuiManager()
    expect(result).toHaveProperty('success')
  })

  it('should return error when binary not found', async () => {
    const result = await launchTuiManager()
    // When TUI Manager is not installed, should return an error
    if (!result.success) {
      expect(result.error).toBeTruthy()
    }
  })
})
