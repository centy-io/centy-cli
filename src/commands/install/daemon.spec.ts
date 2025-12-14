import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockCommand } from '../../testing/command-test-utils.js'

const mockInstallDaemon = vi.fn()

vi.mock('../../lib/install-daemon/install-daemon.js', () => ({
  installDaemon: (...args: unknown[]) => mockInstallDaemon(...args),
}))

describe('InstallDaemon command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./daemon.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./daemon.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should install daemon successfully', async () => {
    const { default: Command } = await import('./daemon.js')
    mockInstallDaemon.mockResolvedValue({
      success: true,
      version: '1.0.0',
    })

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: {},
    })

    await cmd.run()

    expect(mockInstallDaemon).toHaveBeenCalled()
  })

  it('should pass force flag to installDaemon', async () => {
    const { default: Command } = await import('./daemon.js')
    mockInstallDaemon.mockResolvedValue({
      success: true,
      version: '1.0.0',
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: {},
    })

    await cmd.run()

    expect(mockInstallDaemon).toHaveBeenCalledWith(
      expect.objectContaining({ force: true })
    )
  })
})
