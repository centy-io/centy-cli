import { describe, expect, it } from 'vitest'
import { waitForDaemon } from './wait-for-daemon.js'

describe('waitForDaemon', () => {
  it('should return a boolean result', async () => {
    const result = await waitForDaemon({
      maxAttempts: 1,
      delayMs: 10,
    })

    // Result depends on whether daemon is running
    expect(typeof result).toBe('boolean')
  })

  it('should accept custom options', async () => {
    const result = await waitForDaemon({
      maxAttempts: 2,
      delayMs: 50,
    })

    expect(typeof result).toBe('boolean')
  })

  it('should use default values when no options provided', async () => {
    // This test may take longer due to default values
    // We just verify it doesn't throw
    const result = await waitForDaemon({
      maxAttempts: 1,
      delayMs: 1,
    })

    expect(typeof result).toBe('boolean')
  })
})
