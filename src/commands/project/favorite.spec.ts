import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonSetProjectFavorite = vi.fn()

vi.mock('../../daemon/daemon-set-project-favorite.js', () => ({
  daemonSetProjectFavorite: (...args: unknown[]) =>
    mockDaemonSetProjectFavorite(...args),
}))

describe('ProjectFavorite command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./favorite.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./favorite.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should add project to favorites successfully', async () => {
    const { default: Command } = await import('./favorite.js')
    mockDaemonSetProjectFavorite.mockResolvedValue({
      success: true,
      project: { name: 'My Project' },
    })

    const cmd = createMockCommand(Command, {
      flags: { off: false },
      args: { path: '/test/project' },
    })

    await cmd.run()

    expect(mockDaemonSetProjectFavorite).toHaveBeenCalledWith({
      projectPath: '/test/project',
      isFavorite: true,
    })
    expect(cmd.logs).toContain('Added to favorites: "My Project"')
  })

  it('should remove project from favorites with --off flag', async () => {
    const { default: Command } = await import('./favorite.js')
    mockDaemonSetProjectFavorite.mockResolvedValue({
      success: true,
      project: { name: 'My Project' },
    })

    const cmd = createMockCommand(Command, {
      flags: { off: true },
      args: { path: '/test/project' },
    })

    await cmd.run()

    expect(mockDaemonSetProjectFavorite).toHaveBeenCalledWith({
      projectPath: '/test/project',
      isFavorite: false,
    })
    expect(cmd.logs).toContain('Removed from favorites: "My Project"')
  })

  it('should use current directory when no path provided', async () => {
    const { default: Command } = await import('./favorite.js')
    mockDaemonSetProjectFavorite.mockResolvedValue({
      success: true,
      project: { name: 'Current Project' },
    })

    const cmd = createMockCommand(Command, {
      flags: { off: false },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonSetProjectFavorite).toHaveBeenCalledWith(
      expect.objectContaining({
        isFavorite: true,
      })
    )
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./favorite.js')
    mockDaemonSetProjectFavorite.mockResolvedValue({
      success: false,
      error: 'Project not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { off: false },
      args: { path: '/test/project' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not found')
  })
})
