import { describe, expect, it } from 'vitest'
import { installDaemon } from './install-daemon.js'

describe('installDaemon', { timeout: 30_000 }, () => {
  it('should return result with success property', async () => {
    const result = await installDaemon({
      version: '0.0.0-nonexistent',
    })

    expect(result).toHaveProperty('success')
    expect(typeof result.success).toBe('boolean')
  })

  it('should return error for non-existent version', async () => {
    const result = await installDaemon({
      version: '0.0.0-nonexistent',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should accept custom log functions', async () => {
    const logs: string[] = []
    const warnings: string[] = []

    await installDaemon({
      version: '0.0.0-nonexistent',
      log: msg => logs.push(msg),
      warn: msg => warnings.push(msg),
    })

    expect(logs.length).toBeGreaterThan(0)
  })
})
