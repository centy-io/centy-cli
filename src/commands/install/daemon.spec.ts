import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockCommand } from '../../testing/command-test-utils.js'

const mockInstallDaemon = vi.fn()

vi.mock('../../lib/install-binary/index.js', () => ({
  installDaemon: (...args: unknown[]) => mockInstallDaemon(...args),
}))

describe('InstallDaemon command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInstallDaemon.mockResolvedValue({
      binaryPath: '/Users/test/.centy/bin/centy-daemon',
      version: '1.0.0',
    })
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

  it('should call installDaemon', async () => {
    const { default: Command } = await import('./daemon.js')

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    await cmd.run()

    expect(mockInstallDaemon).toHaveBeenCalledWith(
      expect.objectContaining({
        version: undefined,
        onProgress: expect.any(Function),
      })
    )
  })

  it('should pass version flag to installDaemon', async () => {
    const { default: Command } = await import('./daemon.js')

    const cmd = createMockCommand(Command, {
      flags: { version: '0.1.0' },
      args: {},
    })

    await cmd.run()

    expect(mockInstallDaemon).toHaveBeenCalledWith(
      expect.objectContaining({
        version: '0.1.0',
      })
    )
  })
})
