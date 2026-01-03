import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonCloseTempWorkspace = vi.fn()

vi.mock('../../daemon/daemon-close-temp-workspace.js', () => ({
  daemonCloseTempWorkspace: (...args: unknown[]) =>
    mockDaemonCloseTempWorkspace(...args),
}))

describe('WorkspaceClose command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./close.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./close.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should close workspace successfully', async () => {
    const { default: Command } = await import('./close.js')
    mockDaemonCloseTempWorkspace.mockResolvedValue({
      success: true,
      worktreeRemoved: true,
      registryRemoved: true,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { path: '/tmp/centy-workspace-123' },
    })

    await cmd.run()

    expect(mockDaemonCloseTempWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({
        workspacePath: '/tmp/centy-workspace-123',
      })
    )
    expect(cmd.logs[0]).toContain('Workspace closed')
  })

  it('should handle close error', async () => {
    const { default: Command } = await import('./close.js')
    mockDaemonCloseTempWorkspace.mockResolvedValue({
      success: false,
      error: 'Workspace not found',
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { path: '/invalid/path' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Workspace not found')
  })

  it('should pass force flag', async () => {
    const { default: Command } = await import('./close.js')
    mockDaemonCloseTempWorkspace.mockResolvedValue({
      success: true,
      worktreeRemoved: true,
      registryRemoved: true,
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { path: '/tmp/workspace' },
    })

    await cmd.run()

    expect(mockDaemonCloseTempWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({
        force: true,
      })
    )
  })

  it('should show removal status', async () => {
    const { default: Command } = await import('./close.js')
    mockDaemonCloseTempWorkspace.mockResolvedValue({
      success: true,
      worktreeRemoved: true,
      registryRemoved: true,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { path: '/tmp/workspace' },
    })

    await cmd.run()

    expect(cmd.logs.some(l => l.includes('worktree'))).toBe(true)
    expect(cmd.logs.some(l => l.includes('Registry'))).toBe(true)
  })
})
