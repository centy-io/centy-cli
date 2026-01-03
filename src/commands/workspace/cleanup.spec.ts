import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonCleanupExpiredWorkspaces = vi.fn()

vi.mock('../../daemon/daemon-cleanup-expired-workspaces.js', () => ({
  daemonCleanupExpiredWorkspaces: (...args: unknown[]) =>
    mockDaemonCleanupExpiredWorkspaces(...args),
}))

describe('WorkspaceCleanup command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./cleanup.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./cleanup.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should cleanup workspaces successfully', async () => {
    const { default: Command } = await import('./cleanup.js')
    mockDaemonCleanupExpiredWorkspaces.mockResolvedValue({
      success: true,
      cleanedCount: 3,
      failedPaths: [],
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    await cmd.run()

    expect(mockDaemonCleanupExpiredWorkspaces).toHaveBeenCalledWith({})
    expect(cmd.logs[0]).toContain('3 expired workspace')
  })

  it('should show message when no expired workspaces', async () => {
    const { default: Command } = await import('./cleanup.js')
    mockDaemonCleanupExpiredWorkspaces.mockResolvedValue({
      success: true,
      cleanedCount: 0,
      failedPaths: [],
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    await cmd.run()

    expect(cmd.logs[0]).toContain('No expired workspaces')
  })

  it('should handle cleanup failure', async () => {
    const { default: Command } = await import('./cleanup.js')
    mockDaemonCleanupExpiredWorkspaces.mockResolvedValue({
      success: false,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Cleanup failed')
  })

  it('should warn about failed paths', async () => {
    const { default: Command } = await import('./cleanup.js')
    mockDaemonCleanupExpiredWorkspaces.mockResolvedValue({
      success: true,
      cleanedCount: 2,
      failedPaths: ['/tmp/failed-1', '/tmp/failed-2'],
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    await cmd.run()

    expect(cmd.warnings.some(w => w.includes('Failed to clean up'))).toBe(true)
    expect(cmd.warnings.some(w => w.includes('/tmp/failed-1'))).toBe(true)
  })
})
