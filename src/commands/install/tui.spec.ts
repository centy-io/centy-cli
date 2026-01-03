import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockCommand } from '../../testing/command-test-utils.js'

const mockInstallTui = vi.fn()

vi.mock('../../lib/install-binary/index.js', () => ({
  installTui: (...args: unknown[]) => mockInstallTui(...args),
}))

describe('InstallTui command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInstallTui.mockResolvedValue({
      binaryPath: '/Users/test/.centy/bin/centy-tui',
      version: '1.0.0',
    })
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./tui.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./tui.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should call installTui', async () => {
    const { default: Command } = await import('./tui.js')

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    await cmd.run()

    expect(mockInstallTui).toHaveBeenCalledWith(
      expect.objectContaining({
        version: undefined,
        onProgress: expect.any(Function),
      })
    )
  })

  it('should pass version flag to installTui', async () => {
    const { default: Command } = await import('./tui.js')

    const cmd = createMockCommand(Command, {
      flags: { version: '0.1.0' },
      args: {},
    })

    await cmd.run()

    expect(mockInstallTui).toHaveBeenCalledWith(
      expect.objectContaining({
        version: '0.1.0',
      })
    )
  })
})
