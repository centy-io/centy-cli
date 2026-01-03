import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonUpdateIssue = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-update-issue.js', () => ({
  daemonUpdateIssue: (...args: unknown[]) => mockDaemonUpdateIssue(...args),
}))

vi.mock('../../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

vi.mock('../../utils/ensure-initialized.js', () => ({
  ensureInitialized: (...args: unknown[]) => mockEnsureInitialized(...args),
  NotInitializedError: class NotInitializedError extends Error {
    constructor(message = 'Not initialized') {
      super(message)
      this.name = 'NotInitializedError'
    }
  },
}))

describe('UpdateIssue command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./issue.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./issue.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should update issue title', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonUpdateIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'New Title' },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonUpdateIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/test/project',
        issueId: '1',
        title: 'New Title',
      })
    )
    expect(cmd.logs[0]).toContain('Updated issue #1')
  })

  it('should update issue status', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonUpdateIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      flags: { status: 'in-progress' },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonUpdateIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        issueId: '1',
        status: 'in-progress',
      })
    )
  })

  it('should update issue priority with named value', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonUpdateIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      flags: { priority: 'high' },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonUpdateIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        issueId: '1',
        priority: 1,
      })
    )
  })

  it('should update multiple fields at once', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonUpdateIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      flags: {
        title: 'New Title',
        description: 'New description',
        status: 'closed',
        priority: 'low',
      },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonUpdateIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Title',
        description: 'New description',
        status: 'closed',
        priority: 3,
      })
    )
  })

  it('should error when no fields specified', async () => {
    const { default: Command } = await import('./issue.js')

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors[0]).toContain('At least one field must be specified')
  })

  it('should handle update error', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonUpdateIssue.mockResolvedValue({
      success: false,
      error: 'Issue not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'New Title' },
      args: { id: '999' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Issue not found')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./issue.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { title: 'New Title' },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonUpdateIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'New Title', project: 'other-project' },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
  })
})
