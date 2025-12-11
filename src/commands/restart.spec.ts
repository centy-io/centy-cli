import { describe, expect, it } from 'vitest'

describe('Restart command', () => {
  it('should have correct static properties', async () => {
    const { default: Command } = await import('./restart.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./restart.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })
})
