import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonListTempWorkspaces = vi.fn()
const mockResolveProjectPath = vi.fn()

vi.mock('../../daemon/daemon-list-temp-workspaces.js', () => ({
  daemonListTempWorkspaces: (...args: unknown[]) =>
    mockDaemonListTempWorkspaces(...args),
}))

vi.mock('../../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

describe('WorkspaceList command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./list.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./list.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should list workspaces successfully', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListTempWorkspaces.mockResolvedValue({
      workspaces: [
        {
          workspacePath: '/tmp/ws-1',
          issueDisplayNumber: 1,
          issueTitle: 'Test Issue',
          action: 'PLAN',
          createdAt: '2024-12-14T00:00:00Z',
          expiresAt: '2024-12-15T00:00:00Z',
        },
      ],
      totalCount: 1,
      expiredCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    await cmd.run()

    expect(mockDaemonListTempWorkspaces).toHaveBeenCalled()
    expect(cmd.logs.some(l => l.includes('1 workspace'))).toBe(true)
  })

  it('should show message when no workspaces found', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListTempWorkspaces.mockResolvedValue({
      workspaces: [],
      totalCount: 0,
      expiredCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    await cmd.run()

    expect(cmd.logs[0]).toContain('No temporary workspaces found')
  })

  it('should show expired count hint', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListTempWorkspaces.mockResolvedValue({
      workspaces: [
        {
          workspacePath: '/tmp/ws-1',
          issueDisplayNumber: 1,
          issueTitle: 'Test',
          action: 'PLAN',
          createdAt: '2024-12-14T00:00:00Z',
          expiresAt: '2024-12-15T00:00:00Z',
        },
      ],
      totalCount: 1,
      expiredCount: 5,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(l => l.includes('5 expired'))).toBe(true)
  })

  it('should pass include-expired flag', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListTempWorkspaces.mockResolvedValue({
      workspaces: [],
      totalCount: 0,
      expiredCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { 'include-expired': true },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonListTempWorkspaces).toHaveBeenCalledWith(
      expect.objectContaining({
        includeExpired: true,
      })
    )
  })
})
